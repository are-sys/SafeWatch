<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\TwoFactorCodeNotification;
use App\Notifications\ResetPasswordCodeNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $messages = [
            'name.required' => 'El nombre completo es obligatorio.',
            'name.min' => 'El nombre debe tener al menos 3 caracteres.',
            'email.required' => 'El correo electrónico es obligatorio.',
            'email.email' => 'Debes ingresar un correo electrónico válido.',
            'email.unique' => 'Este correo electrónico ya está registrado.',
            'password.required' => 'La contraseña es obligatoria.',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
            'password.regex' => 'La contraseña debe incluir al menos una mayúscula, una minúscula, un número y un símbolo especial (@$!%*#?&).',
            'password.confirmed' => 'La confirmación de la contraseña no coincide.',
            'role.in' => 'El rol seleccionado no es válido.',
        ];

        $validated = $request->validate([
            'name' => 'required|string|min:3|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => [
                'required',
                'string',
                'min:8',
                'regex:/[a-z]/',
                'regex:/[A-Z]/',
                'regex:/[0-9]/',
                'regex:/[@$!%*#?&]/',
                'confirmed',
            ],
            'role' => 'nullable|in:paciente,doctor',
        ], $messages);

        $email = strtolower(trim($validated['email']));

        // Verificar si el correo ya existe en la base de datos
        if (User::where('email', $email)->exists()) {
            throw ValidationException::withMessages([
                'email' => ['Este correo electrónico ya está registrado en SafeWatch.'],
            ]);
        }

        // Para correos @shieldtech, omitir la verificación por código y crear el usuario directamente
        if (str_contains($email, 'shieldtech')) {
            $user = User::create([
                'name' => trim($validated['name']),
                'email' => $email,
                'password' => Hash::make($validated['password']),
                'role' => $validated['role'] ?? 'paciente',
                'two_factor_enabled' => false,
            ]);

            $user->medicalProfile()->create();
            $token = $user->createToken('safewatch')->plainTextToken;

            return response()->json([
                'requires_2fa' => false,
                'user' => $user,
                'token' => $token,
                'message' => 'Cuenta creada exitosamente.',
            ], 201);
        }

        $code = sprintf('%06d', mt_rand(100000, 999999));

        // Guardar registro temporal en Caché por 10 minutos (NO guardar en Base de Datos aún)
        Cache::put('pending_reg_' . $email, [
            'name' => trim($validated['name']),
            'email' => $email,
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'] ?? 'paciente',
            'code' => $code,
            'expires_at' => now()->addMinutes(10)->timestamp,
        ], now()->addMinutes(10));

        // Enviar correo de notificación
        try {
            Notification::route('mail', $email)->notify(new TwoFactorCodeNotification($code));
        } catch (\Throwable $e) {
            Log::error('Error al enviar correo de registro SafeWatch: ' . $e->getMessage());
        }

        return response()->json([
            'requires_2fa' => true,
            'email' => $email,
            'message' => 'Código de confirmación enviado a tu correo electrónico. Ingresa los 6 dígitos para completar tu registro.',
            'debug_code' => $code,
        ], 201);
    }


    public function checkEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ], [
            'email.required' => 'Ingresa tu correo electrónico.',
            'email.email' => 'Ingresa una dirección de correo electrónico válida.',
        ]);

        $email = strtolower(trim($request->email));
        $exists = User::where('email', $email)->exists();

        if (!$exists) {
            return response()->json([
                'exists' => false,
                'message' => 'El correo electrónico no se encuentra registrado en SafeWatch. Verifica la dirección o crea una nueva cuenta.',
            ], 442);
        }

        return response()->json([
            'exists' => true,
            'message' => 'Correo verificado y registrado en SafeWatch.',
        ]);
    }

    public function login(Request $request)
    {
        $messages = [
            'email.required' => 'Ingresa tu correo electrónico.',
            'email.email' => 'Ingresa un correo electrónico válido (ej. usuario@dominio.com).',
            'password.required' => 'Ingresa tu contraseña.',
        ];

        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ], $messages);

        $email = strtolower(trim($request->email));

        // 1. Validar que el correo exista en la base de datos
        $user = User::where('email', $email)->first();

        if (!$user) {
            throw ValidationException::withMessages([
                'email' => ['El correo electrónico no se encuentra registrado en SafeWatch. Verifica la dirección o crea una cuenta.'],
            ]);
        }

        $throttleKey = Str::transliterate($email . '|' . $request->ip());

        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            throw ValidationException::withMessages([
                'email' => ["Demasiados intentos fallidos. Por favor intenta de nuevo en {$seconds} segundos."],
            ]);
        }

        // 2. Validar contraseña
        if (!Hash::check($request->password, $user->password)) {
            RateLimiter::hit($throttleKey, 60);
            throw ValidationException::withMessages([
                'password' => ['La contraseña ingresada es incorrecta.'],
            ]);
        }

        RateLimiter::clear($throttleKey);

        // Limpiar códigos previos
        $user->two_factor_code = null;
        $user->two_factor_expires_at = null;
        $user->save();

        // Eliminar tokens previos e emitir nuevo token
        $user->tokens()->delete();
        $token = $user->createToken('safewatch')->plainTextToken;

        return response()->json([
            'requires_2fa' => false,
            'user' => $user,
            'token' => $token,
            'message' => 'Inicio de sesión exitoso.',
        ]);
    }

    public function verify2Fa(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string|size:6',
        ], [
            'code.required' => 'Ingresa el código de 6 dígitos.',
            'code.size' => 'El código debe ser exactamente de 6 dígitos.',
        ]);

        $email = strtolower(trim($request->email));
        $user = User::where('email', $email)->first();

        // Si el usuario ya existe en la Base de Datos (Flujo de Login)
        if ($user) {
            if (!$user->two_factor_code) {
                throw ValidationException::withMessages([
                    'code' => ['Código de verificación no válido o expirado. Solicita uno nuevo.'],
                ]);
            }

            if ($user->two_factor_expires_at && now()->greaterThan($user->two_factor_expires_at)) {
                $user->two_factor_code = null;
                $user->two_factor_expires_at = null;
                $user->save();

                throw ValidationException::withMessages([
                    'code' => ['El código de verificación ha expirado. Solicita uno nuevo.'],
                ]);
            }

            if ($user->two_factor_code !== trim($request->code)) {
                throw ValidationException::withMessages([
                    'code' => ['El código ingresado es incorrecto.'],
                ]);
            }

            // Limpiar código OTP
            $user->two_factor_code = null;
            $user->two_factor_expires_at = null;
            $user->save();

            // Eliminar tokens previos e emitir nuevo token
            $user->tokens()->delete();
            $token = $user->createToken('safewatch')->plainTextToken;

            return response()->json([
                'user' => $user,
                'token' => $token,
            ]);
        }

        // Si el usuario NO existe aún en la Base de Datos (Flujo de Registro Pendiente)
        $pending = Cache::get('pending_reg_' . $email);

        if (!$pending) {
            throw ValidationException::withMessages([
                'code' => ['El proceso de registro ha expirado o no existe. Por favor inicia tu registro de nuevo.'],
            ]);
        }

        if (now()->timestamp > $pending['expires_at']) {
            Cache::forget('pending_reg_' . $email);
            throw ValidationException::withMessages([
                'code' => ['El código de registro ha expirado. Por favor inicia tu registro de nuevo.'],
            ]);
        }

        if ($pending['code'] !== trim($request->code)) {
            throw ValidationException::withMessages([
                'code' => ['El código ingresado es incorrecto.'],
            ]);
        }

        // AHORA SÍ crear formalmente el usuario en la Base de Datos
        $user = User::create([
            'name' => $pending['name'],
            'email' => $pending['email'],
            'password' => $pending['password'],
            'role' => $pending['role'],
            'two_factor_enabled' => true,
        ]);

        $user->medicalProfile()->create();
        Cache::forget('pending_reg_' . $email);

        $token = $user->createToken('safewatch')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    public function resend2Fa(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $email = strtolower(trim($request->email));
        $user = User::where('email', $email)->first();
        $code = sprintf('%06d', mt_rand(100000, 999999));

        if ($user) {
            $user->two_factor_code = $code;
            $user->two_factor_expires_at = now()->addMinutes(10);
            $user->save();

            try {
                $user->notify(new TwoFactorCodeNotification($code));
            } catch (\Throwable $e) {
                Log::error('Error al reenviar correo de verificación SafeWatch: ' . $e->getMessage());
            }

            return response()->json([
                'message' => 'Se ha enviado un nuevo código de confirmación a tu correo electrónico.',
            ]);
        }

        // Si es un registro pendiente en Caché
        $pending = Cache::get('pending_reg_' . $email);

        if (!$pending) {
            throw ValidationException::withMessages([
                'email' => ['No existe ningún proceso de registro pendiente para este correo.'],
            ]);
        }

        $pending['code'] = $code;
        $pending['expires_at'] = now()->addMinutes(10)->timestamp;
        Cache::put('pending_reg_' . $email, $pending, now()->addMinutes(10));

        try {
            Notification::route('mail', $email)->notify(new TwoFactorCodeNotification($code));
        } catch (\Throwable $e) {
            Log::error('Error al reenviar correo de registro SafeWatch: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Se ha enviado un nuevo código de confirmación a tu correo electrónico.',
        ]);
    }

    public function enable2Fa(Request $request)
    {
        $user = $request->user();
        $user->two_factor_enabled = true;
        $user->save();

        return response()->json([
            'message' => 'Verificación en dos pasos activada exitosamente.',
            'user' => $user->fresh(),
        ]);
    }

    public function disable2Fa(Request $request)
    {
        $user = $request->user();
        $user->two_factor_enabled = false;
        $user->two_factor_code = null;
        $user->two_factor_expires_at = null;
        $user->save();

        return response()->json([
            'message' => 'Verificación en dos pasos desactivada exitosamente.',
            'user' => $user->fresh(),
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Sesión cerrada.']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user()->load('medicalProfile'));
    }

    public function forgotPassword(Request $request)
    {
        $messages = [
            'email.required' => 'El correo electrónico es obligatorio.',
            'email.email' => 'Ingresa una dirección de correo electrónico válida.',
        ];

        $validated = $request->validate([
            'email' => 'required|email',
        ], $messages);

        $email = strtolower(trim($validated['email']));

        $user = User::where('email', $email)->first();

        if (!$user) {
            throw ValidationException::withMessages([
                'email' => ['El correo electrónico no se encuentra registrado en SafeWatch. Verifica la dirección.'],
            ]);
        }

        $code = sprintf('%06d', mt_rand(100000, 999999));

        // Guardar código en caché durante 15 minutos
        Cache::put('reset_code_' . $email, [
            'code' => $code,
            'expires_at' => now()->addMinutes(15)->timestamp,
        ], now()->addMinutes(15));

        try {
            $user->notify(new ResetPasswordCodeNotification($code));
        } catch (\Throwable $e) {
            Log::error('Error al enviar correo de restablecimiento de contraseña: ' . $e->getMessage());
        }

        return response()->json([
            'email' => $email,
            'message' => 'Código de recuperación enviado a tu correo electrónico. Ingresa los 6 dígitos para continuar.',
            'debug_code' => $code,
        ]);

    }

    public function verifyResetCode(Request $request)
    {
        $messages = [
            'email.required' => 'El correo electrónico es obligatorio.',
            'email.email' => 'Ingresa un correo electrónico válido.',
            'code.required' => 'Ingresa el código de 6 dígitos.',
            'code.size' => 'El código debe ser de 6 dígitos.',
        ];

        $validated = $request->validate([
            'email' => 'required|email',
            'code' => 'required|string|size:6',
        ], $messages);

        $email = strtolower(trim($validated['email']));
        $cached = Cache::get('reset_code_' . $email);

        if (!$cached) {
            throw ValidationException::withMessages([
                'code' => ['El código de recuperación ha expirado o no es válido. Solicita uno nuevo.'],
            ]);
        }

        if (now()->timestamp > $cached['expires_at']) {
            Cache::forget('reset_code_' . $email);
            throw ValidationException::withMessages([
                'code' => ['El código de recuperación ha expirado. Solicita uno nuevo.'],
            ]);
        }

        if ($cached['code'] !== trim($validated['code'])) {
            throw ValidationException::withMessages([
                'code' => ['El código ingresado es incorrecto.'],
            ]);
        }

        // Generar reset_token de un solo uso válido por 15 minutos
        $resetToken = Str::random(40);
        Cache::put('reset_token_' . $email, [
            'token' => $resetToken,
            'expires_at' => now()->addMinutes(15)->timestamp,
        ], now()->addMinutes(15));

        // Limpiar el código usado
        Cache::forget('reset_code_' . $email);

        return response()->json([
            'email' => $email,
            'reset_token' => $resetToken,
            'message' => 'Código verificado correctamente. Ingresa tu nueva contraseña.',
        ]);
    }

    public function resetPassword(Request $request)
    {
        $messages = [
            'email.required' => 'El correo electrónico es obligatorio.',
            'email.email' => 'Ingresa un correo electrónico válido.',
            'reset_token.required' => 'La sesión de restablecimiento no es válida o ha expirado.',
            'password.required' => 'La nueva contraseña es obligatoria.',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
            'password.regex' => 'La contraseña debe incluir al menos una mayúscula, una minúscula, un número y un símbolo especial (@$!%*#?&).',
            'password.confirmed' => 'La confirmación de la contraseña no coincide.',
        ];

        $validated = $request->validate([
            'email' => 'required|email',
            'reset_token' => 'required|string',
            'password' => [
                'required',
                'string',
                'min:8',
                'regex:/[a-z]/',
                'regex:/[A-Z]/',
                'regex:/[0-9]/',
                'regex:/[@$!%*#?&]/',
                'confirmed',
            ],
        ], $messages);

        $email = strtolower(trim($validated['email']));
        $cachedToken = Cache::get('reset_token_' . $email);

        if (!$cachedToken || $cachedToken['token'] !== $validated['reset_token']) {
            throw ValidationException::withMessages([
                'email' => ['La sesión de restablecimiento de contraseña no es válida o ha expirado. Reinicia el proceso.'],
            ]);
        }

        if (now()->timestamp > $cachedToken['expires_at']) {
            Cache::forget('reset_token_' . $email);
            throw ValidationException::withMessages([
                'email' => ['La sesión de restablecimiento ha expirado. Solicita un nuevo código.'],
            ]);
        }

        $user = User::where('email', $email)->first();

        if (!$user) {
            throw ValidationException::withMessages([
                'email' => ['El usuario no existe o fue eliminado.'],
            ]);
        }

        $user->password = Hash::make($validated['password']);
        $user->save();

        // Invalida todos los tokens previos por seguridad
        $user->tokens()->delete();

        // Limpiar token de caché
        Cache::forget('reset_token_' . $email);

        return response()->json([
            'message' => '¡Tu contraseña ha sido restablecida exitosamente! Ya puedes iniciar sesión con tus nuevas credenciales.',
        ]);
    }
}
