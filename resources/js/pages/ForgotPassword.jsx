import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { IconEye, IconEyeSlash } from '../components/Icons';

export default function ForgotPassword() {
    const { forgotPassword, verifyResetCode, resetPassword } = useAuth();
    const navigate = useNavigate();

    // Steps: 'email' | 'code' | 'new-password' | 'success'
    const [step, setStep] = useState('email');

    // Step 1: Email state
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [emailLoading, setEmailLoading] = useState(false);

    // Step 2: OTP Code state
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [otpError, setOtpError] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [debugCode, setDebugCode] = useState(null);


    // Step 3: New Password state
    const [resetToken, setResetToken] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);

    const inputRefs = [
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null),
    ];

    // Password validation rules
    const rules = {
        minLen: password.length >= 8,
        hasUpper: /[A-Z]/.test(password),
        hasLower: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecial: /[@$!%*#?&]/.test(password),
        matches: password.length > 0 && password === passwordConfirmation,
    };

    const isPasswordValid = rules.minLen && rules.hasUpper && rules.hasLower && rules.hasNumber && rules.hasSpecial && rules.matches;

    // Focus first OTP input when reaching 'code' step
    useEffect(() => {
        if (step === 'code') {
            setTimeout(() => inputRefs[0].current?.focus(), 150);
        }
    }, [step]);

    // Resend cooldown timer
    useEffect(() => {
        let timer;
        if (resendCooldown > 0) {
            timer = setInterval(() => setResendCooldown((prev) => prev - 1), 1000);
        }
        return () => clearInterval(timer);
    }, [resendCooldown]);

    // Step 1: Submit Email
    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setEmailError('');

        if (!email || !email.includes('@')) {
            setEmailError('Ingresa una dirección de correo electrónico válida.');
            return;
        }

        setEmailLoading(true);
        try {
            const res = await forgotPassword(email);
            if (res?.debug_code) {
                setDebugCode(res.debug_code);
            }
            setStep('code');
            setResendCooldown(60);
        } catch (err) {

            if (err.response?.data?.errors?.email) {
                setEmailError(err.response.data.errors.email[0]);
            } else {
                setEmailError(err.response?.data?.message || 'Ocurrió un error al enviar el código de recuperación.');
            }
        } finally {
            setEmailLoading(false);
        }
    };

    // OTP Change Handlers
    const handleOtpChange = (index, value) => {
        const char = value.slice(-1);
        if (!/^[0-9]?$/.test(char)) return;

        const newOtp = [...otp];
        newOtp[index] = char;
        setOtp(newOtp);

        if (char && index < 5) {
            inputRefs[index + 1].current?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs[index - 1].current?.focus();
        }
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').trim();
        if (/^\d{6}$/.test(pastedData)) {
            const digits = pastedData.split('');
            setOtp(digits);
            inputRefs[5].current?.focus();
        }
    };

    // Step 2: Verify OTP Code
    const handleVerifyCodeSubmit = async (e) => {
        e.preventDefault();
        const code = otp.join('');
        setOtpError('');

        if (code.length !== 6) {
            setOtpError('Ingresa el código completo de 6 dígitos.');
            return;
        }

        setOtpLoading(true);
        try {
            const res = await verifyResetCode(email, code);
            setResetToken(res.reset_token);
            setStep('new-password');
        } catch (err) {
            if (err.response?.data?.errors?.code) {
                setOtpError(err.response.data.errors.code[0]);
            } else {
                setOtpError(err.response?.data?.message || 'Código de recuperación incorrecto o expirado.');
            }
        } finally {
            setOtpLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (resendCooldown > 0) return;
        setOtpError('');
        try {
            await forgotPassword(email);
            setResendCooldown(60);
        } catch (err) {
            setOtpError(err.response?.data?.message || 'Error al reenviar el código.');
        }
    };

    // Step 3: Reset Password
    const handleResetPasswordSubmit = async (e) => {
        e.preventDefault();
        setPasswordError('');

        if (!isPasswordValid) {
            setPasswordError('Por favor asegúrate de cumplir con todos los requisitos de la contraseña.');
            return;
        }

        setPasswordLoading(true);
        try {
            await resetPassword(email, resetToken, password, passwordConfirmation);
            setStep('success');
        } catch (err) {
            if (err.response?.data?.errors?.password) {
                setPasswordError(err.response.data.errors.password[0]);
            } else if (err.response?.data?.errors?.email) {
                setPasswordError(err.response.data.errors.email[0]);
            } else {
                setPasswordError(err.response?.data?.message || 'Error al restablecer la contraseña.');
            }
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-[#0A0F1F] flex items-center justify-center p-4 overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#0D8BFF]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#1E5EFF]/20 rounded-full blur-3xl pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="bg-[#041B5A]/80 backdrop-blur-xl rounded-3xl p-8 sm:p-10 w-full max-w-md border border-[#0D8BFF]/30 shadow-2xl shadow-[#0A0F1F] z-10"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <img
                        src="/images/logo.png"
                        alt="SafeWatch"
                        className="w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-3 object-contain filter drop-shadow-[0_10px_25px_rgba(13,139,255,0.45)] hover:scale-105 transition-transform duration-300"
                    />
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">SafeWatch</h1>
                    <p className="text-[#0D8BFF] font-medium text-sm mt-1">Recuperación de Contraseña</p>
                </div>

                <AnimatePresence mode="wait">
                    {/* STEP 1: EMAIL */}
                    {step === 'email' && (
                        <motion.div
                            key="step-email"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.25 }}
                        >
                            <div className="text-center mb-6">
                                <p className="text-sm text-slate-300">
                                    Ingresa el correo electrónico asociado a tu cuenta para recibir un código de recuperación.
                                </p>
                            </div>

                            {emailError && (
                                <div className="bg-red-500/20 border border-red-500/40 text-red-200 text-sm p-3.5 rounded-2xl mb-5 flex items-center gap-2">
                                    <svg className="w-5 h-5 flex-shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>{emailError}</span>
                                </div>
                            )}

                            <form onSubmit={handleEmailSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Correo Electrónico</label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-[#1466CC]/30 bg-white/10 text-white placeholder-slate-400 focus:bg-white/15 focus:border-[#0D8BFF] focus:ring-2 focus:ring-[#0D8BFF]/30 outline-none transition-all duration-200"
                                        placeholder="tu@correo.com"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={emailLoading}
                                    className="w-full py-3.5 bg-gradient-to-r from-[#0D8BFF] to-[#1E5EFF] hover:from-[#1E5EFF] hover:to-[#1466CC] text-white font-bold rounded-xl transition-all shadow-lg shadow-[#0D8BFF]/30 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                                >
                                    {emailLoading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            <span>Enviando código...</span>
                                        </>
                                    ) : (
                                        'Enviar Código'
                                    )}
                                </button>
                            </form>

                            <div className="text-center mt-6">
                                <Link to="/login" className="text-slate-400 hover:text-white text-sm font-medium transition inline-flex items-center gap-1.5">
                                    ← Volver a Iniciar Sesión
                                </Link>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 2: VERIFY OTP CODE */}
                    {step === 'code' && (
                        <motion.div
                            key="step-code"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.25 }}
                        >
                            <div className="text-center mb-6">
                                <div className="w-14 h-14 bg-[#0D8BFF]/20 border border-[#0D8BFF]/40 text-[#0D8BFF] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md shadow-[#0D8BFF]/20">
                                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                    </svg>
                                </div>
                                <h2 className="text-xl font-extrabold text-white">Código de Recuperación</h2>
                                <p className="text-xs text-slate-300 mt-1.5">
                                    Hemos enviado 6 dígitos a <strong className="text-white">{email}</strong>
                                </p>
                                {debugCode && (
                                    <div className="mt-2.5 p-2.5 rounded-xl bg-[#0D8BFF]/20 border border-[#0D8BFF]/40 text-cyan-300 text-xs font-bold flex items-center justify-center gap-2">
                                        <span>🔐 Código de Seguridad: <strong className="text-white tracking-widest text-sm font-black">{debugCode}</strong></span>
                                    </div>
                                )}
                            </div>


                            {otpError && (
                                <div className="bg-red-500/20 border border-red-500/40 text-red-200 text-sm p-3 rounded-xl mb-5 flex items-center gap-2">
                                    <svg className="w-4 h-4 flex-shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>{otpError}</span>
                                </div>
                            )}

                            <form onSubmit={handleVerifyCodeSubmit} className="space-y-6">
                                <div className="flex justify-center gap-2.5" onPaste={handleOtpPaste}>
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={inputRefs[index]}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                            className="w-11 h-14 text-center text-2xl font-black text-white border border-[#1466CC]/40 rounded-xl bg-white/10 focus:bg-white/20 focus:border-[#0D8BFF] focus:ring-2 focus:ring-[#0D8BFF]/40 outline-none transition-all"
                                        />
                                    ))}
                                </div>

                                <button
                                    type="submit"
                                    disabled={otpLoading || otp.join('').length !== 6}
                                    className="w-full py-3.5 bg-gradient-to-r from-[#0D8BFF] to-[#1E5EFF] hover:from-[#1E5EFF] hover:to-[#1466CC] text-white font-bold rounded-xl transition-all shadow-lg shadow-[#0D8BFF]/30 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {otpLoading ? 'Verificando...' : 'Verificar Código'}
                                </button>

                                <div className="flex items-center justify-between text-xs pt-1">
                                    <button
                                        type="button"
                                        onClick={() => setStep('email')}
                                        className="text-slate-400 hover:text-white font-medium transition"
                                    >
                                        ← Cambiar correo
                                    </button>

                                    <button
                                        type="button"
                                        disabled={resendCooldown > 0}
                                        onClick={handleResendCode}
                                        className="text-[#0D8BFF] font-bold hover:underline disabled:opacity-50 disabled:no-underline"
                                    >
                                        {resendCooldown > 0 ? `Reenviar en ${resendCooldown}s` : 'Reenviar código'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}

                    {/* STEP 3: NEW PASSWORD */}
                    {step === 'new-password' && (
                        <motion.div
                            key="step-new-password"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.25 }}
                        >
                            <div className="text-center mb-6">
                                <h2 className="text-xl font-extrabold text-white">Nueva Contraseña</h2>
                                <p className="text-xs text-slate-300 mt-1">Crea tu nueva contraseña segura</p>
                            </div>

                            {passwordError && (
                                <div className="bg-red-500/20 border border-red-500/40 text-red-200 text-sm p-3.5 rounded-2xl mb-5 flex items-center gap-2">
                                    <svg className="w-5 h-5 flex-shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>{passwordError}</span>
                                </div>
                            )}

                            <form onSubmit={handleResetPasswordSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Nueva Contraseña</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full px-4 py-3 pr-11 rounded-xl border border-[#1466CC]/30 bg-white/10 text-white placeholder-slate-400 focus:bg-white/15 focus:border-[#0D8BFF] focus:ring-2 focus:ring-[#0D8BFF]/30 outline-none transition-all duration-200"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition flex items-center justify-center p-1"
                                        >
                                            {showPassword ? <IconEye /> : <IconEyeSlash />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Confirmar Nueva Contraseña</label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            required
                                            value={passwordConfirmation}
                                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                                            className="w-full px-4 py-3 pr-11 rounded-xl border border-[#1466CC]/30 bg-white/10 text-white placeholder-slate-400 focus:bg-white/15 focus:border-[#0D8BFF] focus:ring-2 focus:ring-[#0D8BFF]/30 outline-none transition-all duration-200"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition flex items-center justify-center p-1"
                                        >
                                            {showConfirmPassword ? <IconEye /> : <IconEyeSlash />}
                                        </button>
                                    </div>
                                </div>

                                {/* Password requirements live checklist */}
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2 text-xs">
                                    <p className="font-bold text-slate-300 mb-1">Requisitos de la contraseña:</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                        <div className={`flex items-center gap-1.5 ${rules.minLen ? 'text-emerald-400 font-semibold' : 'text-slate-400'}`}>
                                            <span>{rules.minLen ? '✓' : '•'}</span> 8+ caracteres
                                        </div>
                                        <div className={`flex items-center gap-1.5 ${rules.hasUpper ? 'text-emerald-400 font-semibold' : 'text-slate-400'}`}>
                                            <span>{rules.hasUpper ? '✓' : '•'}</span> Mayúscula (A-Z)
                                        </div>
                                        <div className={`flex items-center gap-1.5 ${rules.hasLower ? 'text-emerald-400 font-semibold' : 'text-slate-400'}`}>
                                            <span>{rules.hasLower ? '✓' : '•'}</span> Minúscula (a-z)
                                        </div>
                                        <div className={`flex items-center gap-1.5 ${rules.hasNumber ? 'text-emerald-400 font-semibold' : 'text-slate-400'}`}>
                                            <span>{rules.hasNumber ? '✓' : '•'}</span> Número (0-9)
                                        </div>
                                        <div className={`flex items-center gap-1.5 ${rules.hasSpecial ? 'text-emerald-400 font-semibold' : 'text-slate-400'}`}>
                                            <span>{rules.hasSpecial ? '✓' : '•'}</span> Símbolo (@$!%*#?&)
                                        </div>
                                        <div className={`flex items-center gap-1.5 ${rules.matches ? 'text-emerald-400 font-semibold' : 'text-slate-400'}`}>
                                            <span>{rules.matches ? '✓' : '•'}</span> Coinciden
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={passwordLoading || !isPasswordValid}
                                    className="w-full py-3.5 bg-gradient-to-r from-[#0D8BFF] to-[#1E5EFF] hover:from-[#1E5EFF] hover:to-[#1466CC] text-white font-bold rounded-xl transition-all shadow-lg shadow-[#0D8BFF]/30 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                                >
                                    {passwordLoading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            <span>Guardando...</span>
                                        </>
                                    ) : (
                                        'Restablecer Contraseña'
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {/* STEP 4: SUCCESS */}
                    {step === 'success' && (
                        <motion.div
                            key="step-success"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className="text-center py-4 space-y-6"
                        >
                            <div className="w-20 h-20 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>

                            <div>
                                <h2 className="text-2xl font-black text-white">¡Contraseña Actualizada!</h2>
                                <p className="text-slate-300 text-sm mt-2">
                                    Tu contraseña ha sido restablecida exitosamente. Ya puedes acceder a tu cuenta SafeWatch con tus nuevas credenciales.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => navigate('/login')}
                                className="w-full py-3.5 bg-gradient-to-r from-[#0D8BFF] to-[#1E5EFF] hover:from-[#1E5EFF] hover:to-[#1466CC] text-white font-bold rounded-xl transition-all shadow-lg shadow-[#0D8BFF]/30"
                            >
                                Iniciar Sesión Ahora
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
