import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
    label: string;
    value: string | number;
    change?: number;
    icon: LucideIcon;
    color: string;
    loading?: boolean;
}

export function MetricCard({
    label,
    value,
    change,
    icon: Icon,
    color,
    loading = false
}: MetricCardProps) {
    return (
        <div className="premium-card p-6 flex flex-col justify-between min-h-[160px] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-zinc-800/20 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500" />
            <div className="flex items-start justify-between relative z-10">
                <div>
                    <p className="text-zinc-500 text-sm font-medium mb-1">{label}</p>
                    {loading ? (
                        <div className="h-8 w-24 bg-zinc-800 animate-pulse rounded my-1" />
                    ) : (
                        <div className="flex items-center gap-3">
                            <h3 className="text-3xl font-bold tracking-tight text-white">{value}</h3>
                            {change !== undefined && (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
                                    change >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                                }`}>
                                    {change >= 0 ? '↗' : '↘'} {Math.abs(change)}%
                                </span>
                            )}
                        </div>
                    )}
                </div>
                <div className={`p-2.5 rounded-xl bg-zinc-800/80 border border-zinc-700/50 ${color}`}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
            <p className="text-[11px] text-zinc-600 mt-4 font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" /> Este mes
            </p>
        </div>
    );
}
