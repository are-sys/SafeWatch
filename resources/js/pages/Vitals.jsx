import React, { useEffect, useState } from 'react';
import api from '../api';
import PageTransition from '../components/PageTransition';
import { getStorageItem, setStorageItem } from '../utils/storage';

export default function Vitals() {
    const cachedVitals = getStorageItem('safewatch_vitals_cache', { data: [] });
    const [vitals, setVitals] = useState(cachedVitals);

    const load = (url = '/vitals') => {
        api.get(url).then(r => {
            setVitals(r.data);
            setStorageItem('safewatch_vitals_cache', r.data);
        }).catch(err => {
            console.log('Using local storage cached vitals:', err);
        });
    };

    useEffect(() => { load(); }, []);

    return (
        <PageTransition>
            <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A0F1F] tracking-tight">Historial de Signos Vitales</h1>
                <p className="text-slate-500 font-medium text-sm mt-1">Consulta la evolución de tus métricas biométricas capturadas</p>
            </div>

            {/* Vitals History Table */}
            <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg shadow-[#041B5A]/5 border border-white/60 overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-base font-extrabold text-[#0A0F1F]">Historial de Mediciones</h3>
                    <span className="text-xs text-slate-400 font-semibold">Total registros: {vitals.total || vitals.data?.length || 0}</span>
                </div>

                {/* Mobile View (< md) */}
                <div className="md:hidden divide-y divide-slate-100">
                    {vitals.data?.map(v => {
                        const ml = v.ml_analysis || {};
                        return (
                            <div key={v.id} className="p-4 space-y-3 bg-white hover:bg-slate-50/60 transition-colors">
                                <div className="flex justify-between items-center text-xs border-b border-slate-100 pb-2">
                                    <span className="font-bold text-slate-700">
                                        📅 {new Date(v.recorded_at).toLocaleString('es', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <div>
                                        {ml.is_anomaly ? (
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-500/10 text-purple-600 border border-purple-200">
                                                ⚡ Valor Inusual ({ml.anomaly_score})
                                            </span>
                                        ) : ml.risk_level === 'critical' ? (
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-500/10 text-red-600 border border-red-200">
                                                ⚠️ Riesgo Alto
                                            </span>
                                        ) : (
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-200">
                                                ✓ Saludable
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="bg-red-50/60 p-2.5 rounded-xl border border-red-100/60">
                                        <span className="text-slate-400 font-semibold block text-[10px] uppercase">Ritmo Cardíaco</span>
                                        <span className="text-red-500 font-black text-base">{v.heart_rate ?? '-'} BPM</span>
                                    </div>
                                    <div className="bg-sky-50/60 p-2.5 rounded-xl border border-sky-100/60">
                                        <span className="text-slate-400 font-semibold block text-[10px] uppercase">Oxígeno SpO2</span>
                                        <span className="text-[#0D8BFF] font-black text-base">{v.oxygen_saturation ? `${v.oxygen_saturation}%` : '-'}</span>
                                    </div>
                                    <div className="bg-amber-50/60 p-2.5 rounded-xl border border-amber-100/60">
                                        <span className="text-slate-400 font-semibold block text-[10px] uppercase">Temperatura</span>
                                        <span className="text-amber-600 font-black text-base">{v.temperature ? `${v.temperature} °C` : '-'}</span>
                                    </div>
                                    <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100/60">
                                        <span className="text-slate-400 font-semibold block text-[10px] uppercase">Presión</span>
                                        <span className="text-emerald-600 font-black text-base">{v.blood_pressure_systolic ? `${v.blood_pressure_systolic}/${v.blood_pressure_diastolic}` : '-'}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Desktop View (>= md) */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-[#041B5A] text-white text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-5 py-3.5 text-left font-extrabold">Fecha y Hora</th>
                                <th className="px-5 py-3.5 text-center font-extrabold">BPM</th>
                                <th className="px-5 py-3.5 text-center font-extrabold">SpO2</th>
                                <th className="px-5 py-3.5 text-center font-extrabold">Temp</th>
                                <th className="px-5 py-3.5 text-center font-extrabold">Presión</th>
                                <th className="px-5 py-3.5 text-center font-extrabold">Pasos</th>
                                <th className="px-5 py-3.5 text-center font-extrabold">Diagnóstico</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {vitals.data?.map(v => {
                                const ml = v.ml_analysis || {};
                                return (
                                    <tr key={v.id} className="hover:bg-[#0D8BFF]/5 transition-colors">
                                        <td className="px-5 py-3.5 font-medium text-slate-700">
                                            {new Date(v.recorded_at).toLocaleString('es', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="px-5 py-3.5 text-center font-extrabold text-red-500">{v.heart_rate ?? '-'}</td>
                                        <td className="px-5 py-3.5 text-center font-extrabold text-[#0D8BFF]">{v.oxygen_saturation ? `${v.oxygen_saturation}%` : '-'}</td>
                                        <td className="px-5 py-3.5 text-center font-bold text-amber-600">{v.temperature ? `${v.temperature} °C` : '-'}</td>
                                        <td className="px-5 py-3.5 text-center font-bold text-emerald-600">{v.blood_pressure_systolic ? `${v.blood_pressure_systolic}/${v.blood_pressure_diastolic}` : '-'}</td>
                                        <td className="px-5 py-3.5 text-center font-semibold text-slate-600">{(v.steps || 0).toLocaleString()}</td>
                                        <td className="px-5 py-3.5 text-center font-semibold">
                                            {ml.is_anomaly ? (
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple500/10 text-purple-600 border border-purple-200">
                                                    ⚡ Valor Inusual ({ml.anomaly_score})
                                                </span>
                                            ) : ml.risk_level === 'critical' ? (
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-500/10 text-red-600 border border-red-200">
                                                    ⚠️ Riesgo Alto
                                                </span>
                                            ) : (
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-200">
                                                    ✓ Saludable
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            {vitals.data?.length === 0 && (
                                <tr><td colSpan="7" className="text-center py-10 text-slate-400 font-medium">No se han encontrado registros biométricos aún.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {vitals.last_page > 1 && (
                    <div className="flex justify-center gap-2 p-4 border-t border-slate-100 bg-white/50">
                        {Array.from({ length: vitals.last_page }, (_, i) => (
                            <button key={i} onClick={() => load(`/vitals?page=${i + 1}`)}
                                className={`w-9 h-9 rounded-xl text-xs font-bold transition ${
                                    vitals.current_page === i + 1 
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
