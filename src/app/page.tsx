'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  TrendingUp, Users, MessageSquare, Target,
  ArrowUpRight, ArrowDownRight, Zap
} from 'lucide-react';
import { motion } from 'framer-motion';

const data = [
  { name: 'Ene', whatsapp: 400, meta: 240 },
  { name: 'Feb', whatsapp: 300, meta: 139 },
  { name: 'Mar', whatsapp: 200, meta: 980 },
  { name: 'Abr', whatsapp: 278, meta: 390 },
  { name: 'May', whatsapp: 189, meta: 480 },
  { name: 'Jun', whatsapp: 239, meta: 380 },
];

export default function Dashboard() {
  return (
    <div className="space-y-8 pb-12">
      <header>
        <p className="text-sm text-gray-500 font-medium">Hola, Admin Biofy</p>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Panel General</h1>
      </header>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard label="Total Leads"    value="1,284" change="+12.5%" trend="up"   icon={Users}       color="indigo" />
        <StatCard label="Conv. WhatsApp" value="452"   change="+5.2%"  trend="up"   icon={MessageSquare} color="emerald" />
        <StatCard label="Gasto Meta"     value="€8,420" change="-2.4%" trend="down" icon={Target}      color="violet" />
        <StatCard label="Retorno CRM"    value="24.8%" change="+8.1%"  trend="up"   icon={TrendingUp}  color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 premium-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-base text-gray-900">Crecimiento Mensual</h3>
              <p className="text-xs text-gray-400 mt-0.5">WhatsApp vs Meta</p>
            </div>
            <select className="bg-gray-100 border border-gray-200 text-xs rounded-lg px-3 py-1.5 outline-none text-gray-600">
              <option>Últimos 6 meses</option>
              <option>Año actual</option>
            </select>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorWhatsapp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366F1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}    />
                  </linearGradient>
                  <linearGradient id="colorMeta" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#06B6D4" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} axisLine={false} tickLine={false} />
                <YAxis stroke="#9CA3AF" fontSize={12} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
                  labelStyle={{ color: '#111827', fontWeight: 700 }}
                  itemStyle={{ color: '#6B7280' }}
                />
                <Area type="monotone" dataKey="whatsapp" name="WhatsApp" stroke="#6366F1" fillOpacity={1} fill="url(#colorWhatsapp)" strokeWidth={2.5} />
                <Area type="monotone" dataKey="meta" name="Meta" stroke="#06B6D4" fillOpacity={1} fill="url(#colorMeta)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Panel */}
        <div className="premium-card p-6 flex flex-col">
          <h3 className="font-bold text-base text-gray-900 mb-5">Estado de Servicios</h3>
          <div className="space-y-4 flex-1">
            <ServiceStatus name="Interfaz WhatsApp"   status="Operativo"     lastUpdate="Hace 2m" />
            <ServiceStatus name="Meta API Integration" status="Operativo"     lastUpdate="Hace 5m" />
            <ServiceStatus name="CRM Biofy Sync"       status="Mantenimiento" lastUpdate="Hace 1h" />
            <ServiceStatus name="Database Central"     status="Operativo"     lastUpdate="Hace 1m" />
          </div>
          <div className="mt-6 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
            <div className="flex items-center gap-2 text-indigo-600 mb-2">
              <Zap className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Insight del Día</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Las campañas de Meta han aumentado la conversión un 15% en WhatsApp durante la última semana.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, change, trend, icon: Icon, color }: any) {
  const colorMap: Record<string, { bg: string; text: string; iconBg: string }> = {
    indigo:  { bg: 'bg-indigo-50',  text: 'text-indigo-600',  iconBg: 'bg-indigo-100'  },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', iconBg: 'bg-emerald-100' },
    violet:  { bg: 'bg-violet-50',  text: 'text-violet-600',  iconBg: 'bg-violet-100'  },
    amber:   { bg: 'bg-amber-50',   text: 'text-amber-600',   iconBg: 'bg-amber-100'   },
  };
  const c = colorMap[color];

  return (
    <motion.div whileHover={{ scale: 1.01 }} className="premium-card p-5 cursor-default">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2.5 rounded-xl ${c.iconBg}`}>
          <Icon className={`w-5 h-5 ${c.text}`} />
        </div>
        <div className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
          trend === 'up' ? 'text-emerald-600 bg-emerald-50' : 'text-red-500 bg-red-50'
        }`}>
          {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {change}
        </div>
      </div>
      <p className="text-gray-500 text-sm font-medium">{label}</p>
      <h4 className="text-2xl font-bold mt-1 tracking-tight text-gray-900">{value}</h4>
      <div className={`mt-3 h-0.5 w-12 rounded-full ${c.bg} border-b-2 ${c.text.replace('text', 'border')}`} />
    </motion.div>
  );
}

function ServiceStatus({ name, status, lastUpdate }: any) {
  const ok = status === 'Operativo';
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${ok ? 'bg-emerald-500' : 'bg-amber-500'}`} />
        <div>
          <p className="text-sm font-medium text-gray-800">{name}</p>
          <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-tight">{lastUpdate}</p>
        </div>
      </div>
      <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${
        ok ? 'text-emerald-600 bg-emerald-50 border border-emerald-100' : 'text-amber-600 bg-amber-50 border border-amber-100'
      }`}>
        {status}
      </span>
    </div>
  );
}
