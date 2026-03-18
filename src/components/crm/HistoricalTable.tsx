'use client';

import React from 'react';
import { Calendar, Tag, User, MapPin, Building2, ExternalLink } from 'lucide-react';

interface Row {
    date: string;
    type: string;
    commercial: string;
    account: string;
    status: string;
    location: string;
    raw: string;
}

interface HistoricalTableProps {
    data: Row[];
    mode: 'comercial' | 'tecnico' | 'teleoperadora';
}

export function HistoricalTable({ data, mode }: HistoricalTableProps) {
    if (!data.length) {
        return (
            <div className="premium-card p-12 text-center">
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm">No se encontraron registros históricos</p>
                <p className="text-zinc-600 text-xs mt-2">Prueba ajustando los filtros de selección</p>
            </div>
        );
    }

    return (
        <div className="premium-card overflow-hidden">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/40">
                <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">Registro Histórico de Actividad</h3>
                    <p className="text-xs text-zinc-500 font-medium">Listado detallado de interacciones recientes</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800/50 rounded-lg text-[10px] font-black text-zinc-400 border border-zinc-700/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    TOTAL: {data.length} REGISTROS
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-zinc-950/50">
                            <th className="px-6 py-4 text-left text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] border-b border-zinc-800">Fecha / Hora</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] border-b border-zinc-800">Tipo</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] border-b border-zinc-800">Asesor</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] border-b border-zinc-800">Cuenta / Ubicación</th>
                            <th className="px-6 py-4 text-right text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] border-b border-zinc-800">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                        {data.map((row, i) => (
                            <tr key={i} className="hover:bg-zinc-800/30 transition-colors group">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-zinc-800/80 rounded-lg border border-zinc-700/50 group-hover:border-blue-500/50 transition-colors">
                                            <Calendar className="w-3.5 h-3.5 text-zinc-500 group-hover:text-blue-500" />
                                        </div>
                                        <span className="text-xs font-bold text-zinc-300">{row.date}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <Tag className="w-3 h-3 text-zinc-600" />
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
                                            row.type.includes('VENTA') ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                            row.type.includes('DEMO') ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                                            'bg-zinc-800 text-zinc-400 border border-zinc-700/50'
                                        }`}>
                                            {row.type}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-400 border border-zinc-700 group-hover:border-blue-500/50 transition-colors">
                                            <User className="w-3 h-3" />
                                        </div>
                                        <span className="text-xs font-bold text-zinc-200">{row.commercial}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 max-w-xs truncate">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                                            <span className="text-xs font-bold text-zinc-300 truncate">{row.account}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-3 h-3 text-zinc-600 shrink-0" />
                                            <span className="text-[10px] font-medium text-zinc-500 truncate">{row.location}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="p-2 hover:bg-blue-600/10 rounded-lg transition-colors group/btn">
                                        <ExternalLink className="w-4 h-4 text-zinc-500 group-hover/btn:text-blue-500" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
