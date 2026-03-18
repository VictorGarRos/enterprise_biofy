'use client';

import React from "react";
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
} from "recharts";
import { Calendar, TrendingUp, TrendingDown, DollarSign, Target } from "lucide-react";

export function MetaAnalyticsChart({ data }: { data: any[] }) {
    if (!data || data.length === 0) return (
        <div className="h-[440px] premium-card flex items-center justify-center text-zinc-600 font-black uppercase tracking-widest text-xs">
            No hay datos suficientes para mostrar el gráfico histórico.
        </div>
    );

    const totalSpend = data.reduce((acc, curr) => acc + (curr.spend || 0), 0);
    const totalLeads = data.reduce((acc, curr) => acc + (curr.leads || 0), 0);

    return (
        <div className="premium-card h-full flex flex-col p-6">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h3 className="text-xl font-black text-white tracking-tighter uppercase italic">Rendimiento Histórico</h3>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Inversión vs Leads generados por día</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-zinc-800 rounded-xl text-[10px] font-black text-zinc-400 border border-zinc-700/50">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    <span>ANÁLISIS DIARIO</span>
                </div>
            </div>

            <div className="flex items-center gap-6 mb-8">
                <div className="flex items-center gap-2">
                    <div className="w-2 H-2 rounded-full bg-blue-600 shadow-xl shadow-blue-500/20" />
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Inversión (€)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 H-2 rounded-full bg-pink-500 shadow-xl shadow-pink-500/20" />
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Leads Logrados</span>
                </div>
            </div>

            <div className="flex-1 w-full min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ec4899" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="0" stroke="#27272a" vertical={false} />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#71717a', fontSize: 10, fontWeight: 800 }}
                            tickFormatter={(str) => {
                                try {
                                    const d = new Date(str);
                                    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
                                } catch { return str; }
                            }}
                            padding={{ left: 20, right: 20 }}
                        />
                        <YAxis axisLine={false} tickLine={false} hide />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#09090b',
                                border: '1px solid #27272a',
                                borderRadius: '12px',
                                padding: '12px 16px',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                            }}
                            itemStyle={{ color: '#fff', fontSize: '11px', fontWeight: '900' }}
                            labelStyle={{ color: '#71717a', fontSize: '10px', marginBottom: '4px', fontWeight: '800' }}
                            cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="spend"
                            stroke="#2563eb"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorSpend)"
                            name="Inversión"
                        />
                        <Area
                            type="monotone"
                            dataKey="leads"
                            stroke="#ec4899"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorLeads)"
                            name="Leads"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-between mt-8 pt-8 border-t border-zinc-800/50">
                <div className="space-y-1">
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Inversión Total Segmento</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-white italic">€{totalSpend.toFixed(2)}</span>
                        <div className="text-[10px] font-black text-emerald-500 flex items-center gap-0.5 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                            <TrendingUp className="w-2.5 h-2.5" /> 12%
                        </div>
                    </div>
                </div>
                <div className="text-right space-y-1">
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Leads Alcanzados</p>
                    <div className="flex items-baseline gap-2 justify-end">
                        <div className="text-[10px] font-black text-blue-500 flex items-center gap-0.5 bg-blue-500/10 px-2 py-0.5 rounded-full">
                            <Target className="w-2.5 h-2.5" /> ROI 3.2
                        </div>
                        <span className="text-3xl font-black text-white italic">{totalLeads}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
