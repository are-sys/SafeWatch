import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import PageTransition from '../components/PageTransition';
import { useAuth } from '../context/AuthContext';

// --- SVG Icons ---
const IconShieldCheck = ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
);

const IconUser = ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const IconHeartPulse = ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
);

const IconLocation = ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const IconPhoneCall = ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
);

const IconDoctor = ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
);

const IconPill = ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a6.5 6.5 0 00-9.192-9.192l-5.656 5.656a6.5 6.5 0 109.192 9.192l5.656-5.656z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.879 10.879l4.242 4.242" />
    </svg>
);

const IconSparkles = ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
);

const IconCheckCircle = ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const bloodTypes = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];
const genders = [
    { value: 'masculino', label: 'Masculino' },
    { value: 'femenino', label: 'Femenino' },
    { value: 'otro', label: 'Otro' },
    { value: 'prefiero_no_decir', label: 'Prefiero no decir' },
];

const TABS = [
    { id: 'all', label: 'Vista General', icon: IconSparkles },
    { id: 'personal', label: 'Datos Personales', icon: IconUser },
    { id: 'insurance', label: 'Seguro y GPS', icon: IconLocation },
    { id: 'emergency', label: 'Contactos y Doctor', icon: IconPhoneCall },
    { id: 'medical', label: 'Historial Médico', icon: IconPill },
];

// Helper Input component with styling and optional icon
function InputField({ label, icon: Icon, error, hint, className = '', ...props }) {
    return (
        <div className={`space-y-1.5 ${className}`}>
            {label && (
                <label className="block text-xs font-semibold text-slate-700 tracking-wide">
                    {label}
                </label>
            )}
            <div className="relative flex items-center">
                {Icon && (
                    <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                        <Icon className="w-4 h-4" />
                    </div>
                )}
                <input
                    {...props}
                    className={`w-full text-sm font-medium text-slate-800 bg-slate-50/80 border border-slate-200 rounded-2xl transition-all duration-200 placeholder:text-slate-400 focus:bg-white focus:border-[#0D8BFF] focus:ring-4 focus:ring-[#0D8BFF]/15 outline-none ${
                        Icon ? 'pl-10 pr-3.5 py-2.5' : 'px-3.5 py-2.5'
                    } ${props.disabled ? 'opacity-60 cursor-not-allowed bg-slate-100' : ''}`}
                />
            </div>
            {hint && <p className="text-[11px] text-slate-400 font-medium">{hint}</p>}
            {error && <p className="text-[11px] text-rose-500 font-semibold">{error}</p>}
        </div>
    );
}

// Section Container with Card styling and framer motion
function SectionCard({ title, subtitle, icon: Icon, children, badge, id, activeTab }) {
    if (activeTab !== 'all' && activeTab !== id) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-slate-200/80 shadow-xl shadow-slate-200/40 hover:border-slate-300 transition-all duration-300 relative overflow-hidden"
        >
            {/* Top decorative gradient line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0D8BFF] via-[#1E5EFF] to-indigo-500 opacity-80" />

            <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                    {Icon && (
                        <div className="p-2.5 rounded-2xl bg-gradient-to-br from-[#0D8BFF]/10 to-[#1E5EFF]/20 text-[#0D8BFF] ring-1 ring-[#0D8BFF]/20 shadow-sm">
                            <Icon className="w-5 h-5" />
                        </div>
                    )}
                    <div>
                        <h3 className="text-base font-bold text-slate-800 tracking-tight flex items-center gap-2">
                            {title}
                        </h3>
                        {subtitle && <p className="text-xs text-slate-400 font-medium mt-0.5">{subtitle}</p>}
                    </div>
                </div>
                {badge && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200/60">
                        {badge}
                    </span>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {children}
            </div>
        </motion.div>
    );
}

export default function Profile() {
    const { user } = useAuth();
    const [form, setForm] = useState({});
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState({ text: '', type: '' });
    const [activeTab, setActiveTab] = useState('all');
    const [gpsLoading, setGpsLoading] = useState(false);

    useEffect(() => {
        api.get('/profile')
            .then(r => setForm(r.data || {}))
            .catch(() => setMsg({ text: 'Error al cargar los datos del perfil.', type: 'error' }));
    }, []);

    const set = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));
    const setCheck = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.checked }));

    // Real-time BMI calculation
    const bmiInfo = useMemo(() => {
        const h = parseFloat(form.height);
        const w = parseFloat(form.weight);
        if (!h || !w || h <= 0 || w <= 0) return null;
        const heightMeters = h / 100;
        const bmiVal = (w / (heightMeters * heightMeters)).toFixed(1);

        let category = 'Normal';
        let color = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        let badgeBg = 'from-emerald-500 to-teal-600';

        if (bmiVal < 18.5) {
            category = 'Bajo peso';
            color = 'bg-amber-50 text-amber-700 border-amber-200';
            badgeBg = 'from-amber-400 to-orange-500';
        } else if (bmiVal >= 25 && bmiVal < 30) {
            category = 'Sobrepeso';
            color = 'bg-amber-50 text-amber-800 border-amber-300';
            badgeBg = 'from-amber-500 to-orange-600';
        } else if (bmiVal >= 30) {
            category = 'Obesidad';
            color = 'bg-rose-50 text-rose-700 border-rose-200';
            badgeBg = 'from-rose-500 to-red-600';
        }

        return { val: bmiVal, category, color, badgeBg };
    }, [form.height, form.weight]);

    // Profile Completion Percentage
    const completionPercentage = useMemo(() => {
        const fields = [
            'blood_type', 'gender', 'birth_date', 'curp', 'height', 'weight',
            'insurance_provider', 'insurance_number', 'home_address',
            'emergency_contact_name', 'emergency_contact_phone',
            'doctor_name', 'allergies', 'chronic_conditions', 'medications'
        ];
        let filled = 0;
        fields.forEach(f => {
            if (form[f] && String(form[f]).trim() !== '') filled++;
        });
        return Math.round((filled / fields.length) * 100);
    }, [form]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMsg({ text: '', type: '' });
        try {
            await api.put('/profile', form);
            setMsg({ text: '¡Perfil médico actualizado correctamente!', type: 'success' });
            // Auto hide success message after 4s
            setTimeout(() => setMsg({ text: '', type: '' }), 4000);
        } catch (err) {
            setMsg({ text: 'Error al actualizar el perfil. Por favor verifica la información.', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const getGPS = () => {
        if (!navigator.geolocation) {
            alert('Tu navegador no soporta geolocalización.');
            return;
        }
        setGpsLoading(true);
        navigator.geolocation.getCurrentPosition(
            pos => {
                setForm(prev => ({
                    ...prev,
                    home_latitude: pos.coords.latitude.toFixed(7),
                    home_longitude: pos.coords.longitude.toFixed(7)
                }));
                setGpsLoading(false);
            },
            () => {
                alert('No se pudo obtener la ubicación GPS.');
                setGpsLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    if (user?.role === 'admin') {
        return (
            <PageTransition>
                <div className="max-w-6xl mx-auto space-y-6 pb-16">
                    {/* --- TOP PROFILE HERO HEADER FOR ADMIN --- */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#041B5A] via-[#0A2F8F] to-[#0A0F1F] p-6 sm:p-8 text-white shadow-2xl shadow-[#041B5A]/25 border border-[#0D8BFF]/30"
                    >
                        {/* Ambient Glows */}
                        <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#0D8BFF]/25 rounded-full filter blur-3xl pointer-events-none" />
                        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-purple-600/20 rounded-full filter blur-3xl pointer-events-none" />

                        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                            {/* Avatar & User Info */}
                            <div className="flex items-center gap-5">
                                <div className="relative">
                                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-[#0D8BFF] to-purple-500 p-1 shadow-lg shadow-[#0D8BFF]/40">
                                        <div className="w-full h-full rounded-[22px] bg-[#0A0F1F] flex items-center justify-center text-2xl sm:text-3xl font-extrabold text-white tracking-wider border border-white/10">
                                            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AD'}
                                        </div>
                                    </div>
                                    <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-[#0A0F1F]" title="En línea" />
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                                            {user?.name || 'Administrador SafeWatch'}
                                        </h1>
                                        <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase tracking-wider">
                                            Administrador
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-300 font-medium flex items-center gap-2">
                                        <span>{user?.email}</span>
                                    </p>
                                    <div className="pt-1 flex items-center gap-2 text-xs text-slate-400">
                                        <IconShieldCheck className="w-4 h-4 text-emerald-400" />
                                        <span>Perfil de Administrador del Sistema</span>
                                    </div>
                                </div>
                            </div>

                            {/* Admin Account Status Card */}
                            <div className="w-full md:w-64 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 shadow-inner">
                                <div className="flex items-center justify-between text-xs font-bold mb-2">
                                    <span className="text-slate-200">Estado de Cuenta</span>
                                    <span className="text-emerald-400 text-sm font-black">Activo</span>
                                </div>
                                <div className="w-full bg-slate-800/80 rounded-full h-2.5 overflow-hidden border border-white/10">
                                    <div className="bg-gradient-to-r from-purple-400 to-[#0D8BFF] h-full rounded-full w-full shadow-lg" />
                                </div>
                                <p className="text-[11px] text-slate-300 mt-2 text-right">
                                    Permisos globales concedidos
                                </p>
                            </div>
                        </div>

                        {/* Quick Metric Pills */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/10 relative z-10">
                            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 border border-white/10 flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
                                    <IconShieldCheck className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[11px] text-slate-400 font-medium">Nivel de Permisos</p>
                                    <p className="text-sm font-bold text-white">Administrador Global</p>
                                </div>
                            </div>

                            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 border border-white/10 flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300">
                                    <IconSparkles className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[11px] text-slate-400 font-medium">Acceso a BD</p>
                                    <p className="text-sm font-bold text-white">MongoDB Atlas (LPR)</p>
                                </div>
                            </div>

                            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 border border-white/10 flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
                                    <IconCheckCircle className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[11px] text-slate-400 font-medium">Estado del Sistema</p>
                                    <p className="text-sm font-bold text-white">Operativo & Verificado</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* MAIN ADMIN DETAILS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Account Details Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-slate-200/80 shadow-xl shadow-slate-200/40 relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-[#0D8BFF]" />
                            <div className="flex items-center gap-3 mb-5 border-b border-slate-100 pb-4">
                                <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-600 ring-1 ring-purple-500/20 shadow-sm">
                                    <IconUser className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-800 tracking-tight">Información de la Cuenta</h3>
                                    <p className="text-xs text-slate-400 font-medium mt-0.5">Datos del usuario administrador</p>
                                </div>
                            </div>

                            <div className="space-y-4 text-sm">
                                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70 flex justify-between items-center">
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nombre Completo</span>
                                    <span className="font-extrabold text-slate-800">{user?.name}</span>
                                </div>
                                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70 flex justify-between items-center">
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Correo Electrónico</span>
                                    <span className="font-bold text-slate-800">{user?.email}</span>
                                </div>
                                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70 flex justify-between items-center">
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Rol de Plataforma</span>
                                    <span className="font-bold text-purple-600 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20 text-xs uppercase">
                                        {user?.role}
                                    </span>
                                </div>
                                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70 flex justify-between items-center">
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Identificador de Usuario</span>
                                    <span className="font-mono text-xs font-bold text-slate-600">ID #{user?.id}</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Admin Actions / Modules Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-slate-200/80 shadow-xl shadow-slate-200/40 relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0D8BFF] to-cyan-500" />
                            <div className="flex items-center gap-3 mb-5 border-b border-slate-100 pb-4">
                                <div className="p-2.5 rounded-2xl bg-[#0D8BFF]/10 text-[#0D8BFF] ring-1 ring-[#0D8BFF]/20 shadow-sm">
                                    <IconSparkles className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-800 tracking-tight">Módulos Administrativos</h3>
                                    <p className="text-xs text-slate-400 font-medium mt-0.5">Acceso a paneles de gestión</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                            <span>👥 Gestión de Usuarios</span>
                                        </div>
                                        <p className="text-xs text-slate-500">Administrar pacientes, médicos y roles del sistema.</p>
                                    </div>
                                    <Link
                                        to="/admin/users"
                                        className="px-4 py-2 bg-[#0D8BFF] hover:bg-[#1E5EFF] text-white text-xs font-bold rounded-xl shadow-md transition-all whitespace-nowrap"
                                    >
                                        Ir a Usuarios
                                    </Link>
                                </div>

                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                            <span>💾 Respaldos de Base de Datos</span>
                                        </div>
                                        <p className="text-xs text-slate-500">Crear y restaurar copias NoSQL en MongoDB Atlas.</p>
                                    </div>
                                    <Link
                                        to="/admin/backups"
                                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-md transition-all whitespace-nowrap"
                                    >
                                        Ir a Respaldos
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </PageTransition>
        );
    }

    return (
        <PageTransition>

            <div className="max-w-6xl mx-auto space-y-6 pb-16">

                {/* --- TOP PROFILE HERO HEADER --- */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#041B5A] via-[#0A2F8F] to-[#0A0F1F] p-6 sm:p-8 text-white shadow-2xl shadow-[#041B5A]/25 border border-[#0D8BFF]/30"
                >
                    {/* Ambient Glows */}
                    <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#0D8BFF]/25 rounded-full filter blur-3xl pointer-events-none" />
                    <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-indigo-600/20 rounded-full filter blur-3xl pointer-events-none" />

                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        {/* Avatar & User Info */}
                        <div className="flex items-center gap-5">
                            <div className="relative">
                                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-[#0D8BFF] to-cyan-400 p-1 shadow-lg shadow-[#0D8BFF]/40">
                                    <div className="w-full h-full rounded-[22px] bg-[#0A0F1F] flex items-center justify-center text-2xl sm:text-3xl font-extrabold text-white tracking-wider border border-white/10">
                                        {user?.name ? user.name.slice(0, 2).toUpperCase() : 'SW'}
                                    </div>
                                </div>
                                <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-[#0A0F1F]" title="En línea" />
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                                        {user?.name || 'Usuario SafeWatch'}
                                    </h1>
                                    <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-[#0D8BFF]/20 text-cyan-300 border border-[#0D8BFF]/40 uppercase tracking-wider">
                                        {user?.role || 'Paciente'}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-300 font-medium flex items-center gap-2">
                                    <span>{user?.email}</span>
                                </p>
                                <div className="pt-1 flex items-center gap-2 text-xs text-slate-400">
                                    <IconShieldCheck className="w-4 h-4 text-emerald-400" />
                                    <span>{user?.role === 'admin' ? 'Perfil de Administrador del Sistema' : 'Expediente Clínico Digital Encriptado'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Profile Completion Stats */}
                        <div className="w-full md:w-64 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 shadow-inner">
                            <div className="flex items-center justify-between text-xs font-bold mb-2">
                                <span className="text-slate-200">Completado del Perfil</span>
                                <span className="text-cyan-300 text-sm font-black">{completionPercentage}%</span>
                            </div>
                            <div className="w-full bg-slate-800/80 rounded-full h-2.5 overflow-hidden border border-white/10">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${completionPercentage}%` }}
                                    transition={{ duration: 1, ease: 'easeOut' }}
                                    className="bg-gradient-to-r from-cyan-400 to-[#0D8BFF] h-full rounded-full shadow-lg shadow-cyan-500/50"
                                />
                            </div>
                            <p className="text-[11px] text-slate-300 mt-2 text-right">
                                {completionPercentage === 100 ? '¡Perfil completo!' : 'Completa tus datos de acceso'}
                            </p>
                        </div>
                    </div>

                    {/* Quick Metric Pills */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/10 relative z-10">
                        {user?.role === 'admin' ? (
                            <>
                                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 border border-white/10 flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
                                        <IconShieldCheck className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] text-slate-400 font-medium">Nivel de Permisos</p>
                                        <p className="text-sm font-bold text-white">Administrador Global</p>
                                    </div>
                                </div>

                                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 border border-white/10 flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300">
                                        <IconSparkles className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] text-slate-400 font-medium">Acceso a BD</p>
                                        <p className="text-sm font-bold text-white">MongoDB Atlas (LPR)</p>
                                    </div>
                                </div>

                                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 border border-white/10 flex items-center gap-3 col-span-2 sm:col-span-1">
                                    <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
                                        <IconCheckCircle className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] text-slate-400 font-medium">Estado de Cuenta</p>
                                        <p className="text-sm font-bold text-white">Activo & Verificado</p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 border border-white/10 flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-rose-500/20 text-rose-300">
                                        <IconHeartPulse className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] text-slate-400 font-medium">Tipo Sangre</p>
                                        <p className="text-sm font-bold text-white">{form.blood_type || 'Sin definir'}</p>
                                    </div>
                                </div>

                                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 border border-white/10 flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300">
                                        <IconSparkles className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] text-slate-400 font-medium">Índice IMC</p>
                                        <p className="text-sm font-bold text-white">
                                            {bmiInfo ? `${bmiInfo.val} (${bmiInfo.category})` : 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 border border-white/10 flex items-center gap-3 col-span-2 sm:col-span-1">
                                    <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300">
                                        <IconLocation className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] text-slate-400 font-medium">GPS Emergencias</p>
                                        <p className="text-sm font-bold text-white">
                                            {form.home_latitude ? 'Configurado' : 'Pendiente'}
                                        </p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </motion.div>

                {/* --- SYSTEM NOTIFICATIONS TOAST --- */}
                <AnimatePresence>
                    {msg.text && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={`p-4 rounded-2xl flex items-center justify-between gap-3 shadow-lg border text-sm font-medium ${
                                msg.type === 'error'
                                    ? 'bg-rose-50 border-rose-200 text-rose-700'
                                    : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                {msg.type === 'error' ? (
                                    <div className="p-1.5 bg-rose-100 text-rose-600 rounded-xl">⚠️</div>
                                ) : (
                                    <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-xl">
                                        <IconCheckCircle className="w-5 h-5" />
                                    </div>
                                )}
                                <span>{msg.text}</span>
                            </div>
                            <button onClick={() => setMsg({ text: '', type: '' })} className="text-slate-400 hover:text-slate-600">✕</button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* --- NAVIGATION CATEGORY TABS --- */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {TABS.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`relative px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all duration-200 whitespace-nowrap ${
                                    isActive
                                        ? 'text-white shadow-md shadow-[#0D8BFF]/25'
                                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/70'
                                }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTabBg"
                                        className="absolute inset-0 bg-gradient-to-r from-[#0D8BFF] to-[#1E5EFF] rounded-2xl"
                                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10 flex items-center gap-2">
                                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                                    {tab.label}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* --- MAIN FORM CONTENT --- */}
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* --- SECTION 1: DATOS PERSONALES Y BIOMETRÍA --- */}
                    <SectionCard
                        id="personal"
                        activeTab={activeTab}
                        title="Información Personal y Biometría"
                        subtitle="Datos físicos y ficha de identidad básica"
                        icon={IconUser}
                        badge="Requerido"
                    >
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 tracking-wide mb-1.5">
                                Tipo de Sangre
                            </label>
                            <select
                                value={form.blood_type || ''}
                                onChange={set('blood_type')}
                                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50/80 border border-slate-200 text-sm font-medium text-slate-800 focus:bg-white focus:border-[#0D8BFF] focus:ring-4 focus:ring-[#0D8BFF]/15 outline-none transition-all"
                            >
                                <option value="">Seleccionar grupo sanguíneo</option>
                                {bloodTypes.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 tracking-wide mb-1.5">
                                Género
                            </label>
                            <select
                                value={form.gender || ''}
                                onChange={set('gender')}
                                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50/80 border border-slate-200 text-sm font-medium text-slate-800 focus:bg-white focus:border-[#0D8BFF] focus:ring-4 focus:ring-[#0D8BFF]/15 outline-none transition-all"
                            >
                                <option value="">Seleccionar género</option>
                                {genders.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                            </select>
                        </div>

                        <InputField
                            label="Fecha de Nacimiento"
                            type="date"
                            value={form.birth_date || ''}
                            onChange={set('birth_date')}
                        />

                        <InputField
                            label="CURP"
                            value={form.curp || ''}
                            onChange={set('curp')}
                            maxLength={18}
                            placeholder="ABCD123456HDFXXX01"
                            style={{ textTransform: 'uppercase' }}
                        />

                        <InputField
                            label="Altura (cm)"
                            type="number"
                            placeholder="Ej. 175"
                            value={form.height || ''}
                            onChange={set('height')}
                        />

                        <InputField
                            label="Peso (kg)"
                            type="number"
                            placeholder="Ej. 70"
                            value={form.weight || ''}
                            onChange={set('weight')}
                        />

                        {/* Dynamic Live BMI Widget Card */}
                        {bmiInfo && (
                            <div className="sm:col-span-2 mt-2 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2.5 rounded-xl bg-gradient-to-r ${bmiInfo.badgeBg} text-white shadow-md font-black text-sm`}>
                                        IMC {bmiInfo.val}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-700">Índice de Masa Corporal Calculado</p>
                                        <p className="text-[11px] text-slate-500">Calculado automáticamente a partir de tu altura y peso</p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${bmiInfo.color}`}>
                                    {bmiInfo.category}
                                </span>
                            </div>
                        )}
                    </SectionCard>

                    {/* --- SECTION 2: SEGURO MÉDICO Y UBICACIÓN GPS --- */}
                    <SectionCard
                        id="insurance"
                        activeTab={activeTab}
                        title="Seguro Médico y Ubicación en Casa"
                        subtitle="Póliza de salud y coordenadas GPS para emergencias SOS"
                        icon={IconLocation}
                    >
                        <InputField
                            label="Aseguradora"
                            value={form.insurance_provider || ''}
                            onChange={set('insurance_provider')}
                            placeholder="IMSS, ISSSTE, GNP, MetLife..."
                        />

                        <InputField
                            label="No. de Póliza / Afiliación"
                            value={form.insurance_number || ''}
                            onChange={set('insurance_number')}
                            placeholder="000-111-22233"
                        />

                        <div className="sm:col-span-2">
                            <InputField
                                label="Dirección del Hogar"
                                icon={IconLocation}
                                value={form.home_address || ''}
                                onChange={set('home_address')}
                                placeholder="Calle, número exterior/interior, colonia, código postal, ciudad"
                            />
                        </div>

                        <InputField
                            label="Latitud GPS"
                            type="number"
                            step="0.0000001"
                            value={form.home_latitude || ''}
                            onChange={set('home_latitude')}
                            placeholder="19.4326077"
                        />

                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-slate-700 tracking-wide">
                                Longitud GPS
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    step="0.0000001"
                                    value={form.home_longitude || ''}
                                    onChange={set('home_longitude')}
                                    placeholder="-99.133208"
                                    className="flex-1 px-3.5 py-2.5 rounded-2xl bg-slate-50/80 border border-slate-200 text-sm font-medium text-slate-800 focus:bg-white focus:border-[#0D8BFF] focus:ring-4 focus:ring-[#0D8BFF]/15 outline-none transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={getGPS}
                                    disabled={gpsLoading}
                                    className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-[#0D8BFF] hover:opacity-95 text-white font-bold text-xs shadow-md shadow-cyan-500/20 flex items-center gap-1.5 transition-all whitespace-nowrap disabled:opacity-50"
                                >
                                    {gpsLoading ? (
                                        <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                                    ) : (
                                        <IconLocation className="w-4 h-4" />
                                    )}
                                    <span>{gpsLoading ? 'Obteniendo...' : 'Obtener GPS'}</span>
                                </button>
                            </div>
                        </div>
                    </SectionCard>

                    {/* --- SECTION 3: CONTACTOS DE EMERGENCIA Y DOCTOR --- */}
                    <SectionCard
                        id="emergency"
                        activeTab={activeTab}
                        title="Contactos de Emergencia y Doctor Familiar"
                        subtitle="Personas a notificar en caso de alertas biométricas o SOS"
                        icon={IconPhoneCall}
                    >
                        {/* Contact 1 */}
                        <div className="sm:col-span-2 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                                <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-[#0D8BFF]" />
                                    Contacto Principal de Emergencia 1
                                </span>
                                <span className="text-[11px] font-semibold text-[#0D8BFF]">Prioridad 1</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <InputField
                                    label="Nombre Completo"
                                    value={form.emergency_contact_name || ''}
                                    onChange={set('emergency_contact_name')}
                                    placeholder="Nombre del familiar"
                                />
                                <InputField
                                    label="Teléfono"
                                    type="tel"
                                    icon={IconPhoneCall}
                                    value={form.emergency_contact_phone || ''}
                                    onChange={set('emergency_contact_phone')}
                                    placeholder="55-1234-5678"
                                />
                                <InputField
                                    label="Parentesco / Relación"
                                    value={form.emergency_contact_relation || ''}
                                    onChange={set('emergency_contact_relation')}
                                    placeholder="Madre, Esposo, Hijo..."
                                />
                            </div>
                        </div>

                        {/* Contact 2 */}
                        <div className="sm:col-span-2 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                                <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                                    Contacto Secundario de Emergencia 2
                                </span>
                                <span className="text-[11px] font-medium text-slate-400">Opcional</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <InputField
                                    label="Nombre Completo"
                                    value={form.emergency_contact2_name || ''}
                                    onChange={set('emergency_contact2_name')}
                                    placeholder="Nombre de contacto secundario"
                                />
                                <InputField
                                    label="Teléfono"
                                    type="tel"
                                    icon={IconPhoneCall}
                                    value={form.emergency_contact2_phone || ''}
                                    onChange={set('emergency_contact2_phone')}
                                    placeholder="55-8765-4321"
                                />
                                <InputField
                                    label="Parentesco / Relación"
                                    value={form.emergency_contact2_relation || ''}
                                    onChange={set('emergency_contact2_relation')}
                                    placeholder="Hermana, Amigo..."
                                />
                            </div>
                        </div>

                        {/* Doctor Familiar */}
                        <div className="sm:col-span-2 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                                <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
                                    <IconDoctor className="w-4 h-4 text-cyan-600" />
                                    Doctor Tratante / Médico Familiar
                                </span>
                                <span className="text-[11px] font-medium text-slate-400">Para consultas rápidas</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                                <InputField
                                    label="Nombre del Doctor"
                                    value={form.doctor_name || ''}
                                    onChange={set('doctor_name')}
                                    placeholder="Dr. Carlos Mendoza"
                                />
                                <InputField
                                    label="Teléfono Directo"
                                    type="tel"
                                    icon={IconPhoneCall}
                                    value={form.doctor_phone || ''}
                                    onChange={set('doctor_phone')}
                                    placeholder="55-9988-7766"
                                />
                                <InputField
                                    label="Especialidad"
                                    value={form.doctor_specialty || ''}
                                    onChange={set('doctor_specialty')}
                                    placeholder="Cardiología, Medicina General..."
                                />
                                <InputField
                                    label="Hospital / Clínica"
                                    value={form.doctor_hospital || ''}
                                    onChange={set('doctor_hospital')}
                                    placeholder="Hospital Ángeles, ABC..."
                                />
                            </div>
                        </div>
                    </SectionCard>

                    {/* --- SECTION 4: HISTORIAL Y CONDICIONES MÉDICAS --- */}
                    <SectionCard
                        id="medical"
                        activeTab={activeTab}
                        title="Historial Clínico y Medicamentos"
                        subtitle="Alergias, padecimientos crónicos y tratamiento actual"
                        icon={IconPill}
                    >
                        <div className="sm:col-span-2 space-y-1.5">
                            <label className="block text-xs font-semibold text-slate-700 tracking-wide">
                                Alergias Médicas y Alimentarias
                            </label>
                            <textarea
                                value={form.allergies || ''}
                                onChange={set('allergies')}
                                rows={2}
                                placeholder="Penicilina, polen, mariscos, aspirina..."
                                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50/80 border border-slate-200 text-sm font-medium text-slate-800 focus:bg-white focus:border-[#0D8BFF] focus:ring-4 focus:ring-[#0D8BFF]/15 outline-none transition-all placeholder:text-slate-400"
                            />
                        </div>

                        <div className="sm:col-span-2 space-y-1.5">
                            <label className="block text-xs font-semibold text-slate-700 tracking-wide">
                                Condiciones Crónicas o Diagnósticos Pervasivos
                            </label>
                            <textarea
                                value={form.chronic_conditions || ''}
                                onChange={set('chronic_conditions')}
                                rows={2}
                                placeholder="Hipertensión arterial, Diabetes Tipo 2, Asma..."
                                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50/80 border border-slate-200 text-sm font-medium text-slate-800 focus:bg-white focus:border-[#0D8BFF] focus:ring-4 focus:ring-[#0D8BFF]/15 outline-none transition-all placeholder:text-slate-400"
                            />
                        </div>

                        <div className="sm:col-span-2 space-y-1.5">
                            <label className="block text-xs font-semibold text-slate-700 tracking-wide">
                                Medicamentos en Uso Actual y Dosis
                            </label>
                            <textarea
                                value={form.medications || ''}
                                onChange={set('medications')}
                                rows={2}
                                placeholder="Metformina 500mg cada 12 hrs, Losartán 50mg por las mañanas..."
                                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50/80 border border-slate-200 text-sm font-medium text-slate-800 focus:bg-white focus:border-[#0D8BFF] focus:ring-4 focus:ring-[#0D8BFF]/15 outline-none transition-all placeholder:text-slate-400"
                            />
                        </div>

                        <div className="sm:col-span-2 space-y-1.5">
                            <label className="block text-xs font-semibold text-slate-700 tracking-wide">
                                Notas Clínicas Adicionales
                            </label>
                            <textarea
                                value={form.notes || ''}
                                onChange={set('notes')}
                                rows={2}
                                placeholder="Observaciones extras sobre tu estado físico o antecedentes..."
                                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50/80 border border-slate-200 text-sm font-medium text-slate-800 focus:bg-white focus:border-[#0D8BFF] focus:ring-4 focus:ring-[#0D8BFF]/15 outline-none transition-all placeholder:text-slate-400"
                            />
                        </div>
                    </SectionCard>

                    {/* --- SECTION 5: PRIVACIDAD Y CONSENTIMIENTO --- */}
                    {(activeTab === 'all' || activeTab === 'privacy') && (
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-slate-200/80 shadow-xl shadow-slate-200/40 relative overflow-hidden"
                        >
                            <h3 className="text-base font-bold text-slate-800 tracking-tight mb-3 flex items-center gap-2">
                                <IconShieldCheck className="w-5 h-5 text-[#0D8BFF]" />
                                Privacidad y Protección de Datos Biométricos
                            </h3>
                            <label className="flex items-start gap-3.5 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={!!form.privacy_accepted}
                                    onChange={setCheck('privacy_accepted')}
                                    className="mt-1 w-5 h-5 rounded-lg border-slate-300 text-[#0D8BFF] focus:ring-[#0D8BFF] transition"
                                />
                                <span className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                                    Acepto el{' '}
                                    <Link to="/privacidad" target="_blank" className="text-[#0D8BFF] font-bold hover:underline">
                                        Aviso de Privacidad de SafeWatch
                                    </Link>{' '}
                                    y autorizo el tratamiento confidencial de mis datos biométricos para el monitoreo preventivo de salud y alertas de emergencia.
                                </span>
                            </label>
                            {form.privacy_accepted_at && (
                                <p className="text-[11px] text-slate-400 font-medium mt-3 flex items-center gap-1.5 pl-8">
                                    <IconCheckCircle className="w-4 h-4 text-emerald-500" />
                                    Consentimiento aceptado digitalmente el{' '}
                                    {new Date(form.privacy_accepted_at).toLocaleString('es-MX')}
                                </p>
                            )}
                        </motion.div>
                    )}

                    {/* --- FLOATING / BOTTOM SAVE BAR --- */}
                    <div className="pt-4 flex items-center justify-between border-t border-slate-200">
                        <div className="text-xs text-slate-400 font-medium hidden sm:block">
                            Los datos guardados están protegidos mediante cifrado de extremo a extremo.
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#0D8BFF] via-[#1E5EFF] to-indigo-600 hover:opacity-95 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-[#0D8BFF]/30 transition-all duration-200 flex items-center justify-center gap-2.5 disabled:opacity-50 active:scale-95"
                        >
                            {saving ? (
                                <>
                                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                    <span>Guardando Perfil...</span>
                                </>
                            ) : (
                                <>
                                    <IconCheckCircle className="w-5 h-5 text-cyan-200" />
                                    <span>Guardar Cambios del Perfil</span>
                                </>
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </PageTransition>
    );
}
