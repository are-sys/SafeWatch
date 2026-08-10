import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { IconEye, IconEyeSlash } from '../components/Icons';

export default function Login() {
    const { login, verify2fa, resend2fa } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Login Form State
    const [form, setForm] = useState({ email: location.state?.email || '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // 2FA Verification State
    const [step, setStep] = useState(location.state?.email ? '2fa' : 'login'); // 'login' | '2fa'
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [otpEmail, setOtpEmail] = useState(location.state?.email || '');
    const [otpMessage, setOtpMessage] = useState(location.state?.message || '');
    const [otpError, setOtpError] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(location.state?.email ? 60 : 0);
    const [debugCode, setDebugCode] = useState(location.state?.debug_code || null);

    const inputRefs = [
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null),
    ];

    // Auto-focus first input when entering 2fa step
    useEffect(() => {
        if (step === '2fa') {
            setTimeout(() => inputRefs[0].current?.focus(), 150);
        }
    }, [step]);

    // Countdown timer for resend
    useEffect(() => {
        let timer;
        if (resendCooldown > 0) {
            timer = setInterval(() => setResendCooldown((prev) => prev - 1), 1000);
        }
        return () => clearInterval(timer);
    }, [resendCooldown]);

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!form.email || !form.email.includes('@')) {
            setError('Ingresa una dirección de correo electrónico válida (ej. usuario@dominio.com).');
            return;
        }
        if (!form.password) {
            setError('Ingresa tu contraseña.');
            return;
        }

        setLoading(true);
        try {
            const res = await login(form.email, form.password);
            if (res?.requires_2fa) {
                setOtpEmail(res.email || form.email);
                setOtpMessage(res.message || 'Se ha enviado un código de confirmación de 6 dígitos a tu correo electrónico.');
                if (res.debug_code) {
                    setDebugCode(res.debug_code);
                }
                setStep('2fa');
                setResendCooldown(60);
                setTimeout(() => inputRefs[0].current?.focus(), 100);
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            if (err.response?.data?.errors?.email) {
                setError(err.response.data.errors.email[0]);
            } else if (err.response?.data?.errors?.password) {
                setError(err.response.data.errors.password[0]);
            } else {
                setError(err.response?.data?.message || 'Error al iniciar sesión. Comprueba tus credenciales.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Handle 2FA OTP Inputs
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

    const handleVerify2fa = async (e) => {
        e.preventDefault();
        const code = otp.join('');
        setOtpError('');

        if (code.length !== 6) {
            setOtpError('Ingresa el código completo de 6 dígitos.');
            return;
        }

        setOtpLoading(true);
        try {
            await verify2fa(otpEmail, code);
            navigate('/dashboard');
        } catch (err) {
            if (err.response?.data?.errors?.code) {
                setOtpError(err.response.data.errors.code[0]);
            } else {
                setOtpError(err.response?.data?.message || 'Código de verificación incorrecto.');
            }
        } finally {
            setOtpLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (resendCooldown > 0) return;
        setOtpError('');
        try {
            const res = await resend2fa(otpEmail);
            setOtpMessage(res.message || 'Código reenviado correctamente.');
            if (res.debug_code) {
                setDebugCode(res.debug_code);
            }
            setResendCooldown(60);
        } catch (err) {
            setOtpError(err.response?.data?.message || 'Error al reenviar el código.');
        }
    };

    return (
        <div className="relative min-h-screen bg-[#0A0F1F] flex items-center justify-center p-4 overflow-hidden">
            {/* Ambient Background Light Orbs */}
            <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#0D8BFF]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#1E5EFF]/20 rounded-full blur-3xl pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="bg-[#041B5A]/80 backdrop-blur-xl rounded-3xl p-8 sm:p-10 w-full max-w-md border border-[#0D8BFF]/30 shadow-2xl shadow-[#0A0F1F] z-10"
            >
                <div className="text-center mb-8">
                    <img
                        src="/images/logo.png"
                        alt="SafeWatch"
                        className="w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-3 object-contain filter drop-shadow-[0_10px_25px_rgba(13,139,255,0.45)] hover:scale-105 transition-transform duration-300"
                    />
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">SafeWatch</h1>
                    <p className="text-[#0D8BFF] font-medium text-sm mt-1">Monitoreo Médico Inteligente</p>
                </div>

                <AnimatePresence mode="wait">
                    {step === 'login' ? (
                        <motion.div
                            key="login-step"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.25 }}
                        >
                            {error && (
                                <div className="bg-red-500/20 border border-red-500/40 text-red-200 text-sm p-3.5 rounded-2xl mb-5 flex items-center gap-2">
                                    <svg className="w-5 h-5 flex-shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>{error}</span>
                                </div>
                            )}

                            <form onSubmit={handleLoginSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Correo Electrónico</label>
                                    <input
                                        type="email"
                                        required
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-[#1466CC]/30 bg-white/10 text-white placeholder-slate-400 focus:bg-white/15 focus:border-[#0D8BFF] focus:ring-2 focus:ring-[#0D8BFF]/30 outline-none transition-all duration-200"
                                        placeholder="tu@correo.com"
                                    />
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">Contraseña</label>
                                        <Link to="/forgot-password" className="text-xs text-[#0D8BFF] font-semibold hover:underline hover:text-white transition">
                                            ¿Olvidaste tu contraseña?
                                        </Link>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            value={form.password}
                                            onChange={(e) => setForm({ ...form, password: e.target.value })}
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

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3.5 bg-gradient-to-r from-[#0D8BFF] to-[#1E5EFF] hover:from-[#1E5EFF] hover:to-[#1466CC] text-white font-bold rounded-xl transition-all shadow-lg shadow-[#0D8BFF]/30 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            <span>Iniciando...</span>
                                        </>
                                    ) : (
                                        'Iniciar Sesión'
                                    )}
                                </button>
                            </form>

                            <p className="text-center text-sm text-slate-300 mt-6">
                                ¿No tienes cuenta?{' '}
                                <Link to="/register" className="text-[#0D8BFF] font-bold hover:underline hover:text-white transition">
                                    Regístrate aquí
                                </Link>
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="2fa-step"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.25 }}
                        >
                            <div className="text-center mb-6">
                                <div className="w-14 h-14 bg-[#0D8BFF]/20 border border-[#0D8BFF]/40 text-[#0D8BFF] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md shadow-[#0D8BFF]/20">
                                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <h2 className="text-xl font-extrabold text-white">Verificación de Código</h2>
                                <p className="text-xs text-slate-300 mt-1.5">
                                    {otpMessage} (<strong className="text-white">{otpEmail}</strong>)
                                </p>
                            </div>

                            {otpError && (
                                <div className="bg-red-500/20 border border-red-500/40 text-red-200 text-sm p-3 rounded-xl mb-5 flex items-center gap-2">
                                    <svg className="w-4 h-4 flex-shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>{otpError}</span>
                                </div>
                            )}

                            <form onSubmit={handleVerify2fa} className="space-y-6">
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
                                    {otpLoading ? 'Verificando...' : 'Verificar y Acceder'}
                                </button>

                                <div className="flex items-center justify-between text-xs pt-1">
                                    <button
                                        type="button"
                                        onClick={() => setStep('login')}
                                        className="text-slate-400 hover:text-white font-medium transition"
                                    >
                                        ← Volver al login
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
                </AnimatePresence>
            </motion.div>
        </div>
    );
}

