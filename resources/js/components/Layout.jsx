import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconGrid, IconHeart, IconBell, IconUser, IconLogout, IconUsers, IconDatabase } from './Icons';

const getNavItems = (role) => {
    if (role === 'admin') {
        return [
            { to: '/admin/users', icon: <IconUsers />, label: 'Usuarios' },
            { to: '/admin/backups', icon: <IconDatabase />, label: 'Respaldos' },
            { to: '/profile', icon: <IconUser />, label: 'Perfil' },
        ];
    }
    if (role === 'doctor') {
        return [
            { to: '/dashboard', icon: <IconGrid />, label: 'Dashboard' },
            { to: '/doctor/patients', icon: <IconUsers />, label: 'Pacientes' },
            { to: '/alerts', icon: <IconBell />, label: 'Alertas' },
            { to: '/profile', icon: <IconUser />, label: 'Perfil' },
        ];
    }
    return [
        { to: '/dashboard', icon: <IconGrid />, label: 'Dashboard' },
        { to: '/vitals', icon: <IconHeart />, label: 'Vitales' },
        { to: '/alerts', icon: <IconBell />, label: 'Alertas' },
        { to: '/profile', icon: <IconUser />, label: 'Perfil' },
    ];
};

export default function Layout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const navItems = getNavItems(user?.role);
    const logoHome = user?.role === 'admin' ? '/admin/users' : '/dashboard';

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const linkClass = ({ isActive }) =>
        `px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2.5 ${isActive
            ? 'bg-gradient-to-r from-[#0D8BFF] to-[#1E5EFF] text-white shadow-lg shadow-[#0D8BFF]/35 scale-[1.03]'
            : 'text-slate-300 hover:text-white hover:bg-white/10'
        }`;

    return (
        <div className="min-h-screen bg-[#EAEAEA] text-[#0A0F1F]">
            {/* Header / Navbar */}
            <nav className="sticky top-0 z-50 bg-gradient-to-r from-[#041B5A] via-[#0A2F8F] to-[#0A0F1F] backdrop-blur-xl border-b border-[#0D8BFF]/25 shadow-xl shadow-[#041B5A]/25">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-20">
                    {/* Logo & Brand */}
                    <NavLink to={logoHome} className="flex items-center gap-3.5 group py-1">
                        <img 
                            src="/images/logo.png" 
                            alt="SafeWatch" 
                            className="h-11 sm:h-12 w-auto object-contain filter drop-shadow-[0_4px_15px_rgba(13,139,255,0.5)] group-hover:scale-110 transition-transform duration-300" 
                        />
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className="text-white font-extrabold text-2xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-[#0D8BFF] bg-clip-text text-transparent">
                                    SafeWatch
                                </span>
                                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-black tracking-widest text-[#0D8BFF] bg-[#0D8BFF]/15 border border-[#0D8BFF]/30 rounded-full uppercase">
                                    {user?.role === 'admin' ? 'Admin Panel' : 'Health'}
                                </span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium tracking-wide hidden sm:block">
                                {user?.role === 'admin' ? 'Gestión y Control de Plataforma' : 'Monitoreo Médico Inteligente'}
                            </span>
                        </div>
                    </NavLink>

                    {/* Desktop Navigation Links */}
                    <div className="hidden md:flex items-center gap-1.5 bg-white/5 p-1.5 rounded-2xl border border-white/10 shadow-inner backdrop-blur-md">
                        {navItems.map(item => (
                            <NavLink key={item.to} to={item.to} className={linkClass}>
                                <span className="text-base">{item.icon}</span>
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                    </div>

                    {/* User Profile & Actions */}
                    <div className="hidden md:flex items-center gap-3">
                        <NavLink 
                            to="/profile" 
                            className="flex items-center gap-3 bg-white/5 hover:bg-white/12 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 group hover:shadow-lg hover:shadow-[#0D8BFF]/10"
                            title="Ir a mi Perfil"
                        >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0D8BFF]/80 to-[#1E5EFF]/80 backdrop-blur-md flex items-center justify-center font-bold text-white text-xs shadow-md shadow-[#0D8BFF]/20 ring-2 ring-white/15 group-hover:scale-105 transition-transform">
                                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                            </div>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-white text-xs font-bold leading-tight group-hover:text-[#0D8BFF] transition-colors">{user?.name}</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                </div>
                                <span className="text-[10px] text-slate-300/80 font-bold uppercase tracking-wider mt-0.5">{user?.role}</span>
                            </div>
                        </NavLink>

                        {/* Botón de Salir */}
                        <button
                            onClick={handleLogout}
                            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/20 hover:border-rose-500/40 backdrop-blur-md transition-all duration-300 flex items-center gap-1.5 shadow-sm hover:shadow-rose-500/20 active:scale-95 cursor-pointer"
                            title="Cerrar sesión de SafeWatch"
                        >
                            <IconLogout className="text-sm text-rose-400 group-hover:text-white" />
                            <span>Salir</span>
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button 
                        className="md:hidden text-white p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all border border-white/10" 
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Abrir menú"
                    >
                        <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z" />
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu Dropdown */}
                {menuOpen && (
                    <div className="md:hidden bg-[#041B5A]/95 px-4 pt-3 pb-5 space-y-2 border-t border-white/10 shadow-2xl backdrop-blur-2xl">
                        <NavLink 
                            to="/profile" 
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-3.5 py-3 px-3 rounded-2xl bg-white/5 border border-white/10 mb-3 hover:bg-white/10 transition-all"
                        >
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#0D8BFF] to-[#1E5EFF] flex items-center justify-center font-bold text-white text-sm shadow-md">
                                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div>
                                <div className="text-white font-bold text-sm flex items-center gap-1.5">
                                    <span>{user?.name}</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                </div>
                                <div className="text-xs text-[#0D8BFF] font-extrabold uppercase tracking-wider">{user?.role}</div>
                            </div>
                        </NavLink>
                        {navItems.map(item => (
                            <NavLink key={item.to} to={item.to} onClick={() => setMenuOpen(false)}
                                className={({ isActive }) => `flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive ? 'bg-[#0D8BFF] text-white shadow-lg shadow-[#0D8BFF]/30' : 'text-slate-300 hover:bg-white/10'}`}>
                                <span className="text-lg">{item.icon}</span> <span>{item.label}</span>
                            </NavLink>
                        ))}
                        <button 
                            onClick={handleLogout} 
                            className="flex items-center justify-center gap-2 w-full px-4 py-3 text-sm font-bold text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-500/20 rounded-xl mt-3 border border-rose-500/20 transition-all"
                        >
                            <IconLogout className="text-base text-rose-400" />
                            <span>Cerrar sesión</span>
                        </button>
                    </div>
                )}
            </nav>

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-28 md:pb-12">
                <Outlet />
            </main>

            {/* Mobile Bottom Fixed Nav Bar */}
            <nav className="md:hidden fixed bottom-0 inset-x-0 bg-[#041B5A]/95 backdrop-blur-xl border-t border-[#0D8BFF]/30 z-50 flex justify-around py-2.5 shadow-2xl">
                {navItems.map(item => (
                    <NavLink key={item.to} to={item.to}
                        className={({ isActive }) => `flex flex-col items-center py-1 px-3.5 rounded-xl transition-all ${isActive ? 'text-[#0D8BFF] scale-110 font-bold' : 'text-slate-400 hover:text-slate-200'}`}>
                        <span className="text-xl">{item.icon}</span>
                        <span className="text-[11px] mt-0.5 font-semibold">{item.label}</span>
                    </NavLink>
                ))}
            </nav>
        </div>
    );
}


