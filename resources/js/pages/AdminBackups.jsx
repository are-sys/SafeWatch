import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import PageTransition from '../components/PageTransition';

function formatBytes(bytes) {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function AdminBackups() {
    const [backups, setBackups] = useState([]);
    const [stats, setStats] = useState(null);
    const [creating, setCreating] = useState(false);
    const [restoring, setRestoring] = useState(null);
    const [msg, setMsg] = useState({ text: '', type: 'success' });

    const load = () => {
        api.get('/admin/backups').then(r => setBackups(r.data)).catch(() => {});
        api.get('/admin/stats').then(r => setStats(r.data)).catch(() => {});
    };
    useEffect(() => { load(); }, []);

    const showMsg = (text, type = 'success') => {
        setMsg({ text, type });
        setTimeout(() => setMsg({ text: '', type: 'success' }), 4500);
    };

    const createBackup = async () => {
        setCreating(true);
        try {
            await api.post('/admin/backups');
            showMsg('¡Respaldo de la base de datos creado correctamente!');
            load();
        } catch {
            showMsg('Error al generar el respaldo de la base de datos', 'error');
        } finally {
            setCreating(false);
        }
    };

    const downloadBackup = async (id) => {
        try {
            const res = await api.get(`/admin/backups/${id}/download`);
            const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `safewatch-backup-${id}.json`;
            a.click();
            URL.revokeObjectURL(url);
            showMsg('Descarga del respaldo iniciada correctamente');
        } catch {
            showMsg('Error al descargar el archivo de respaldo', 'error');
        }
    };

    const restoreBackup = async (id) => {
        if (!confirm('⚠️ PRECAUCIÓN: Esto reemplazará los datos actuales por los del respaldo. ¿Deseas continuar?')) return;
        setRestoring(id);
        try {
            const res = await api.post(`/admin/backups/${id}/restore`);
            showMsg(`Restauración exitosa: ${res.data.documents_restored || 0} documentos procesados`);
            load();
        } catch {
            showMsg('Error al restaurar la base de datos', 'error');
        } finally {
            setRestoring(null);
        }
    };

    const deleteBackup = async (id) => {
        if (!confirm('¿Seguro que deseas eliminar este respaldo del historial?')) return;
        try {
            await api.delete(`/admin/backups/${id}`);
            showMsg('Respaldo eliminado correctamente');
            load();
        } catch {
            showMsg('Error al eliminar el respaldo', 'error');
        }
    };

    return (
        <PageTransition>
            <div className="space-y-6 pb-12">

                {/* --- TOP ADMIN HERO HEADER --- */}
                <motion.div
                    initial={{ opacity: 0, y: -15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#041B5A] via-[#0A2F8F] to-[#0A0F1F] p-6 sm:p-8 text-white shadow-2xl shadow-[#041B5A]/20 border border-[#0D8BFF]/30"
                >
                    <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#0D8BFF]/25 rounded-full filter blur-3xl pointer-events-none" />
                    <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-indigo-600/20 rounded-full filter blur-3xl pointer-events-none" />

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-bold text-cyan-300 mb-3 backdrop-blur-md">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                                <span>RESPALDOS Y SEGURIDAD MONGODB ATLAS</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                                Respaldos de Base de Datos
                            </h1>
                            <p className="text-slate-300 text-sm mt-1 max-w-xl font-medium">
                                Genera copias de seguridad de las colecciones biométricas de SafeWatch y gestiona los puntos de restauración del sistema.
                            </p>
                        </div>

                        <button
                            onClick={createBackup}
                            disabled={creating}
                            className="px-6 py-3.5 bg-gradient-to-r from-[#0D8BFF] to-[#1E5EFF] hover:from-[#1E5EFF] hover:to-[#0D8BFF] text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-[#0D8BFF]/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 self-start md:self-center"
                        >
                            {creating ? (
                                <>
                                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                    <span>Generando Copia...</span>
                                </>
                            ) : (
                                <>
                                    <span className="text-base">💾</span>
                                    <span>Crear Nuevo Respaldo</span>
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>

                {/* --- NOTIFICATION TOAST --- */}
                <AnimatePresence>
                    {msg.text && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={`p-4 rounded-2xl flex items-center justify-between shadow-lg border text-sm font-bold ${
                                msg.type === 'error'
                                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-600'
                                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700'
                            }`}
                        >
                            <span>{msg.text}</span>
                            <button onClick={() => setMsg({ text: '', type: 'success' })} className="text-slate-400 hover:text-slate-600">✕</button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* --- DATABASE METRICS CARDS --- */}
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {[
                            { label: 'Usuarios', value: stats.users, color: 'text-cyan-600', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
                            { label: 'Perfiles Clínicos', value: stats.medical_profiles, color: 'text-emerald-600', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
                            { label: 'Signos Vitales', value: stats.vital_signs, color: 'text-rose-600', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
                            { label: 'Alertas Totales', value: stats.alerts, color: 'text-amber-600', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
                            { label: 'Respaldos Guardados', value: stats.backups, color: 'text-purple-600', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
                        ].map((s, idx) => (
                            <motion.div
                                key={s.label}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-white/85 backdrop-blur-xl p-4 rounded-3xl border border-white/80 shadow-lg shadow-[#041B5A]/5 text-center"
                            >
                                <div className={`text-2xl sm:text-3xl font-black ${s.color}`}>{s.value?.toLocaleString() || 0}</div>
                                <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mt-1">{s.label}</div>
                            </motion.div>
                        ))}
                    </div>
                )}


                {/* --- BACKUPS HISTORY TABLE --- */}
                <div className="bg-white/85 backdrop-blur-xl rounded-3xl border border-white/80 shadow-xl shadow-[#041B5A]/5 overflow-hidden">
                    <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Historial de Respaldos Almacenados</h3>
                        <span className="text-xs font-bold text-[#0D8BFF] bg-[#0D8BFF]/10 px-3 py-1 rounded-full border border-[#0D8BFF]/20">
                            {backups.length} Archivos
                        </span>
                    </div>

                    {backups.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                            {backups.map(b => (
                                <div key={b.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                                    <div className="space-y-1">
                                        <div className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                                            <span>📄 {b.name}</span>
                                        </div>
                                        <div className="text-xs text-slate-500 font-medium flex flex-wrap items-center gap-2">
                                            <span>📅 {new Date(b.created_at).toLocaleString('es-MX')}</span>
                                            <span>•</span>
                                            <span>📦 {b.total_documents} docs</span>
                                            <span>•</span>
                                            <span>💾 {formatBytes(b.size_bytes)}</span>
                                            <span>•</span>
                                            <span className="text-slate-400">Por: {b.created_by || 'Admin'}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5 pt-1">
                                            {b.collections?.map(c => (
                                                <span key={c} className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full border border-slate-200">
                                                    {c}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                        <button
                                            onClick={() => downloadBackup(b.id)}
                                            className="px-3.5 py-2 bg-[#0D8BFF] hover:bg-[#1E5EFF] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                                        >
                                            Descargar
                                        </button>
                                        <button
                                            onClick={() => restoreBackup(b.id)}
                                            disabled={restoring === b.id}
                                            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                                        >
                                            {restoring === b.id ? 'Restaurando...' : 'Restaurar'}
                                        </button>
                                        <button
                                            onClick={() => deleteBackup(b.id)}
                                            className="px-3.5 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 text-slate-400 font-medium">
                            <p className="text-3xl mb-2">📦</p>
                            <p className="text-slate-600 font-bold">No hay respaldos generados aún.</p>
                            <p className="text-xs text-slate-400 mt-1">Utiliza el botón superior para crear una copia de seguridad.</p>
                        </div>
                    )}
                </div>
            </div>
        </PageTransition>
    );
}
