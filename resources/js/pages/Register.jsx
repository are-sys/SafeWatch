import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { IconEye, IconEyeSlash } from '../components/Icons';

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'paciente'
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // Requisitos de contraseña
    const passwordRequirements = [
        { label: 'Mínimo 8 caracteres', test: (p) => p.length >= 8 },
        { label: 'Al menos una letra mayúscula (A-Z)', test: (p) => /[A-Z]/.test(p) },
        { label: 'Al menos una letra minúscula (a-z)', test: (p) => /[a-z]/.test(p) },
        { label: 'Al menos un número (0-9)', test: (p) => /[0-9]/.test(p) },
        { label: 'Un carácter especial (@$!%*#?&)', test: (p) => /[@$!%*#?&]/.test(p) },
    ];

    const passedRequirements = passwordRequirements.filter(r => r.test(form.password));
    const strengthScore = passedRequirements.length;

    const getStrengthLabel = () => {
        if (!form.password) return { text: '', color: 'bg-slate-700', width: 'w-0' };
        if (strengthScore <= 2) return { text: 'Débil', color: 'bg-rose-500', width: 'w-1/3', textColor: 'text-rose-400' };
        if (strengthScore <= 4) return { text: 'Media', color: 'bg-amber-500', width: 'w-2/3', textColor: 'text-amber-400' };
        return { text: 'Fuerte', color: 'bg-[#0D8BFF]', width: 'w-full', textColor: 'text-[#0D8BFF]' };
    };

    const strengthInfo = getStrengthLabel();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        const clientErrors = {};
        if (form.name.trim().length < 3) {
            clientErrors.name = ['El nombre debe tener al menos 3 caracteres.'];
        }
        if (strengthScore < 5) {
            clientErrors.password = ['La contraseña no cumple con todos los requisitos de seguridad.'];
        }
        if (form.password !== form.password_confirmation) {
            clientErrors.password_confirmation = ['Las contraseñas no coinciden.'];
        }

        if (Object.keys(clientErrors).length > 0) {
            setErrors(clientErrors);
            return;
        }

        setLoading(true);
        try {
            const res = await register(form.name, form.email, form.password, form.password_confirmation, form.role);
            if (res?.requires_2fa) {
                // Redigir a la pantalla de verificación de código en Login
                navigate('/login', { 
                    state: { 
                        email: form.email, 
                        message: res.message || 'Cuenta registrada. Por favor ingresa el código de confirmación de 6 dígitos enviado a tu correo.',
                        debug_code: res.debug_code 
                    } 
                });
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            if (err.response?.data?.errors) {
                setErrors(err.response.data.errors);
            } else if (err.response?.data?.message) {
                setErrors({ general: [err.response.data.message] });
            } else {
                setErrors({ general: ['Error al registrar la cuenta. Intenta de nuevo.'] });
            }
        } finally {
            setLoading(false);
        }
    };

    const set = (key) => (e) => {
        setForm({ ...form, [key]: e.target.value });
        if (errors[key]) {
            setErrors({ ...errors, [key]: null });
        }
    };

    return (
        <div className="relative min-h-screen bg-[#0A0F1F] flex items-center justify-center p-4 py-8 overflow-hidden">
            {/* Ambient Background Light Orbs */}
            <div className="absolute top-1/4 -right-20 w-96 h-96 bg-[#0D8BFF]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-[#1E5EFF]/20 rounded-full blur-3xl pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="bg-[#041B5A]/80 backdrop-blur-xl rounded-3xl p-8 sm:p-10 w-full max-w-lg border border-[#0D8BFF]/30 shadow-2xl shadow-[#0A0F1F] z-10 my-6"
            >
                <div className="text-center mb-8">
                    <img 
                        src="/images/logo.png" 
                        alt="SafeWatch" 
                        className="w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-3 object-contain filter drop-shadow-[0_10px_25px_rgba(13,139,255,0.45)] hover:scale-105 transition-transform duration-300" 
                    />
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">Crear Cuenta</h1>
                    <p className="text-[#0D8BFF] font-medium text-sm mt-1">Monitoreo médico en tiempo real y alta seguridad</p>
                </div>

                {errors.general && (
                    <div className="bg-red-500/20 border border-red-500/40 text-red-200 text-sm p-3.5 rounded-2xl mb-5 flex items-center gap-2">
                        <svg className="w-5 h-5 flex-shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{errors.general[0]}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Nombre Completo</label>
                        <input
                            type="text"
                            required
                            value={form.name}
                            onChange={set('name')}
                            className={`w-full px-4 py-3 rounded-xl border bg-white/10 text-white placeholder-slate-400 focus:bg-white/15 focus:border-[#0D8BFF] focus:ring-2 focus:ring-[#0D8BFF]/30 outline-none transition ${
                                errors.name ? 'border-red-400/50 bg-red-500/10' : 'border-[#1466CC]/30'
                            }`}
                            placeholder="Ej. María García"
                        />
                        {errors.name && <p className="text-red-400 text-xs font-semibold mt-1">{errors.name[0]}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Correo Electrónico</label>
                        <input
                            type="email"
                            required
                            value={form.email}
                            onChange={set('email')}
                            className={`w-full px-4 py-3 rounded-xl border bg-white/10 text-white placeholder-slate-400 focus:bg-white/15 focus:border-[#0D8BFF] focus:ring-2 focus:ring-[#0D8BFF]/30 outline-none transition ${
                                errors.email ? 'border-red-400/50 bg-red-500/10' : 'border-[#1466CC]/30'
                            }`}
                            placeholder="tu@correo.com"
                        />
                        {errors.email && <p className="text-red-400 text-xs font-semibold mt-1">{errors.email[0]}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Tipo de Usuario</label>
                        <select
                            value={form.role}
                            onChange={set('role')}
                            className="w-full px-4 py-3 rounded-xl border border-[#1466CC]/30 bg-[#041B5A] text-white focus:bg-[#0A2F8F] focus:border-[#0D8BFF] focus:ring-2 focus:ring-[#0D8BFF]/30 outline-none transition cursor-pointer"
                        >
                            <option value="paciente">Paciente</option>
                            <option value="doctor">Doctor / Profesional Médico</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Contraseña</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={form.password}
                                onChange={set('password')}
                                className={`w-full px-4 py-3 pr-11 rounded-xl border bg-white/10 text-white placeholder-slate-400 focus:bg-white/15 focus:border-[#0D8BFF] focus:ring-2 focus:ring-[#0D8BFF]/30 outline-none transition ${
                                    errors.password ? 'border-red-400/50 bg-red-500/10' : 'border-[#1466CC]/30'
                                }`}
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
                        {errors.password && <p className="text-red-400 text-xs font-semibold mt-1">{errors.password[0]}</p>}

                        {/* Medidor de Fortaleza */}
                        {form.password && (
                            <div className="mt-3 p-3.5 bg-black/20 rounded-xl border border-white/10 space-y-2">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-400 font-medium">Fortaleza de la contraseña:</span>
                                    <span className={`font-bold ${strengthInfo.textColor}`}>{strengthInfo.text}</span>
                                </div>
                                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div className={`h-full transition-all duration-300 ${strengthInfo.color} ${strengthInfo.width}`} />
                                </div>
                                <div className="space-y-1 pt-1">
                                    {passwordRequirements.map((req, i) => {
                                        const isMet = req.test(form.password);
                                        return (
                                            <div key={i} className="flex items-center gap-2 text-xs">
                                                {isMet ? (
                                                    <svg className="w-3.5 h-3.5 text-[#0D8BFF] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                ) : (
                                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-600 mx-1 flex-shrink-0" />
                                                )}
                                                <span className={isMet ? 'text-slate-200 font-medium' : 'text-slate-400'}>
                                                    {req.label}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Confirmar Contraseña</label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                required
                                value={form.password_confirmation}
                                onChange={set('password_confirmation')}
                                className={`w-full px-4 py-3 pr-11 rounded-xl border bg-white/10 text-white placeholder-slate-400 focus:bg-white/15 focus:border-[#0D8BFF] focus:ring-2 focus:ring-[#0D8BFF]/30 outline-none transition ${
                                    errors.password_confirmation ? 'border-red-400/50 bg-red-500/10' : 'border-[#1466CC]/30'
                                }`}
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
                        {form.password_confirmation && form.password !== form.password_confirmation && (
                            <p className="text-red-400 text-xs font-semibold mt-1">Las contraseñas no coinciden.</p>
                        )}
                        {form.password_confirmation && form.password === form.password_confirmation && (
                            <p className="text-[#0D8BFF] text-xs font-semibold mt-1 flex items-center gap-1">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                Las contraseñas coinciden.
                            </p>
                        )}
                        {errors.password_confirmation && <p className="text-red-400 text-xs font-semibold mt-1">{errors.password_confirmation[0]}</p>}
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
                                <span>Registrando cuenta...</span>
                            </>
                        ) : (
                            'Crear Cuenta'
                        )}
                    </button>
                </form>

                <p className="text-center text-sm text-slate-300 mt-6">
                    ¿Ya tienes una cuenta?{' '}
                    <Link to="/login" className="text-[#0D8BFF] font-bold hover:underline hover:text-white transition">
                        Iniciar Sesión
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}

