'use client';

import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, Users, MessageSquare, Target, 
  ArrowUpRight, ArrowDownRight, Zap 
} from 'lucide-react';
import { motion } from 'framer-motion';

const data = [
  { name: 'Ene', whatsapp: 400, meta: 240, crm: 240 },
  { name: 'Feb', whatsapp: 300, meta: 139, crm: 221 },
  { name: 'Mar', whatsapp: 200, meta: 980, crm: 229 },
  { name: 'Abr', whatsapp: 278, meta: 390, crm: 200 },
  { name: 'May', whatsapp: 189, meta: 480, crm: 218 },
  { name: 'Jun', whatsapp: 239, meta: 380, crm: 250 },
];

export default function Dashboard() {
  return (
    <div className="space-y-8 pb-12">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Panel General</h1>
        <p className="text-zinc-500">Resumen unificado de todas las unidades de negocio de Biofy.</p>
      </header>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Leads" 
          value="1,284" 
          change="+12.5%" 
          trend="up" 
          icon={Users} 
          color="blue" 
        />
        <StatCard 
          label="Conv. WhatsApp" 
          value="452" 
          change="+5.2%" 
          trend="up" 
          icon={MessageSquare} 
          color="green" 
        />
        <StatCard 
          label="Gasto Meta" 
          value="€8,420" 
          change="-2.4%" 
          trend="down" 
          icon={Target} 
          color="purple" 
        />
        <StatCard 
          label="Retorno CRM" 
          value="24.8%" 
          change="+8.1%" 
          trend="up" 
          icon={TrendingUp} 
          color="orange" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 premium-card p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-lg">Crecimiento Mensual</h3>
            <select className="bg-zinc-800 border-none text-xs rounded-md px-2 py-1 outline-none">
              <Option>Últimos 6 meses</Option>
              <Option>Año actual</Option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorWhatsapp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={12} axisLine={false} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={12} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                  itemStyle={{ color: '#fafafa' }}
                />
                <Area type="monotone" dataKey="whatsapp" stroke="#3b82f6" fillOpacity={1} fill="url(#colorWhatsapp)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Panel */}
        <div className="premium-card p-6 flex flex-col">
          <h3 className="font-bold text-lg mb-6">Estado de Servicios</h3>
          <div className="space-y-6 flex-1">
            <ServiceStatus name="Interfaz WhatsApp" status="Operativo" lastUpdate="Hace 2m" />
            <ServiceStatus name="Meta API Integration" status="Operativo" lastUpdate="Hace 5m" />
            <ServiceStatus name="CRM Biofy Sync" status="Mantenimiento" lastUpdate="Hace 1h" />
            <ServiceStatus name="Database Central" status="Operativo" lastUpdate="Hace 1m" />
          </div>
          <div className="mt-8 p-4 bg-blue-600/10 rounded-xl border border-blue-600/20">
            <div className="flex items-center gap-2 text-blue-400 mb-2">
              <Zap className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Insight del Día</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Las campañas de Meta han aumentado la conversión un 15% en WhatsApp durante la última semana. Recomendamos aumentar presupuesto en anuncios de video.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Option({ children }: { children: React.ReactNode }) {
  return <option className="bg-zinc-900 border-none">{children}</option>;
}

function StatCard({ label, value, change, trend, icon: Icon, color }: any) {
  const colorMap: any = {
    blue: 'bg-blue-600/10 text-blue-500 animate-pulse',
    green: 'bg-emerald-600/10 text-emerald-500',
    purple: 'bg-purple-600/10 text-purple-500',
    orange: 'bg-orange-600/10 text-orange-500',
  };

  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className="premium-card p-6 group cursor-default"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${colorMap[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
          trend === 'up' ? 'text-emerald-500 bg-emerald-500/10' : 'text-red-500 bg-red-500/10'
        }`}>
          {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {change}
        </div>
      </div>
      <div>
        <p className="text-zinc-500 text-sm font-medium">{label}</p>
        <h4 className="text-2xl font-bold mt-1 tracking-tight text-white">{value}</h4>
      </div>
    </motion.div>
  );
}

function ServiceStatus({ name, status, lastUpdate }: any) {
  return (
    <div className="flex items-center justify-between group">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${
          status === 'Operativo' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-orange-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
        }`} />
        <div>
          <p className="text-sm font-medium text-zinc-200 group-hover:text-blue-400 transition-colors">{name}</p>
          <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-tight">{lastUpdate}</p>
        </div>
      </div>
      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
        status === 'Operativo' ? 'border-emerald-500/20 text-emerald-500 bg-emerald-500/5' : 'border-orange-500/20 text-orange-500 bg-orange-500/5'
      }`}>
        {status}
      </span>
    </div>
  );
}
