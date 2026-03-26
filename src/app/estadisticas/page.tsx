'use client';

import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Target, Activity, Clock, Users, Calendar, BarChart3, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// ── Datos estáticos Marzo 2026 ──────────────────────────────────────────────

const Q1_DATA = [
  { dia: '3',  produccion: 7,  confBruta: 0,  retro: 0,  confNeta: 0,  ofrecuNeta: 0,  totalNeta: 0  },
  { dia: '4',  produccion: 6,  confBruta: 2,  retro: 0,  confNeta: 2,  ofrecuNeta: 2,  totalNeta: 4  },
  { dia: '5',  produccion: 8,  confBruta: 1,  retro: 0,  confNeta: 1,  ofrecuNeta: 1,  totalNeta: 2  },
  { dia: '6',  produccion: 2,  confBruta: 1,  retro: 0,  confNeta: 1,  ofrecuNeta: 1,  totalNeta: 2  },
  { dia: '9',  produccion: 6,  confBruta: 2,  retro: 0,  confNeta: 2,  ofrecuNeta: 0,  totalNeta: 2  },
  { dia: '10', produccion: 4,  confBruta: 0,  retro: 0,  confNeta: 0,  ofrecuNeta: 0,  totalNeta: 0  },
  { dia: '11', produccion: 3,  confBruta: 1,  retro: -1, confNeta: 0,  ofrecuNeta: 0,  totalNeta: 0  },
  { dia: '12', produccion: 7,  confBruta: 3,  retro: 0,  confNeta: 3,  ofrecuNeta: 2,  totalNeta: 5  },
  { dia: '13', produccion: 4,  confBruta: 0,  retro: -2, confNeta: -2, ofrecuNeta: 0,  totalNeta: -2 },
];

const Q2_DATA = [
  { dia: '16', produccion: 10, confBruta: 5,  retro: 0,  confNeta: 5,  ofrecuNeta: 1,  totalNeta: 6  },
  { dia: '17', produccion: 6,  confBruta: 0,  retro: 0,  confNeta: 0,  ofrecuNeta: 1,  totalNeta: 1  },
  { dia: '18', produccion: 5,  confBruta: 2,  retro: 0,  confNeta: 2,  ofrecuNeta: 0,  totalNeta: 2  },
  { dia: '19', produccion: 6,  confBruta: 0,  retro: 0,  confNeta: 0,  ofrecuNeta: 0,  totalNeta: 0  },
  { dia: '20', produccion: 2,  confBruta: 3,  retro: -1, confNeta: 2,  ofrecuNeta: 0,  totalNeta: 2  },
  { dia: '23', produccion: 7,  confBruta: 0,  retro: 0,  confNeta: 0,  ofrecuNeta: 2,  totalNeta: 2  },
  { dia: '24', produccion: 4,  confBruta: 1,  retro: 0,  confNeta: 1,  ofrecuNeta: 3,  totalNeta: 4  },
  { dia: '25', produccion: 2,  confBruta: 1,  retro: 0,  confNeta: 1,  ofrecuNeta: 1,  totalNeta: 2  },
  { dia: '26', produccion: 0,  confBruta: 0,  retro: 0,  confNeta: 0,  ofrecuNeta: 0,  totalNeta: 0  },
];

const VENTAS_TIPO = [
  { tipo: 'ULTRA', q1: 0,  q2: 0  },
  { tipo: 'PLUS',  q1: 2,  q2: 6  },
  { tipo: 'BIO',   q1: 29, q2: 18 },
];

const VENTAS_DELEGACION = [
  { name: 'Córdoba',     bruto: 26, retro: -2, neta: 24, abonada: 22 },
  { name: 'Consultores', bruto: 44, retro: -4, neta: 40, abonada: 40 },
  { name: 'Levante',     bruto: 1,  retro: 0,  neta: 1,  abonada: 1  },
  { name: 'RECU',        bruto: 11, retro: 0,  neta: 11, abonada: 12 },
];

const NULOS = [
  { delegacion: 'Córdoba',     total: 52, nulos: 31, denegadas: 21 },
  { delegacion: 'Alicante',    total: 9,  nulos: 4,  denegadas: 5  },
  { delegacion: 'Consultores', total: 5,  nulos: 0,  denegadas: 5  },
];

const TOOLTIP_STYLE = {
  contentStyle: { background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, fontSize: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' },
  labelStyle: { color: '#111827', fontWeight: 700 },
};

// ── Subcomponentes ──────────────────────────────────────────────────────────

function KpiCard({ title, value, sub, icon: Icon, color, bg }: {
  title: string; value: string; sub?: string; icon: React.ElementType; color: string; bg: string;
}) {
  return (
    <div className="premium-card p-5 flex flex-col justify-between min-h-[120px]">
      <div className="flex items-start justify-between">
        <div className="space-y-0.5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{title}</p>
          <h3 className={`text-2xl font-bold ${color}`}>{value}</h3>
          {sub && <p className="text-xs text-gray-400">{sub}</p>}
        </div>
        <div className={`p-2.5 rounded-xl ${bg}`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ label, achieved, target, colorClass }: {
  label: string; achieved: number; target: number; colorClass: string;
}) {
  const pct = Math.min((achieved / target) * 100, 100);
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-sm font-semibold text-gray-700">{label}</span>
        <span className="text-sm font-bold text-gray-900">{achieved} <span className="text-gray-400 font-normal">/ {target}</span></span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }} animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={`h-full rounded-full ${colorClass}`}
        />
      </div>
      <p className="text-xs text-gray-400 text-right">{pct.toFixed(0)}%</p>
    </div>
  );
}

// ── Página ──────────────────────────────────────────────────────────────────

export default function EstadisticasPage() {
  const [quinceana, setQuinceana] = useState<1 | 2>(1);
  const tableData = quinceana === 1 ? Q1_DATA : Q2_DATA;
  const q1Tot = { produccion: 47, confBruta: 10, retro: -3, confNeta: 7,  ofrecuNeta: 6, totalNeta: 13 };
  const q2Tot = { produccion: 42, confBruta: 12, retro: -1, confNeta: 11, ofrecuNeta: 8, totalNeta: 19 };
  const totals = quinceana === 1 ? q1Tot : q2Tot;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500 font-medium">Rendimiento comercial</p>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Estadísticas</h1>
          <p className="text-gray-400 text-sm mt-0.5">Marzo 2026</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 bg-white border border-gray-200 text-gray-500 shadow-sm">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            Actualización automática 16:00h
          </div>
          <div className="px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 bg-white border border-gray-200 text-gray-500 shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            25/03/2026 15:08
          </div>
        </div>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Producción"    value="89"  sub="visitas mes"  icon={Users}       color="text-indigo-600" bg="bg-indigo-50" />
        <KpiCard title="Ventas Brutas" value="71"  sub="total equipo" icon={TrendingUp}   color="text-emerald-600" bg="bg-emerald-50" />
        <KpiCard title="Retrocesos"    value="-6"  sub="cancelaciones" icon={TrendingDown} color="text-red-500"    bg="bg-red-50"    />
        <KpiCard title="Ventas Netas"  value="65"  sub="abonadas: 63" icon={Activity}     color="text-amber-600" bg="bg-amber-50"  />
      </div>

      {/* Objetivos + Tipos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="premium-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-1.5 bg-emerald-50 rounded-lg"><Target className="w-4 h-4 text-emerald-600" /></div>
            <h3 className="text-sm font-bold text-gray-700">Objetivo Biofy — Conf. Comerciales</h3>
          </div>
          <div className="space-y-5">
            <ProgressBar label="1ª Quincena" achieved={7}  target={23} colorClass="bg-indigo-500" />
            <ProgressBar label="2ª Quincena" achieved={11} target={19} colorClass="bg-emerald-500" />
            <div className="pt-2 border-t border-gray-100">
              <ProgressBar label="Total Mes" achieved={18} target={42} colorClass="bg-amber-400" />
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-3 gap-3 text-center">
            {[
              { label: '% Conf.', value: '24.72%', cls: 'text-gray-900' },
              { label: '% Retro.', value: '-18.18%', cls: 'text-red-500' },
              { label: 'Media/día', value: '0.96', cls: 'text-gray-900' },
            ].map(s => (
              <div key={s.label}>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
                <p className={`text-lg font-bold ${s.cls}`}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="premium-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-indigo-50 rounded-lg"><BarChart3 className="w-4 h-4 text-indigo-600" /></div>
            <h3 className="text-sm font-bold text-gray-700">Ventas Abonadas por Tipo</h3>
          </div>
          <div className="h-[190px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={VENTAS_TIPO} barCategoryGap="35%">
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis dataKey="tipo" tick={{ fill: '#9CA3AF', fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="q1" name="1ª Quincena" fill="#6366F1" radius={[6, 6, 0, 0]} />
                <Bar dataKey="q2" name="2ª Quincena" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 pt-4 border-t border-gray-100 grid grid-cols-4 gap-3">
            {[
              { tipo: 'ULTRA', valor: 0,  color: 'text-gray-400' },
              { tipo: 'PLUS',  valor: 8,  color: 'text-indigo-600' },
              { tipo: 'BIO',   valor: 47, color: 'text-emerald-600' },
              { tipo: 'RECU',  valor: 14, color: 'text-amber-600' },
            ].map(t => (
              <div key={t.tipo} className="text-center">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">{t.tipo}</p>
                <p className={`text-xl font-bold ${t.color}`}>{t.valor}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Producción diaria */}
      <div className="premium-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-50 rounded-lg"><Activity className="w-4 h-4 text-indigo-600" /></div>
            <h3 className="text-sm font-bold text-gray-700">Producción Diaria</h3>
          </div>
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
            {([1, 2] as const).map(q => (
              <button key={q} onClick={() => setQuinceana(q)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  quinceana === q ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {q}ª Quincena
              </button>
            ))}
          </div>
        </div>

        <div className="h-[200px] mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={tableData} barCategoryGap="28%">
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="dia" tick={{ fill: '#9CA3AF', fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...TOOLTIP_STYLE} labelFormatter={(v) => `Día ${v}`} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="produccion"  name="Producción"  fill="#6366F1" radius={[4, 4, 0, 0]} opacity={0.6} />
              <Bar dataKey="confNeta"    name="Conf. Neta"  fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="ofrecuNeta"  name="Oferta Recu" fill="#F59E0B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100">
                {['Día','Producción','Conf. Bruta','Retroceso','Conf. Neta','Oferta Recu','Total Neta'].map((h,i) => (
                  <th key={h} className={`pb-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest ${i===0?'text-left':'text-center'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tableData.map(row => (
                <tr key={row.dia} className="hover:bg-gray-50 transition-colors">
                  <td className="py-2.5 font-bold text-gray-700">{row.dia}</td>
                  <td className="py-2.5 text-center text-gray-600">{row.produccion}</td>
                  <td className="py-2.5 text-center text-gray-500">{row.confBruta || '—'}</td>
                  <td className={`py-2.5 text-center font-semibold ${row.retro < 0 ? 'text-red-500' : 'text-gray-400'}`}>{row.retro !== 0 ? row.retro : '—'}</td>
                  <td className={`py-2.5 text-center font-semibold ${row.confNeta > 0 ? 'text-emerald-600' : row.confNeta < 0 ? 'text-red-500' : 'text-gray-400'}`}>{row.confNeta}</td>
                  <td className={`py-2.5 text-center font-semibold ${row.ofrecuNeta > 0 ? 'text-amber-600' : 'text-gray-400'}`}>{row.ofrecuNeta || '—'}</td>
                  <td className={`py-2.5 text-center font-bold ${row.totalNeta > 0 ? 'text-gray-900' : row.totalNeta < 0 ? 'text-red-500' : 'text-gray-400'}`}>{row.totalNeta}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-200">
                <td className="pt-3 font-bold text-gray-500 text-[10px] uppercase tracking-widest">TOTAL</td>
                <td className="pt-3 text-center font-bold text-indigo-600">{totals.produccion}</td>
                <td className="pt-3 text-center font-bold text-gray-700">{totals.confBruta}</td>
                <td className="pt-3 text-center font-bold text-red-500">{totals.retro}</td>
                <td className="pt-3 text-center font-bold text-emerald-600">{totals.confNeta}</td>
                <td className="pt-3 text-center font-bold text-amber-600">{totals.ofrecuNeta}</td>
                <td className="pt-3 text-center font-bold text-gray-900">{totals.totalNeta}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Delegaciones + Nulos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 premium-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-1.5 bg-violet-50 rounded-lg"><BarChart3 className="w-4 h-4 text-violet-600" /></div>
            <h3 className="text-sm font-bold text-gray-700">Ventas por Delegación</h3>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={VENTAS_DELEGACION} layout="vertical" barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#9CA3AF', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fill: '#374151', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} width={80} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="bruto"   name="T. Bruta" fill="#6366F1" radius={[0, 4, 4, 0]} />
                <Bar dataKey="neta"    name="T. Neta"  fill="#10b981" radius={[0, 4, 4, 0]} />
                <Bar dataKey="abonada" name="Abonada"  fill="#8B5CF6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  {['Delegación','T.Bruta','Retro.','T.Neta','Abonada'].map((h,i) => (
                    <th key={h} className={`pb-2 text-[10px] font-bold uppercase tracking-widest ${i===0?'text-left text-gray-400':'text-center '+['text-indigo-500','text-red-400','text-emerald-600','text-violet-600'][i-1]}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {VENTAS_DELEGACION.map(d => (
                  <tr key={d.name} className="hover:bg-gray-50">
                    <td className="py-2 font-semibold text-gray-700">{d.name}</td>
                    <td className="py-2 text-center font-semibold text-indigo-600">{d.bruto}</td>
                    <td className={`py-2 text-center font-semibold ${d.retro<0?'text-red-500':'text-gray-400'}`}>{d.retro!==0?d.retro:'—'}</td>
                    <td className="py-2 text-center font-semibold text-emerald-600">{d.neta}</td>
                    <td className="py-2 text-center font-semibold text-violet-600">{d.abonada}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200">
                  <td className="pt-2 font-bold text-gray-500 text-[10px] uppercase">TOTAL</td>
                  <td className="pt-2 text-center font-bold text-indigo-600">71</td>
                  <td className="pt-2 text-center font-bold text-red-500">-6</td>
                  <td className="pt-2 text-center font-bold text-emerald-600">65</td>
                  <td className="pt-2 text-center font-bold text-violet-600">63</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="premium-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-1.5 bg-red-50 rounded-lg"><AlertTriangle className="w-4 h-4 text-red-500" /></div>
            <h3 className="text-sm font-bold text-gray-700">Nulos / Denegadas</h3>
          </div>
          <div className="space-y-5">
            {NULOS.map(n => (
              <div key={n.delegacion} className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-700">{n.delegacion}</span>
                  <span className="text-sm font-bold text-red-500">{n.total}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden flex">
                  <div className="h-full bg-amber-400 rounded-l-full" style={{ width: `${(n.nulos/n.total)*100}%` }} />
                  <div className="h-full bg-red-400 rounded-r-full" style={{ width: `${(n.denegadas/n.total)*100}%` }} />
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-amber-500 font-medium">{n.nulos} nulos</span>
                  <span className="text-red-400 font-medium">{n.denegadas} denegadas</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total general</span>
              <span className="text-2xl font-bold text-red-500">{NULOS.reduce((a,b)=>a+b.total,0)}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-amber-50 rounded-xl p-3 text-center">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest">Nulos</p>
                <p className="text-lg font-bold text-amber-600">{NULOS.reduce((a,b)=>a+b.nulos,0)}</p>
              </div>
              <div className="bg-red-50 rounded-xl p-3 text-center">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest">Denegadas</p>
                <p className="text-lg font-bold text-red-500">{NULOS.reduce((a,b)=>a+b.denegadas,0)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
