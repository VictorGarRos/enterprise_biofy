import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
    label: string;
    value: string | number;
    change?: number;
    icon: LucideIcon;
    color: string;
    loading?: boolean;
}

export function MetricCard({ label, value, change, icon: Icon, color, loading = false }: MetricCardProps) {
    // Map lucide color class → soft bg
    const bgMap: Record<string, string> = {
        'text-blue-500':    'bg-blue-50',
        'text-blue-400':    'bg-blue-50',
        'text-emerald-500': 'bg-emerald-50',
        'text-emerald-400': 'bg-emerald-50',
        'text-amber-500':   'bg-amber-50',
        'text-amber-400':   'bg-amber-50',
        'text-red-500':     'bg-red-50',
        'text-red-400':     'bg-red-50',
        'text-purple-500':  'bg-violet-50',
        'text-purple-400':  'bg-violet-50',
        'text-orange-400':  'bg-orange-50',
        'text-zinc-400':    'bg-gray-100',
        'text-zinc-500':    'bg-gray-100',
        'text-indigo-500':  'bg-indigo-50',
    };
    const iconBg = bgMap[color] ?? 'bg-gray-100';

    return (
        <div className="premium-card p-5 flex flex-col justify-between min-h-[140px]">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{label}</p>
                    {loading ? (
                        <div className="h-8 w-24 bg-gray-100 animate-pulse rounded-lg" />
                    ) : (
                        <div className="flex items-end gap-2">
                            <h3 className="text-3xl font-bold tracking-tight text-gray-900">{value}</h3>
                            {change !== undefined && (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mb-1 ${
                                    change >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                                }`}>
                                    {change >= 0 ? '↗' : '↘'} {Math.abs(change)}%
                                </span>
                            )}
                        </div>
                    )}
                </div>
                <div className={`p-2.5 rounded-xl ${iconBg} ${color}`}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
            <p className="text-[11px] text-gray-400 mt-3 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300" /> Este mes
            </p>
        </div>
    );
}
