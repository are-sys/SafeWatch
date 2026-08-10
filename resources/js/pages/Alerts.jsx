import React, { useEffect, useState } from 'react';
import api from '../api';
import PageTransition from '../components/PageTransition';

const typeLabels = { sos: 'SOS', heart_rate: 'Ritmo cardíaco', oxygen: 'Oxígeno', temperature: 'Temperatura', blood_pressure: 'Presión', fall_detected: 'Caída' };
const sevColors = { critical: 'bg-red-500 shadow-md shadow-red-500/30', high: 'bg-amber-500 shadow-md shadow-amber-500/30', medium: 'bg-[#0D8BFF] shadow-md shadow-[#0D8BFF]/30', low: 'bg-emerald-500 shadow-md shadow-emerald-500/30' };

export default function Alerts() {
    const [alerts, setAlerts] = useState({ data: [] });
    const load = (url = '/alerts') => api.get(url).then(r => setAlerts(r.data));
    useEffect(() => { load(); }, []);

    const resolve = async (id) => { await api.patch(`/alerts/${id}/resolve`); load(); };

    const sendSOS = async () => {
        if (!confirm('¿Deseas enviar una alerta de emergencia SOS?')) return;
        await api.post('/alerts/sos', {});
        load();
    };

    return (
        <PageTransition>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A0F1F] tracking-tight">Centro de Alertas</h1>
                    <p className="text-slate-500 font-medium text-sm mt-1">Gestión de alertas médicas y respuestas de emergencia</p>
                </div>
                <button onClick={sendSOS}
                    className="w-14 h-14 rounded-full bg-gradient-to-tr from-red-600 to-rose-500 hover:from-rose-600 hover:to-red-700 text-white font-black text-xs btn-sos-pulse shadow-lg shadow-red-500/40 flex items-center justify-center flex-shrink-0">
                    SOS
                </button>
            </div>

            <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg shadow-[#041B5A]/5 border border-white/60 overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-base font-extrabold text-[#0A0F1F]">Historial de Alertas</h3>
                    <span className="text-xs text-slate-400 font-semibold">Total: {alerts.total || alerts.data?.length || 0}</span>
                </div>

                <div className="divide-y divide-slate-100">
                    {alerts.data?.map(a => (
                        <div key={a.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 hover:bg-[#0D8BFF]/5 transition-colors gap-3">
                            <div className="flex items-start gap-3.5">
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white text-xs font-black flex-shrink-0 ${sevColors[a.severity]}`}>
                                    {a.type === 'sos' ? '🚨' : a.type.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <span className={`text-[10px] px-2.5 py-0.5 rounded-lg font-black text-white uppercase tracking-wider ${sevColors[a.severity]}`}>
                                            {a.severity}
                                        </span>
                                        <span className="text-sm font-bold text-slate-800">{a.message}</span>
                                    </div>
                                    <div className="text-xs text-slate-400 font-medium flex items-center gap-2">
                                        <span>{new Date(a.created_at).toLocaleString('es', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                        {a.latitude && (
                                            <a href={`https://maps.google.com/?q=${a.latitude},${a.longitude}`}
                                                target="_blank" rel="noopener noreferrer" 
                                                className="text-[#0D8BFF] font-bold hover:underline inline-flex items-center gap-1">
                                                <span>📍 Ver ubicación GPS</span>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="self-end sm:self-center">
                                {a.resolved ? (
                                    <span className="text-xs px-3.5 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 font-bold border border-emerald-500/20">
                                        ✓ Resuelta
                                    </span>
                                ) : (
                                    <button onClick={() => resolve(a.id)}
                                        className="text-xs px-4 py-2 rounded-xl bg-gradient-to-r from-[#0D8BFF] to-[#1E5EFF] hover:from-[#1E5EFF] hover:to-[#1466CC] text-white font-bold shadow-md shadow-[#0D8BFF]/30 transition active:scale-95">
                                        Marcar Resuelta
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    {alerts.data?.length === 0 && (
                        <div className="text-center py-14 text-slate-400">
                            <p className="text-3xl mb-2">✨</p>
                            <p className="text-base font-extrabold text-[#041B5A]">Todo en perfecto orden</p>
                            <p className="text-xs text-slate-500 mt-1">No hay alertas ni emergencias registradas actualmente.</p>
                        </div>
                    )}
                </div>

                {alerts.last_page > 1 && (
                    <div className="flex justify-center gap-2 p-4 border-t border-slate-100 bg-white/50">
                        {Array.from({ length: alerts.last_page }, (_, i) => (
                            <button key={i} onClick={() => load(`/alerts?page=${i + 1}`)}
                                className={`w-9 h-9 rounded-xl text-xs font-bold transition ${
                                    alerts.current_page === i + 1 
                                        ? 'bg-gradient-to-r from-[#0D8BFF] to-[#1E5EFF] text-white shadow-md shadow-[#0D8BFF]/30' 
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}>
                                {i + 1}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </PageTransition>
    );
}

