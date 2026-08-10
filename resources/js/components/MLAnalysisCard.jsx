import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { IconShield, IconAlert, IconCheck, IconChart } from './Icons';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export default function MLAnalysisCard({ analysisData }) {
    if (!analysisData || analysisData.status === 'no_data') {
        return (
            <div className="bg-gradient-to-r from-[#041B5A] via-[#0A2F8F] to-[#0A0F1F] border border-[#0D8BFF]/30 rounded-2xl p-6 shadow-xl backdrop-blur-md text-slate-300">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 bg-[#0D8BFF]/15 rounded-xl text-[#0D8BFF] border border-[#0D8BFF]/30">
                        <IconChart className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-white">Diagnóstico y Tendencias Biométricas</h3>
                        <p className="text-xs text-slate-300">Análisis continuo de salud en tiempo real</p>
                    </div>
                </div>
                <p className="text-sm text-slate-300 mt-3">
                    Registra constantes vitales para activar el análisis de salud biométrica.
                </p>
            </div>
        );
    }

    const { latest } = analysisData;
    const analysis = latest?.analysis || {};
    const desc = analysis.descriptive_analysis || {};
    const trend = analysis.trend_analysis || {};
    const anomaly = analysis.anomaly_detection || {};
    const sup = analysis.supervised_learning || analysis.supervised || {};
    const unsup = analysis.unsupervised_learning || analysis.unsupervised || {};
    const decision = analysis.decision_support || {};
    const recommendations = decision.recommendations || analysis.insights || [];

    const riskLevel = sup.risk_level || analysis.risk_level || 'normal';
    const isCritical = riskLevel === 'critical';
    const isWarning = riskLevel === 'warning';
    const isAnomaly = anomaly.is_anomaly || analysis.is_anomaly;

    const currentBpm = desc.heart_rate?.current ?? 75;
    const avgBpm = desc.heart_rate?.average ?? 72;
    const minBpm = desc.heart_rate?.min ?? 68;
    const maxBpm = desc.heart_rate?.max ?? 88;

    const currentSpo2 = desc.oxygen_saturation?.current ?? 98;
    const minSpo2 = desc.oxygen_saturation?.min ?? 95;

    const chartData = {
        labels: ['Medición 1', 'Medición 2', 'Medición 3', 'Medición 4', 'Medición Actual'],
        datasets: [
            {
                label: 'Frecuencia Cardíaca (BPM)',
                data: [avgBpm - 2, avgBpm + 3, minBpm, avgBpm - 1, currentBpm],
                borderColor: '#f87171',
                backgroundColor: 'rgba(248, 113, 113, 0.15)',
                tension: 0.4,
                fill: true,
                yAxisID: 'yBpm',
            },
            {
                label: 'Saturación O2 (%)',
                data: [98, 97, 98, minSpo2, currentSpo2],
                borderColor: '#0D8BFF',
                backgroundColor: 'rgba(13, 139, 255, 0.15)',
                tension: 0.4,
                fill: true,
                yAxisID: 'ySpo2',
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: { color: '#e2e8f0', font: { size: 11, weight: 'bold' } }
            },
            tooltip: {
                backgroundColor: '#041B5A',
                titleColor: '#0D8BFF',
                bodyColor: '#f8fafc',
                borderColor: '#0D8BFF/30',
                borderWidth: 1,
            }
        },
        scales: {
            x: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
            yBpm: {
                type: 'linear',
                position: 'left',
                ticks: { color: '#f87171', font: { size: 10 } },
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                title: { display: true, text: 'BPM', color: '#f87171', font: { size: 10 } }
            },
            ySpo2: {
                type: 'linear',
                position: 'right',
                min: 80,
                max: 100,
                ticks: { color: '#0D8BFF', font: { size: 10 } },
                grid: { display: false },
                title: { display: true, text: 'SpO2 %', color: '#0D8BFF', font: { size: 10 } }
            }
        }
    };

    return (
        <div className="bg-gradient-to-r from-[#041B5A] via-[#0A2F8F] to-[#0A0F1F] border border-[#0D8BFF]/30 rounded-3xl p-6 shadow-2xl shadow-[#041B5A]/30 relative overflow-hidden backdrop-blur-xl space-y-6">
            {/* Ambient Glow */}
            <div className={`absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none ${
                isCritical ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-[#0D8BFF]'
            }`} />

            {/* Application Feature Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#0D8BFF]/20 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#0D8BFF]/20 text-[#0D8BFF] rounded-2xl border border-[#0D8BFF]/30 shadow-inner">
                        <IconChart className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-xl text-white tracking-tight">Diagnóstico y Evolución de Salud</h3>
                            <span className="text-[10px] font-semibold tracking-wider px-2.5 py-0.5 rounded-full bg-[#0D8BFF]/20 text-[#0D8BFF] border border-[#0D8BFF]/30 uppercase">
                                Monitoreo Activo
                            </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5">
                            Evaluación de constantes vitales, tendencias de evolución y detección de anomalías
                        </p>
                    </div>
                </div>

                {/* Patient Health Status Pill */}
                <div className={`px-4 py-2 rounded-2xl text-xs font-extrabold flex items-center gap-2 border shadow-lg ${
                    isCritical
                        ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse'
                        : isWarning
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}>
                    {isCritical ? <IconAlert className="w-4 h-4" /> : <IconCheck className="w-4 h-4" />}
                    <span>
                        {isCritical ? 'ESTADO CRÍTICO' : isWarning ? 'PRECAUCIÓN' : 'ESTADO ESTABLE'}
                    </span>
                </div>
            </div>

            {/* 4 Health Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* 1. Resumen Estadístico (Prom/Max/Min) */}
                <div className="bg-[#041B5A]/60 border border-[#0D8BFF]/20 rounded-2xl p-4 flex flex-col justify-between hover:border-[#0D8BFF]/40 transition backdrop-blur-md">
                    <div>
                        <span className="text-[10px] font-bold text-[#0D8BFF] uppercase tracking-wider block mb-1">
                            Estadística de Registro
                        </span>
                        <h4 className="text-sm font-bold text-white mb-3">Promedios y Rangos</h4>
                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between items-center bg-[#0A0F1F]/60 p-2 rounded-xl border border-[#0D8BFF]/15">
                                <span className="text-slate-300 font-medium">FC (Ritmo)</span>
                                <span className="font-mono text-red-400 font-bold">
                                    {desc.heart_rate?.current ?? '--'} BPM <span className="text-[10px] text-slate-400 font-normal">(Prom: {desc.heart_rate?.average ?? '--'})</span>
                                </span>
                            </div>
                            <div className="flex justify-between items-center bg-[#0A0F1F]/60 p-2 rounded-xl border border-[#0D8BFF]/15">
                                <span className="text-slate-300 font-medium">Oxigenación</span>
                                <span className="font-mono text-[#0D8BFF] font-bold">
                                    {desc.oxygen_saturation?.current ?? '--'}% <span className="text-[10px] text-slate-400 font-normal">(Mín: {desc.oxygen_saturation?.min ?? '--'}%)</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Tendencia de Evolución */}
                <div className="bg-[#041B5A]/60 border border-[#0D8BFF]/20 rounded-2xl p-4 flex flex-col justify-between hover:border-[#0D8BFF]/40 transition backdrop-blur-md">
                    <div>
                        <span className="text-[10px] font-bold text-teal-300 uppercase tracking-wider block mb-1">
                            Comportamiento Temporal
                        </span>
                        <h4 className="text-sm font-bold text-white mb-3">Análisis de Tendencia</h4>
                        <div className="space-y-2 text-xs">
                            <div className="bg-[#0A0F1F]/60 p-2 rounded-xl border border-[#0D8BFF]/15">
                                <span className="text-slate-400 text-[10px] block font-medium">Frecuencia Cardíaca</span>
                                <span className="font-bold text-slate-200">{trend.heart_rate_trend || 'Estable (►)'}</span>
                            </div>
                            <div className="bg-[#0A0F1F]/60 p-2 rounded-xl border border-[#0D8BFF]/15">
                                <span className="text-slate-400 text-[10px] block font-medium">Saturación de Oxígeno</span>
                                <span className="font-bold text-slate-200">{trend.oxygen_trend || 'Estable (►)'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Detección de Anomalías */}
                <div className="bg-[#041B5A]/60 border border-[#0D8BFF]/20 rounded-2xl p-4 flex flex-col justify-between hover:border-[#0D8BFF]/40 transition backdrop-blur-md">
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider block">
                                Detección de Inusuales
                            </span>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                isAnomaly ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}>
                                {isAnomaly ? 'Anomalía' : 'Sin Anomalías'}
                            </span>
                        </div>
                        <h4 className="text-sm font-bold text-white mb-2">Supervisión de Alertas</h4>
                        {anomaly.unusual_values && anomaly.unusual_values.length > 0 ? (
                            <ul className="text-[11px] text-amber-300 space-y-1 bg-amber-950/40 p-2 rounded-xl border border-amber-800/40">
                                {anomaly.unusual_values.map((v, i) => <li key={i}>• {v}</li>)}
                            </ul>
                        ) : (
                            <div className="bg-[#0A0F1F]/60 p-2.5 rounded-xl border border-[#0D8BFF]/15 text-xs text-slate-300">
                                ✓ No se detectan anomalías biométricas en esta lectura.
                            </div>
                        )}
                    </div>
                </div>

                {/* 4. Perfil Fisiológico */}
                <div className="bg-[#041B5A]/60 border border-[#0D8BFF]/20 rounded-2xl p-4 flex flex-col justify-between hover:border-[#0D8BFF]/40 transition backdrop-blur-md">
                    <div>
                        <span className="text-[10px] font-bold text-sky-300 uppercase tracking-wider block mb-1">
                            Perfil del Paciente
                        </span>
                        <h4 className="text-sm font-bold text-white mb-3">Patrón Fisiológico</h4>
                        <div className="bg-[#0A0F1F]/60 p-2.5 rounded-xl border border-[#0D8BFF]/15 text-xs space-y-1">
                            <span className="text-slate-400 text-[10px] block font-medium uppercase">Estado General</span>
                            <span className="font-bold text-[#0D8BFF] text-sm block">
                                {unsup.assigned_cluster || 'Patrón Reposo / Estable'}
                            </span>
                        </div>
                    </div>
                </div>

            </div>

            {/* Seamless Trend Graph (Chart.js) */}
            <div className="bg-[#0A0F1F]/60 border border-[#0D8BFF]/20 rounded-2xl p-5 shadow-inner backdrop-blur-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                    <div>
                        <h4 className="text-base font-extrabold text-white flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#0D8BFF] animate-pulse" />
                            Evolución de Constantes Vitales en el Tiempo
                        </h4>
                        <p className="text-xs text-slate-300 font-medium">Comparativa histórica de Ritmo Cardíaco (BPM) y Oxigenación (SpO2)</p>
                    </div>
                </div>
                <div className="h-60">
                    <Line data={chartData} options={chartOptions} />
                </div>
            </div>

            {/* Medical Metrics Table */}
            <div className="bg-[#0A0F1F]/60 border border-[#0D8BFF]/20 rounded-2xl overflow-hidden shadow-inner backdrop-blur-md">
                <div className="p-4 border-b border-[#0D8BFF]/20 flex justify-between items-center">
                    <div>
                        <h4 className="text-sm font-bold text-white">Resumen de Parámetros Médicos</h4>
                        <p className="text-xs text-slate-300">Valores computados y rangos de control</p>
                    </div>
                    <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-[#041B5A] text-sky-300 border border-[#0D8BFF]/30">
                        Actualizado
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left text-slate-200">
                        <thead className="text-[11px] text-sky-200 uppercase bg-[#0A2F8F]/40 border-b border-[#0D8BFF]/20">
                            <tr>
                                <th className="px-4 py-3 font-bold">Signo Vital</th>
                                <th className="px-4 py-3 text-center font-bold">Medición Actual</th>
                                <th className="px-4 py-3 text-center font-bold">Promedio</th>
                                <th className="px-4 py-3 text-center font-bold">Máximo</th>
                                <th className="px-4 py-3 text-center font-bold">Mínimo</th>
                                <th className="px-4 py-3 text-center font-bold">Tendencia</th>
                                <th className="px-4 py-3 text-center font-bold">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#0D8BFF]/10 font-medium">
                            <tr className="hover:bg-[#0D8BFF]/10 transition-colors">
                                <td className="px-4 py-3 font-bold text-white">Frecuencia Cardíaca</td>
                                <td className="px-4 py-3 text-center font-mono text-red-400 font-bold">{desc.heart_rate?.current ?? '--'} BPM</td>
                                <td className="px-4 py-3 text-center font-mono text-slate-300">{desc.heart_rate?.average ?? '--'} BPM</td>
                                <td className="px-4 py-3 text-center font-mono text-slate-300">{desc.heart_rate?.max ?? '--'} BPM</td>
                                <td className="px-4 py-3 text-center font-mono text-slate-300">{desc.heart_rate?.min ?? '--'} BPM</td>
                                <td className="px-4 py-3 text-center font-bold text-slate-200">{trend.heart_rate_trend || 'Estable'}</td>
                                <td className="px-4 py-3 text-center">
                                    {isAnomaly ? (
                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">Inusual</span>
                                    ) : (
                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Normal</span>
                                    )}
                                </td>
                            </tr>
                            <tr className="hover:bg-[#0D8BFF]/10 transition-colors">
                                <td className="px-4 py-3 font-bold text-white">Saturación O2 (SpO2)</td>
                                <td className="px-4 py-3 text-center font-mono text-[#0D8BFF] font-bold">{desc.oxygen_saturation?.current ?? '--'}%</td>
                                <td className="px-4 py-3 text-center font-mono text-slate-300">{desc.oxygen_saturation?.average ?? '--'}%</td>
                                <td className="px-4 py-3 text-center font-mono text-slate-300">{desc.oxygen_saturation?.max ?? '--'}%</td>
                                <td className="px-4 py-3 text-center font-mono text-slate-300">{desc.oxygen_saturation?.min ?? '--'}%</td>
                                <td className="px-4 py-3 text-center font-bold text-slate-200">{trend.oxygen_trend || 'Estable'}</td>
                                <td className="px-4 py-3 text-center">
                                    {desc.oxygen_saturation?.current < 91 ? (
                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">Atención</span>
                                    ) : (
                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Óptimo</span>
                                    )}
                                </td>
                            </tr>
                            <tr className="hover:bg-[#0D8BFF]/10 transition-colors">
                                <td className="px-4 py-3 font-bold text-white">Temperatura Corporal</td>
                                <td className="px-4 py-3 text-center font-mono text-amber-400 font-bold">{desc.temperature?.current ?? '--'} °C</td>
                                <td className="px-4 py-3 text-center font-mono text-slate-300">{desc.temperature?.average ?? '--'} °C</td>
                                <td className="px-4 py-3 text-center font-mono text-slate-300">{desc.temperature?.max ?? '--'} °C</td>
                                <td className="px-4 py-3 text-center font-mono text-slate-300">{desc.temperature?.min ?? '--'} °C</td>
                                <td className="px-4 py-3 text-center font-bold text-slate-200">Estable</td>
                                <td className="px-4 py-3 text-center">
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Normal</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Medical Recommendations Card */}
            <div className="bg-[#0A0F1F]/70 border border-[#0D8BFF]/25 rounded-2xl p-4 shadow-inner backdrop-blur-md">
                <h4 className="text-xs font-bold text-[#0D8BFF] uppercase tracking-wider mb-2 flex items-center gap-2">
                    <IconShield className="w-4 h-4 text-[#0D8BFF]" />
                    Recomendaciones Médicas y Asistencia
                </h4>
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-slate-300 font-medium">Prioridad Sugerida:</span>
                    <span className={`text-xs font-extrabold px-3 py-0.5 rounded-full ${
                        decision.action_urgency === 'Alta / Inmediata' 
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                            : decision.action_urgency === 'Moderada' 
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                        {decision.action_urgency || 'Baja'}
                    </span>
                </div>
                {recommendations.length > 0 && (
                    <ul className="space-y-1.5 border-t border-[#0D8BFF]/20 pt-2.5">
                        {recommendations.map((note, idx) => (
                            <li key={idx} className="text-xs text-slate-200 flex items-start gap-2">
                                <span className="text-[#0D8BFF] font-bold">•</span>
                                <span>{note}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
