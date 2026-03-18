'use client';

import React, { useState, useEffect } from "react";
import { 
    Users, 
    Target, 
    Zap, 
    TrendingUp, 
    TrendingDown, 
    DollarSign, 
    MousePointer2, 
    BarChart3, 
    Eye,
    Percent, 
    LucideIcon
} from "lucide-react";
import { motion } from "framer-motion";
import { MetaFilters } from "@/components/meta/Filters";
import { MetaAnalyticsChart } from "@/components/meta/Charts";

interface InsightData {
    date: string;
    impressions: number;
    clicks: number;
    spend: number;
    reach: number;
    leads: number;
}

export default function MetaAnalyticsPage() {
    const [data, setData] = useState<InsightData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [accounts, setAccounts] = useState<any[]>([]);
    const [connected, setConnected] = useState(false);

    const checkConnection = async () => {
        try {
            const res = await fetch('/api/meta/accounts');
            const json = await res.json();
            if (json.success && json.data) {
                setAccounts(json.data);
                setConnected(true);
                setError(null);
                return true;
            } else {
                setError('No se pudo conectar con Meta');
                setConnected(false);
                return false;
            }
        } catch (err: any) {
            setError(err.message);
            setConnected(false);
            return false;
        }
    };

    const fetchData = async (filters: any) => {
        setLoading(true);
        try {
            const params = new URLSearchParams(filters);
            const res = await fetch(`/api/meta/insights?${params.toString()}`);
            const json = await res.json();
            if (json.data) setData(json.data);
            else setData([]);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const init = async () => {
            const isConnected = await checkConnection();
            if (isConnected) {
                fetchData({ dateStart: "2026-01-01", dateEnd: new Date().toISOString().split('T')[0] });
            }
        };
        init();
    }, []);

    const totals = data.reduce((acc, curr) => ({
        spend: acc.spend + (curr.spend || 0),
        leads: acc.leads + (curr.leads || 0),
        impressions: acc.impressions + (curr.impressions || 0),
        clicks: acc.clicks + (curr.clicks || 0),
        reach: acc.reach + (curr.reach || 0),
    }), { spend: 0, leads: 0, impressions: 0, clicks: 0, reach: 0 });

    const ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
    const cpl = totals.leads > 0 ? totals.spend / totals.leads : 0;
    const cpc = totals.clicks > 0 ? totals.spend / totals.clicks : 0;
    const conversion = totals.clicks > 0 ? (totals.leads / totals.clicks) * 100 : 0;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-2 H-6 bg-pink-500 rounded-full" />
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">Meta Ads Insights</h1>
                    </div>
                    <p className="text-zinc-500 font-medium">Sincronización en tiempo real con Meta Graph API y análisis de ROI.</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
                        connected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                        <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400' : 'bg-red-400'}`} />
                        {connected ? `${accounts.length} cuenta${accounts.length !== 1 ? 's' : ''} conectada${accounts.length !== 1 ? 's' : ''}` : 'Sin conexión'}
                    </div>
                    {error && (
                        <button
                            onClick={checkConnection}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase rounded-lg transition-colors"
                        >
                            Reintentar
                        </button>
                    )}
                </div>
            </header>

            {error && !connected && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-sm text-red-400 font-medium">⚠️ Error de conexión: {error}</p>
                    <p className="text-xs text-red-300 mt-1">Verifica que las variables META_ACCESS_TOKEN y META_AD_ACCOUNT_ID estén correctamente configuradas en .env.local</p>
                </div>
            )}

            {connected && (
                <>
                    <div className="relative z-50">
                        <MetaFilters onUpdate={fetchData} loading={loading} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <MetaMetricCard label="Inversión" value={`€${totals.spend.toFixed(2)}`} icon={DollarSign} color="text-blue-500" loading={loading} />
                        <MetaMetricCard label="Leads Totales" value={totals.leads} icon={Target} color="text-pink-500" loading={loading} />
                        <MetaMetricCard label="Costo por Lead" value={`€${cpl.toFixed(2)}`} icon={Zap} color="text-amber-500" loading={loading} />
                        <MetaMetricCard label="Conversión" value={`${conversion.toFixed(1)}%`} icon={Percent} color="text-emerald-500" loading={loading} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <MetaAnalyticsChart data={data} />
                        </div>
                        <div className="space-y-6">
                            <div className="premium-card p-6 border-l-4 border-l-blue-600">
                                <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Métricas de Alcance</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <Stat label="Alcance" value={totals.reach.toLocaleString()} />
                                    <Stat label="Impresiones" value={totals.impressions.toLocaleString()} />
                                </div>
                            </div>
                            <div className="premium-card p-6 border-l-4 border-l-emerald-500">
                                <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Métricas de Clics</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <Stat label="Clics" value={totals.clicks.toLocaleString()} />
                                    <Stat label="CPC" value={`€${cpc.toFixed(2)}`} />
                                    <Stat label="CTR" value={`${ctr.toFixed(2)}%`} className="col-span-2 mt-2" />
                                </div>
                            </div>
                            <div className="premium-card p-8 bg-zinc-950 flex flex-col items-center justify-center text-center border-zinc-800 border-dashed">
                                <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mb-4 border border-zinc-800">
                                    <BarChart3 className="w-6 h-6 text-zinc-500" />
                                </div>
                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Estado de Sincronización</p>
                                <p className="text-xs font-bold text-emerald-500">Última actualización: Hoy, {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

function MetaMetricCard({ label, value, icon: Icon, color, loading }: any) {
    return (
        <div className="premium-card p-6 flex flex-col justify-between min-h-[140px] relative overflow-hidden group border-zinc-800 hover:border-zinc-700 transition-colors">
            <div className="flex items-start justify-between relative z-10">
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{label}</p>
                    {loading ? (
                        <div className="h-8 w-24 bg-zinc-800 animate-pulse rounded" />
                    ) : (
                        <h3 className="text-2xl font-black text-white italic tracking-tight">{value}</h3>
                    )}
                </div>
                <div className={`p-2 rounded-lg bg-zinc-900 border border-zinc-800 ${color}`}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
            <div className="h-1 w-full bg-zinc-900 rounded-full mt-4 overflow-hidden">
                <motion.div initial={{ x: "-100%" }} animate={{ x: "0%" }} transition={{ duration: 1 }} className={`h-full w-1/2 ${color.replace('text', 'bg')}`} />
            </div>
        </div>
    );
}

function Stat({ label, value, className = "" }: any) {
    return (
        <div className={`space-y-1 ${className}`}>
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-tighter">{label}</p>
            <p className="text-lg font-black text-white italic">{value}</p>
        </div>
    );
}
