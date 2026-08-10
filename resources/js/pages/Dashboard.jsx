import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip } from 'chart.js';
import api from '../api';
import PageTransition from '../components/PageTransition';
import MLAnalysisCard from '../components/MLAnalysisCard';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

const cardAnim = (i) => ({ 
    initial: { opacity: 0, y: 20 }, 
    animate: { opacity: 1, y: 0 }, 
    transition: { delay: i * 0.08, duration: 0.4 } 
});

export default function Dashboard() {
    const [data, setData] = useState(null);
    const [mlData, setMlData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.get('/dashboard'),
            api.get('/vitals/ml-analysis').catch(() => null)
        ]).then(([dashRes, mlRes]) => {
            setData(dashRes.data);
            if (mlRes) setMlData(mlRes.data);
        }).finally(() => setLoading(false));
    }, []);

    const sendSOS = async () => {
        if (!confirm('¿Deseas enviar una alerta de emergencia SOS de SafeWatch?')) return;
        let lat = null, lng = null;
        if (navigator.geolocation) {
            try {
                const pos = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej));
                lat = pos.coords.latitude;
                lng = pos.coords.longitude;
            } catch {}
        }
        await api.post('/alerts/sos', { latitude: lat, longitude: lng });
        api.get('/dashboard').then(r => setData(r.data));
    };

    if (loading) return (
        <div className="flex flex-col justify-center items-center py-36 gap-4">
            <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-[#0D8BFF]/20 border-t-[#0D8BFF] animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="w-3 h-3 rounded-full bg-[#0D8BFF] animate-ping" />
                </div>
            </div>
            <p className="text-slate-400 font-medium text-sm animate-pulse">Cargando tablero biométrico SafeWatch...</p>
        </div>
    );

    const v = data?.latestVitals;
    const hr = data?.heartRateHistory || [];

    const chartData = {
        labels: hr.map(h => new Date(h.recorded_at).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })),
        datasets: [{
            label: 'Ritmo Cardíaco (BPM)',
            data: hr.map(h => h.heart_rate),
            borderColor: '#0D8BFF',
            borderWidth: 3.5,
            backgroundColor: (context) => {
                const ctx = context.chart.ctx;
                const gradient = ctx.createLinearGradient(0, 0, 0, 260);
                gradient.addColorStop(0, 'rgba(13, 139, 255, 0.4)');
                gradient.addColorStop(0.7, 'rgba(30, 94, 255, 0.08)');
                gradient.addColorStop(1, 'rgba(13, 139, 255, 0.0)');
                return gradient;
            },
            fill: true,
            tension: 0.42,
            pointRadius: 4,
            pointBackgroundColor: '#1E5EFF',
            pointBorderColor: '#FFFFFF',
            pointBorderWidth: 2.5,
            pointHoverRadius: 8,
            pointHoverBackgroundColor: '#0D8BFF',
            pointHoverBorderColor: '#FFFFFF',
            pointHoverBorderWidth: 3,
        }],
    };

    const stepPercentage = Math.min(100, Math.round(((data?.todaySteps || 0) / 8000) * 100));

    return (
        <PageTransition>
            {/* Top Dynamic Header Hero */}
            <motion.div 
                {...cardAnim(0)}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#041B5A] via-[#0A2F8F] to-[#0A0F1F] p-6 sm:p-8 text-white shadow-2xl shadow-[#041B5A]/20 mb-8 border border-[#0D8BFF]/30"
            >
                {/* Background Ambient Glow Accent */}
                <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#0D8BFF]/25 rounded-full filter blur-3xl pointer-events-none" />
                <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-[#1E5EFF]/20 rounded-full filter blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-bold text-[#0D8BFF] mb-3 backdrop-blur-md">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span>MONITOREO EN VIVO — SAFEWATCH</span>
                        </div>

                        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                            ¡Hola, <span className="bg-gradient-to-r from-white via-sky-200 to-[#0D8BFF] bg-clip-text text-transparent">{data?.user?.name}</span>! 👋
                        </h1>
                        <p className="text-slate-300 font-medium text-sm mt-1.5 max-w-xl">
                            Estado biométrico bajo control. Registros actualizados en tiempo real mediante sensores inteligentes SafeWatch.
                        </p>

                        <div className="flex flex-wrap items-center gap-3 mt-4 text-xs font-semibold text-slate-300">
                            <span className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                Sistema Saludable
                            </span>
                        </div>
                    </div>

                    {/* SOS Emergency Trigger Button */}
                    <div className="flex flex-col items-center justify-center self-start md:self-center">
                        <button 
                            onClick={sendSOS}
                            className="relative group w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-red-600 via-rose-500 to-red-600 hover:from-rose-500 hover:to-red-700 text-white font-black text-xl sm:text-2xl btn-sos-pulse shadow-2xl shadow-red-500/50 flex flex-col items-center justify-center border-4 border-white/30 transition-transform active:scale-95 cursor-pointer"
                            title="Presionar para emitir alerta de emergencia SOS"
                        >
                            <span>SOS</span>
                            <span className="text-[9px] tracking-wider uppercase font-bold text-white/90 -mt-1">Emergencia</span>
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Vitals Summary Dynamic Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
                {[
                    { label: 'Ritmo Cardíaco', value: v?.heart_rate ? `${v.heart_rate} BPM` : '--', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', status: 'Estable', tag: 'FC' },
                    { label: 'Saturación O2', value: v?.oxygen_saturation ? `${v.oxygen_saturation}%` : '--', color: 'text-[#0D8BFF]', bg: 'bg-[#0D8BFF]/10', border: 'border-[#0D8BFF]/20', status: 'Óptimo', tag: 'O2' },
                    { label: 'Temperatura', value: v?.temperature ? `${v.temperature} °C` : '--', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', status: 'Normal', tag: 'T' },
                    { label: 'Presión Arterial', value: v?.blood_pressure_systolic ? `${v.blood_pressure_systolic}/${v.blood_pressure_diastolic}` : '--', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', status: 'Normal', tag: 'PA' },
                ].map((item, i) => (
                    <motion.div 
                        key={item.label} 
                        {...cardAnim(i + 1)} 
                        className="bg-white/85 backdrop-blur-xl rounded-3xl p-5 border border-white/80 shadow-lg shadow-[#041B5A]/5 hover:shadow-2xl hover:shadow-[#0D8BFF]/15 transition-all duration-300 hover:-translate-y-1 group"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className={`w-11 h-11 ${item.bg} ${item.border} border rounded-2xl flex items-center justify-center font-black text-sm ${item.color} shadow-sm group-hover:scale-110 transition-transform`}>
                                {item.tag}
                            </div>
                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${item.bg} ${item.color} border ${item.border}`}>
                                {item.status}
                            </span>
                        </div>

                        <div>
                            <div className={`text-2xl sm:text-3xl font-black ${item.color} tracking-tight`}>{item.value}</div>
                            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">{item.label}</div>
                        </div>

                        {/* Mini visual trend meter */}
                        <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-center gap-1.5">
                            <div className="h-1.5 flex-1 rounded-full bg-slate-100 overflow-hidden">
                                <div className={`h-full rounded-full ${item.color.replace('text-', 'bg-')}`} style={{ width: '85%' }} />
                            </div>
                            <span className="text-[10px] font-bold text-slate-400">Ref OK</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Middle Section: Daily Activity & Heart Rate Chart */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
                {/* Steps & Daily Activity Card */}
                <motion.div 
                    {...cardAnim(5)} 
                    className="bg-white/85 backdrop-blur-xl rounded-3xl p-6 border border-white/80 shadow-xl shadow-[#041B5A]/5 flex flex-col justify-between hover-lift relative overflow-hidden"
                >
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#0D8BFF]" />
                                <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Actividad Diaria</span>
                            </div>
                            <span className="px-2.5 py-1 rounded-xl bg-[#0D8BFF]/10 text-[#0D8BFF] text-xs font-black">HOY</span>
                        </div>

                        <div className="my-3">
                            <div className="text-4xl sm:text-5xl font-black text-[#041B5A] tracking-tight">
                                {(data?.todaySteps || 0).toLocaleString()}
                            </div>
                            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Pasos recorridos</div>
                        </div>

                        {/* Animated Progress Bar */}
                        <div className="my-5">
                            <div className="flex justify-between text-xs font-bold mb-1.5 text-slate-600">
                                <span>Meta: 8,000 pasos</span>
                                <span className="text-[#0D8BFF] font-black">{stepPercentage}%</span>
                            </div>
                            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60 shadow-inner">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${stepPercentage}%` }}
                                    transition={{ duration: 1, ease: 'easeOut' }}
                                    className="h-full rounded-full bg-gradient-to-r from-[#0D8BFF] to-[#1E5EFF] shadow-md shadow-[#0D8BFF]/40"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span>Progreso activo</span>
                        </div>
                        <span className="text-[#0D8BFF] font-extrabold">SafeWatch Tracker</span>
                    </div>
                </motion.div>

                {/* Dynamic Heart Rate Chart */}
                <motion.div 
                    {...cardAnim(6)} 
                    className="md:col-span-2 bg-white/85 backdrop-blur-xl rounded-3xl p-6 border border-white/80 shadow-xl shadow-[#041B5A]/5"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
                        <div>
                            <h3 className="text-base font-extrabold text-[#0A0F1F] flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-[#0D8BFF] animate-pulse" />
                                Historial de Ritmo Cardíaco (BPM)
                            </h3>
                            <p className="text-xs text-slate-400 font-medium">Lecturas biométricas registradas durante el día</p>
                        </div>
                        <span className="self-start sm:self-center text-[11px] font-black px-3 py-1 rounded-full bg-[#0D8BFF]/10 text-[#0D8BFF] border border-[#0D8BFF]/20 uppercase">
                            Lecturas en Vivo
                        </span>
                    </div>

                    {hr.length > 0 ? (
                        <div className="h-60 sm:h-64">
                            <Line data={chartData} options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { 
                                    legend: { display: false }, 
                                    tooltip: { 
                                        backgroundColor: '#041B5A',
                                        titleFont: { size: 12, weight: 'bold' },
                                        bodyFont: { size: 12 },
                                        padding: 12,
                                        cornerRadius: 14,
                                        displayColors: false,
                                        callbacks: {
                                            label: (item) => ` ${item.raw} BPM`
                                        }
                                    } 
                                },
                                scales: {
                                    x: { ticks: { color: '#64748b', font: { size: 10, weight: '700' } }, grid: { display: false } },
                                    y: { ticks: { color: '#64748b', font: { size: 10, weight: '700' } }, grid: { color: '#f1f5f9' }, suggestedMin: 50, suggestedMax: 130 },
                                },
                            }} />
                        </div>
                    ) : (
                        <div className="h-60 flex flex-col items-center justify-center text-slate-400 text-sm font-medium gap-2">
                            <span className="text-2xl">🩺</span>
                            <span>Sin lecturas biométricas registradas el día de hoy.</span>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Machine Learning Analysis Model Card */}
            <motion.div {...cardAnim(7)} className="mb-8">
                <MLAnalysisCard analysisData={mlData} />
            </motion.div>

            {/* Active Alerts Feed Section */}
            <motion.div 
                {...cardAnim(8)} 
                className="bg-white/85 backdrop-blur-xl rounded-3xl p-6 border border-white/80 shadow-xl shadow-[#041B5A]/5"
            >
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h3 className="text-base font-extrabold text-[#0A0F1F]">Alertas Activas y Notificaciones</h3>
                        <p className="text-xs text-slate-400 font-medium">Monitoreo continuo de eventos de salud</p>
                    </div>
                    <span className="text-xs px-3.5 py-1.5 rounded-full bg-[#0D8BFF]/10 text-[#0D8BFF] font-extrabold border border-[#0D8BFF]/20">
                        {data?.activeAlerts?.length || 0} activas
                    </span>
                </div>

                {data?.activeAlerts?.length > 0 ? (
                    <div className="space-y-3">
                        {data.activeAlerts.map(a => (
                            <div key={a.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all gap-3">
                                <div className="flex items-center gap-3.5">
                                    <span className={`text-[10px] px-3 py-1.2 rounded-xl font-black text-white uppercase tracking-wider ${
                                        a.severity === 'critical' ? 'bg-red-500 shadow-md shadow-red-500/30' : a.severity === 'high' ? 'bg-amber-500 shadow-md shadow-amber-500/30' : 'bg-[#0D8BFF] shadow-md shadow-[#0D8BFF]/30'
                                    }`}>
                                        {a.severity}
                                    </span>
                                    <span className="text-sm font-bold text-slate-800">{a.message}</span>
                                </div>
                                <span className="text-xs text-slate-400 font-semibold self-end sm:self-center">
                                    {new Date(a.created_at).toLocaleString('es', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-10 text-center text-slate-500 text-sm font-semibold flex flex-col items-center gap-2">
                        <span className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-lg">✓</span>
                        <span>✨ Excelente estado. No existen alertas biométricas activas.</span>
                    </div>
                )}
            </motion.div>
        </PageTransition>
    );
}


