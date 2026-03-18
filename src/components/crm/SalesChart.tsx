'use client';

import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ComposedChart,
    Line,
} from 'recharts';

export interface MetricConfig {
    key: string;
    name: string;
    color: string;
}

interface SalesChartProps {
    data?: any[];
    title?: string;
    subtitle?: string;
    lineKey?: string;
    barKey?: string;
    lineName?: string;
    barName?: string;
    lines?: MetricConfig[];
    bars?: MetricConfig[];
}

export function SalesChart({
    data = [],
    title = "Resumen de Actividad",
    subtitle = "Comparativa Demos vs Ventas",
    lineKey = "demos",
    barKey = "ventas",
    lineName = "Demos",
    barName = "Ventas",
    lines,
    bars
}: SalesChartProps) {
    const activeLines = lines || [{ key: lineKey, name: lineName, color: "#3b82f6" }];
    const activeBars = bars || [{ key: barKey, name: barName, color: "#ef4444" }];

    return (
        <div className="premium-card p-6 h-[400px]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>
                    <p className="text-xs text-zinc-500 font-medium">{subtitle}</p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    {activeBars.map(bar => (
                        <div key={bar.key} className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: bar.color }}></span>
                            <span className="text-xs font-bold text-zinc-400 capitalize">{bar.name}</span>
                        </div>
                    ))}
                    {activeLines.map(line => (
                        <div key={line.key} className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: line.color }}></span>
                            <span className="text-xs font-bold text-zinc-400 capitalize">{line.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            <ResponsiveContainer width="100%" height="80%">
                <ComposedChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                    <defs>
                        {activeBars.map(bar => (
                            <linearGradient key={`grad-${bar.key}`} id={`barGradient-${bar.key}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={bar.color} stopOpacity={0.8} />
                                <stop offset="100%" stopColor={bar.color} stopOpacity={0.1} />
                            </linearGradient>
                        ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e1e24" />
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#52525b', fontSize: 11, fontWeight: 700 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#52525b', fontSize: 11, fontWeight: 700 }}
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: '12px', border: '1px solid #27272a', background: '#09090b', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                        itemStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                    />

                    {activeBars.map(bar => (
                        <Bar
                            key={bar.key}
                            name={bar.name}
                            dataKey={bar.key}
                            fill={`url(#barGradient-${bar.key})`}
                            radius={[4, 4, 0, 0]}
                            barSize={12}
                        />
                    ))}

                    {activeLines.map(line => (
                        <Line
                            key={line.key}
                            name={line.name}
                            type="monotone"
                            dataKey={line.key}
                            stroke={line.color}
                            strokeWidth={3}
                            dot={{ fill: line.color, r: 4, strokeWidth: 2, stroke: '#18181b' }}
                            activeDot={{ r: 6 }}
                        />
                    ))}
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}
