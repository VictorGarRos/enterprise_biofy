'use client';

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

export function HistoricalTable({ data }: HistoricalTableProps) {
    if (!data.length) {
        return (
            <div className="premium-card p-12 text-center">
                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No se encontraron registros históricos</p>
                <p className="text-gray-400 text-xs mt-2">Prueba ajustando los filtros de selección</p>
            </div>
        );
    }

    return (
        <div className="premium-card overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <div>
                    <h3 className="text-base font-bold text-gray-900">Registro Histórico de Actividad</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Listado detallado de interacciones recientes</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-lg text-[10px] font-bold text-indigo-600 border border-indigo-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    {data.length} REGISTROS
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-50">
                            {['Fecha / Hora', 'Tipo', 'Asesor', 'Cuenta / Ubicación', 'Acción'].map((h, i) => (
                                <th key={h} className={`px-6 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 ${i === 4 ? 'text-right' : 'text-left'}`}>
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {data.map((row, i) => (
                            <tr key={i} className="hover:bg-gray-50/80 transition-colors group">
                                <td className="px-6 py-3.5 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
                                            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                                        </div>
                                        <span className="text-xs font-semibold text-gray-700">{row.date}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-3.5">
                                    <div className="flex items-center gap-2">
                                        <Tag className="w-3 h-3 text-gray-400" />
                                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                                            row.type.includes('VENTA')
                                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                : row.type.includes('DEMO')
                                                ? 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                                                : 'bg-gray-100 text-gray-500'
                                        }`}>
                                            {row.type}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-3.5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100">
                                            <User className="w-3 h-3 text-indigo-500" />
                                        </div>
                                        <span className="text-xs font-semibold text-gray-700">{row.commercial}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-3.5 max-w-xs truncate">
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                            <span className="text-xs font-semibold text-gray-700 truncate">{row.account}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                                            <span className="text-[10px] text-gray-400 truncate">{row.location}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-3.5 text-right">
                                    <button className="p-1.5 hover:bg-indigo-50 rounded-lg transition-colors group/btn">
                                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover/btn:text-indigo-500" />
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
