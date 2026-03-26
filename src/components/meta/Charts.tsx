'use client';

import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Calendar, TrendingUp, Target } from "lucide-react";


export function MetaAnalyticsChart({ data }: { data: any[] }) {
    if (!data || data.length === 0) return (
        <div className="h-[280px] md:h-[440px] premium-card flex items-center justify-center text-gray-400 font-bold uppercase tracking-widest text-xs">
            No hay datos suficientes para mostrar el gráfico histórico.
        </div>
    );

    const totalSpend = data.reduce((acc, curr) => acc + (curr.spend || 0), 0);
    const totalLeads = data.reduce((acc, curr) => acc + (curr.leads || 0), 0);

    return (
        <div className="premium-card h-full flex flex-col p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-base font-bold text-gray-900">Rendimiento Histórico</h3>
                    <p className="text-gray-400 text-xs mt-0.5">Inversión vs Leads generados por día</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 rounded-xl text-[10px] font-bold text-indigo-600 border border-indigo-100">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>ANÁLISIS DIARIO</span>
                </div>
            </div>

            <div className="flex items-center gap-5 mb-5">
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Inversión (€)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-pink-400" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Leads</span>
                </div>
            </div>

            <div className="flex-1 w-full min-h-[180px] md:min-h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%"  stopColor="#6366F1" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="#6366F1" stopOpacity={0}    />
                            </linearGradient>
                            <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%"  stopColor="#EC4899" stopOpacity={0.12} />
                                <stop offset="95%" stopColor="#EC4899" stopOpacity={0}    />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="0" stroke="#F3F4F6" vertical={false} />
                        <XAxis
                            dataKey="date" axisLine={false} tickLine={false}
                            tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 600 }}
                            tickFormatter={(s) => { try { return new Date(s).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }); } catch { return s; } }}
                            padding={{ left: 20, right: 20 }}
                        />
                        <YAxis axisLine={false} tickLine={false} hide />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '10px 14px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
                            itemStyle={{ color: '#374151', fontSize: '11px', fontWeight: '700' }}
                            labelStyle={{ color: '#9CA3AF', fontSize: '10px', marginBottom: '4px' }}
                        />
                        <Area type="monotone" dataKey="spend" stroke="#6366F1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSpend)" name="Inversión" />
                        <Area type="monotone" dataKey="leads" stroke="#EC4899" strokeWidth={2.5} fillOpacity={1} fill="url(#colorLeads)" name="Leads" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-between mt-6 pt-5 border-t border-gray-100">
                <div className="space-y-1">
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Inversión Total</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-gray-900">€{totalSpend.toFixed(2)}</span>
                        <div className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <TrendingUp className="w-2.5 h-2.5" /> 12%
                        </div>
                    </div>
                </div>
                <div className="text-right space-y-1">
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Leads Alcanzados</p>
                    <div className="flex items-baseline gap-2 justify-end">
                        <div className="text-[10px] font-bold text-indigo-600 flex items-center gap-0.5 bg-indigo-50 px-2 py-0.5 rounded-full">
                            <Target className="w-2.5 h-2.5" /> ROI 3.2
                        </div>
                        <span className="text-2xl font-bold text-gray-900">{totalLeads}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
