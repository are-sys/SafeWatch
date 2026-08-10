<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\ResetPasswordCodeNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_forgot_password_sends_notification_for_existing_user()
    {
        Notification::fake();

        $user = User::create([
            'name' => 'Usuario Reset',
            'email' => 'reset@ejemplo.com',
            'password' => Hash::make('OldPassword123!'),
            'role' => 'paciente',
        ]);

        $response = $this->postJson('/api/forgot-password', [
            'email' => 'reset@ejemplo.com',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'email' => 'reset@ejemplo.com',
            ]);

        Notification::assertSentTo($user, ResetPasswordCodeNotification::class);
        $this->assertTrue(Cache::has('reset_code_reset@ejemplo.com'));
    }

    public function test_forgot_password_fails_for_non_existing_user()
    {
        $response = $this->postJson('/api/forgot-password', [
            'email' => 'noexiste@ejemplo.com',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_verify_reset_code_validates_correctly()
    {
        $email = 'reset@ejemplo.com';
        Cache::put('reset_code_' . $email, [
            'code' => '123456',
            'expires_at' => now()->addMinutes(15)->timestamp,
        ], now()->addMinutes(15));

        // Invalid code
        $failResponse = $this->postJson('/api/verify-reset-code', [
            'email' => $email,
            'code' => '999999',
        ]);
        $failResponse->assertStatus(422)->assertJsonValidationErrors(['code']);

        // Valid code
        $successResponse = $this->postJson('/api/verify-reset-code', [
            'email' => $email,
            'code' => '123456',
        ]);

        $successResponse->assertStatus(200)
            ->assertJsonStructure(['email', 'reset_token', 'message']);

        $this->assertTrue(Cache::has('reset_token_' . $email));
    }

    public function test_reset_password_updates_user_password()
    {
        $user = User::create([
            'name' => 'Usuario Reset Complete',
            'email' => 'complete@ejemplo.com',
            'password' => Hash::make('OldPassword123!'),
            'role' => 'paciente',
        ]);

        $email = 'complete@ejemplo.com';
        $resetToken = 'test-reset-token-1234567890';

        Cache::put('reset_token_' . $email, [
            'token' => $resetToken,
            'expires_at' => now()->addMinutes(15)->timestamp,
        ], now()->addMinutes(15));

        $response = $this->postJson('/api/reset-password', [
            'email' => $email,
            'reset_token' => $resetToken,
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => '¡Tu contraseña ha sido restablecida exitosamente! Ya puedes iniciar sesión con tus nuevas credenciales.',
            ]);

        $user->refresh();
        $this->assertTrue(Hash::check('NewPassword123!', $user->password));
    }
}
