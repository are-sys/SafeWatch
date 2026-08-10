import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import PageTransition from '../components/PageTransition';
import { useAuth } from '../context/AuthContext';

const roleBadges = {
    paciente: { label: 'Paciente', bg: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/30' },
    doctor: { label: 'Doctor', bg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
    admin: { label: 'Administrador', bg: 'bg-purple-500/10 text-purple-600 border-purple-500/30' },
};

export default function AdminUsers() {
    const { user: currentUser } = useAuth();
    const [usersData, setUsersData] = useState({ data: [], current_page: 1, last_page: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [updatingUser, setUpdatingUser] = useState(null);
    const [deletingUser, setDeletingUser] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const loadUsers = (url = '/admin/users') => {
        setLoading(true);
        api.get(url)
            .then(r => setUsersData(r.data))
            .catch(() => showToast('Error al cargar la lista de usuarios', 'error'))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
    };

    const changeRole = async (user, newRole) => {
        if (user.role === newRole) return;
        setUpdatingUser(user.id);
        try {
            await api.patch(`/admin/users/${user.id}/role`, { role: newRole });
            showToast(`Rol de ${user.name} actualizado a ${roleBadges[newRole]?.label || newRole}`);
            loadUsers(`/admin/users?page=${usersData.current_page}`);
        } catch {
            showToast(`Error al actualizar el rol de ${user.name}`, 'error');
        } finally {
            setUpdatingUser(null);
        }
    };

    const deleteUser = async (user) => {
        if (user.id === currentUser?.id) {
            showToast('No puedes eliminar tu propia cuenta de administrador.', 'error');
            return;
        }
        if (!confirm(`⚠️ ¿Estás seguro de eliminar permanentemente la cuenta de "${user.name}"?\nEsta acción eliminará sus expedientes, signos vitales y alertas asociadas.`)) {
            return;
        }
        setDeletingUser(user.id);
        try {
            const res = await api.delete(`/admin/users/${user.id}`);
            showToast(res.data?.message || `Cuenta de ${user.name} eliminada permanentemente.`);
            loadUsers(`/admin/users?page=${usersData.current_page}`);
        } catch (err) {
            showToast(err.response?.data?.message || `Error al eliminar la cuenta de ${user.name}`, 'error');
        } finally {
            setDeletingUser(null);
        }
    };

    // Stat counts calculation
    const stats = useMemo(() => {
        const list = usersData.data || [];
        const total = usersData.total || list.length;
        const admins = list.filter(u => u.role === 'admin').length;
        const doctors = list.filter(u => u.role === 'doctor').length;
        const pacientes = list.filter(u => u.role === 'paciente').length;
        return { total, admins, doctors, pacientes };
    }, [usersData]);

    // Filtered users for real-time search
    const filteredUsers = useMemo(() => {
        const list = usersData.data || [];
        return list.filter(u => {
            const matchesSearch = u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  u.email?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesRole = roleFilter === 'all' || u.role === roleFilter;
            return matchesSearch && matchesRole;
        });
    }, [usersData.data, searchQuery, roleFilter]);

    return (
        <PageTransition>
            <div className="space-y-6 pb-12">

                {/* --- HERO HEADER BANNER --- */}
                <motion.div
                    initial={{ opacity: 0, y: -15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#041B5A] via-[#0A2F8F] to-[#0A0F1F] p-6 sm:p-8 text-white shadow-2xl shadow-[#041B5A]/20 border border-[#0D8BFF]/30"
                >
                    <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#0D8BFF]/25 rounded-full filter blur-3xl pointer-events-none" />
                    <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-purple-600/20 rounded-full filter blur-3xl pointer-events-none" />

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-bold text-cyan-300 mb-3 backdrop-blur-md">
                                <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse" />
                                <span>PANEL DE CONTROL ADMINISTRATIVO</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                                Administración de Usuarios
                            </h1>
                            <p className="text-slate-300 text-sm mt-1 max-w-xl font-medium">
                                Monitoreo y gestión centralizada de cuentas de usuario, asignación de roles y eliminación de cuentas del sistema.
                            </p>
                        </div>

                        <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/15 flex items-center gap-4 self-start md:self-center">
                            <div className="w-10 h-10 rounded-xl bg-[#0D8BFF]/20 border border-[#0D8BFF]/40 flex items-center justify-center font-black text-cyan-300 text-lg">
                                {stats.total}
                            </div>
                            <div>
                                <p className="text-xs text-slate-300 font-bold uppercase tracking-wider">Total Cuentas</p>
                                <p className="text-xs text-slate-400 font-medium">Registradas en sistema</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* --- TOAST FEEDBACK --- */}
                <AnimatePresence>
                    {toast.show && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={`p-4 rounded-2xl flex items-center justify-between shadow-lg border text-sm font-bold ${
                                toast.type === 'error'
                                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-600'
                                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700'
                            }`}
                        >
                            <span>{toast.message}</span>
                            <button onClick={() => setToast({ show: false, message: '', type: 'success' })} className="text-slate-400 hover:text-slate-600">✕</button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* --- STATS COUNTERS GRID --- */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Administradores', count: stats.admins, color: 'text-purple-600', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
                        { label: 'Doctores Tratantes', count: stats.doctors, color: 'text-emerald-600', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
                        { label: 'Pacientes Activos', count: stats.pacientes, color: 'text-cyan-600', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
                        { label: 'Total Registros', count: stats.total, color: 'text-[#0D8BFF]', bg: 'bg-[#0D8BFF]/10', border: 'border-[#0D8BFF]/20' },
                    ].map((s, idx) => (
                        <motion.div
                            key={s.label}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-white/85 backdrop-blur-xl p-5 rounded-3xl border border-white/80 shadow-lg shadow-[#041B5A]/5"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className={`text-2xl font-black ${s.color}`}>{s.count}</span>
                                <div className={`w-3 h-3 rounded-full ${s.bg} border ${s.border}`} />
                            </div>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{s.label}</p>
                        </motion.div>
                    ))}
                </div>

                {/* --- SEARCH & FILTER CONTROL BAR --- */}
                <div className="bg-white/85 backdrop-blur-xl p-4 rounded-3xl border border-white/80 shadow-xl shadow-[#041B5A]/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="relative w-full sm:w-80">
                        <span className="absolute left-3.5 top-3 text-slate-400 text-sm">🔍</span>
                        <input
                            type="text"
                            placeholder="Buscar por nombre o correo..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-800 font-medium focus:bg-white focus:border-[#0D8BFF] focus:ring-4 focus:ring-[#0D8BFF]/15 outline-none transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider whitespace-nowrap">Filtrar Rol:</span>
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="w-full sm:w-44 px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-700 focus:bg-white focus:border-[#0D8BFF] outline-none transition-all"
                        >
                            <option value="all">Todos los Roles</option>
                            <option value="paciente">Pacientes</option>
                            <option value="doctor">Doctores</option>
                            <option value="admin">Administradores</option>
                        </select>
                    </div>
                </div>

                {/* --- USERS TABLE CONTAINER --- */}
                <div className="bg-white/85 backdrop-blur-xl rounded-3xl border border-white/80 shadow-xl shadow-[#041B5A]/5 overflow-hidden">
                    {loading ? (
                        <div className="py-20 text-center flex flex-col items-center gap-3">
                            <div className="w-10 h-10 border-4 border-[#0D8BFF]/20 border-t-[#0D8BFF] rounded-full animate-spin" />
                            <p className="text-slate-400 font-medium text-sm">Cargando directorio de usuarios...</p>
                        </div>
                    ) : filteredUsers.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50/80 text-slate-400 font-extrabold text-[11px] uppercase tracking-wider border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4">Usuario</th>
                                        <th className="px-6 py-4">Correo Electrónico</th>
                                        <th className="px-6 py-4 text-center">Rol Actual</th>
                                        <th className="px-6 py-4 text-center">Alertas Emitidas</th>
                                        <th className="px-6 py-4 text-center">Registros Vitales</th>
                                        <th className="px-6 py-4 text-center">Cambiar Rol</th>
                                        <th className="px-6 py-4 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredUsers.map(u => {
                                        const badge = roleBadges[u.role] || { label: u.role, bg: 'bg-slate-100 text-slate-600 border-slate-200' };
                                        const isUpdating = updatingUser === u.id;
                                        const isDeleting = deletingUser === u.id;
                                        const isSelf = u.id === currentUser?.id;

                                        return (
                                            <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                                                <td className="px-6 py-4 font-bold text-slate-800">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#041B5A] to-[#0D8BFF] flex items-center justify-center text-white font-extrabold text-xs shadow-md">
                                                            {u.name?.charAt(0)?.toUpperCase() || 'U'}
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                                                <span>{u.name}</span>
                                                                {isSelf && (
                                                                    <span className="text-[10px] bg-purple-500/15 text-purple-600 border border-purple-500/30 px-2 py-0.5 rounded-full font-black uppercase">
                                                                        Tú
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-[11px] text-slate-400 font-medium">ID: {u.id}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-600 font-medium">{u.email}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-black border ${badge.bg}`}>
                                                        {badge.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-600 font-black text-xs">
                                                        {u.alerts_count || 0}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="px-2.5 py-1 rounded-xl bg-cyan-500/10 text-cyan-600 font-black text-xs">
                                                        {u.vital_signs_count || 0}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <select
                                                        value={u.role}
                                                        disabled={isUpdating || isDeleting}
                                                        onChange={(e) => changeRole(u, e.target.value)}
                                                        className="text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white text-slate-800 focus:ring-2 focus:ring-[#0D8BFF] outline-none transition-all cursor-pointer disabled:opacity-50"
                                                    >
                                                        <option value="paciente">Paciente</option>
                                                        <option value="doctor">Doctor</option>
                                                        <option value="admin">Administrador</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => deleteUser(u)}
                                                        disabled={isDeleting || isSelf}
                                                        title={isSelf ? 'No puedes eliminar tu propia cuenta' : 'Eliminar cuenta de usuario'}
                                                        className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 border border-rose-500/20 hover:border-rose-500/40 text-xs font-bold transition-all inline-flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                                    >
                                                        {isDeleting ? (
                                                            <span className="w-3.5 h-3.5 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" />
                                                        ) : (
                                                            <>
                                                                <span>🗑️</span>
                                                                <span>Eliminar</span>
                                                            </>
                                                        )}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="py-16 text-center text-slate-400 font-medium text-sm">
                            <p className="text-3xl mb-2">🔍</p>
                            <p>No se encontraron usuarios coincidentes.</p>
                        </div>
                    )}
                </div>
            </div>
        </PageTransition>
    );
}
