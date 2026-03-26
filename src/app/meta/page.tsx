'use client';

import { useState, useEffect } from "react";
import { Target, Zap, DollarSign, BarChart3, Percent } from "lucide-react";
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
  const [data, setData]           = useState<InsightData[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [accounts, setAccounts]   = useState<any[]>([]);
  const [connected, setConnected] = useState(false);

  const checkConnection = async () => {
    try {
      const res  = await fetch('/api/meta/accounts');
      const json = await res.json();
      if (json.success && json.data) {
        setAccounts(json.data); setConnected(true); setError(null); return true;
      }
      setError('No se pudo conectar con Meta'); setConnected(false); return false;
    } catch (err: any) { setError(err.message); setConnected(false); return false; }
  };

  const fetchData = async (filters: any) => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filters);
      const res  = await fetch(`/api/meta/insights?${params.toString()}`);
      const json = await res.json();
      setData(json.data ?? []);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    checkConnection().then(ok => { if (ok) fetchData({ dateStart: "2026-01-01", dateEnd: new Date().toISOString().split('T')[0] }); });
  }, []);

  const totals = data.reduce((acc, curr) => ({
    spend: acc.spend + (curr.spend || 0),
    leads: acc.leads + (curr.leads || 0),
    impressions: acc.impressions + (curr.impressions || 0),
    clicks: acc.clicks + (curr.clicks || 0),
    reach: acc.reach + (curr.reach || 0),
  }), { spend: 0, leads: 0, impressions: 0, clicks: 0, reach: 0 });

  const ctr        = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
  const cpl        = totals.leads   > 0 ? totals.spend / totals.leads   : 0;
  const cpc        = totals.clicks  > 0 ? totals.spend / totals.clicks  : 0;
  const conversion = totals.clicks  > 0 ? (totals.leads / totals.clicks) * 100 : 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500 font-medium">Análisis de campañas</p>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">Meta Ads Insights</h1>
          <p className="text-gray-400 text-sm mt-1">Sincronización en tiempo real con Meta Graph API.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 border ${
            connected
              ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
              : 'bg-red-50 text-red-500 border-red-100'
          }`}>
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500' : 'bg-red-500'}`} />
            {connected ? `${accounts.length} cuenta${accounts.length !== 1 ? 's' : ''} conectada${accounts.length !== 1 ? 's' : ''}` : 'Sin conexión'}
          </div>
          {error && (
            <button onClick={checkConnection} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold uppercase rounded-xl transition-colors">
              Reintentar
            </button>
          )}
        </div>
      </header>

      {error && !connected && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
          <p className="text-sm text-red-600 font-medium">⚠️ Error de conexión: {error}</p>
          <p className="text-xs text-red-400 mt-1">Verifica META_ACCESS_TOKEN y META_AD_ACCOUNT_ID en .env.local</p>
        </div>
      )}

      {connected && (
        <>
          <div className="relative z-50">
            <MetaFilters onUpdate={fetchData} loading={loading} />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            <MetricCard label="Inversión"       value={`€${totals.spend.toFixed(2)}`}      icon={DollarSign} color="indigo"  loading={loading} />
            <MetricCard label="Leads Totales"   value={String(totals.leads)}               icon={Target}     color="violet"  loading={loading} />
            <MetricCard label="Costo por Lead"  value={`€${cpl.toFixed(2)}`}               icon={Zap}        color="amber"   loading={loading} />
            <MetricCard label="Conversión"      value={`${conversion.toFixed(1)}%`}        icon={Percent}    color="emerald" loading={loading} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <MetaAnalyticsChart data={data} />
            </div>
            <div className="space-y-5">
              <div className="premium-card p-5">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Métricas de Alcance</h4>
                <div className="grid grid-cols-2 gap-4">
                  <Stat label="Alcance"      value={totals.reach.toLocaleString()} />
                  <Stat label="Impresiones"  value={totals.impressions.toLocaleString()} />
                </div>
              </div>
              <div className="premium-card p-5">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Métricas de Clics</h4>
                <div className="grid grid-cols-2 gap-4">
                  <Stat label="Clics" value={totals.clicks.toLocaleString()} />
                  <Stat label="CPC"   value={`€${cpc.toFixed(2)}`} />
                  <Stat label="CTR"   value={`${ctr.toFixed(2)}%`} className="col-span-2 mt-1" />
                </div>
              </div>
              <div className="premium-card p-5 flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mb-3">
                  <BarChart3 className="w-5 h-5 text-indigo-500" />
                </div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Última Sincronización</p>
                <p className="text-xs font-bold text-emerald-500">Hoy, {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, color, loading }: any) {
  const colorMap: Record<string, { bg: string; text: string; iconBg: string }> = {
    indigo:  { bg: 'bg-indigo-50',  text: 'text-indigo-600',  iconBg: 'bg-indigo-100'  },
    violet:  { bg: 'bg-violet-50',  text: 'text-violet-600',  iconBg: 'bg-violet-100'  },
    amber:   { bg: 'bg-amber-50',   text: 'text-amber-600',   iconBg: 'bg-amber-100'   },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', iconBg: 'bg-emerald-100' },
  };
  const c = colorMap[color] ?? colorMap.indigo;

  return (
    <div className="premium-card p-5 flex flex-col justify-between min-h-[130px]">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</p>
          {loading
            ? <div className="h-8 w-24 bg-gray-100 animate-pulse rounded-lg" />
            : <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
          }
        </div>
        <div className={`p-2.5 rounded-xl ${c.iconBg}`}>
          <Icon className={`w-5 h-5 ${c.text}`} />
        </div>
      </div>
      <div className="h-1 w-full bg-gray-100 rounded-full mt-4 overflow-hidden">
        <motion.div initial={{ x: '-100%' }} animate={{ x: '0%' }} transition={{ duration: 1 }}
          className={`h-full w-1/2 rounded-full ${c.bg.replace('bg-', 'bg-').replace('50', '400')}`}
        />
      </div>
    </div>
  );
}

function Stat({ label, value, className = '' }: any) {
  return (
    <div className={`space-y-1 ${className}`}>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
      <p className="text-lg font-bold text-gray-900">{value}</p>
    </div>
  );
}
