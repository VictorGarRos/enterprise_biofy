'use client';

import { useState, useMemo } from 'react';
import {
    Users,
    Settings,
    PhoneCall,
    CheckCircle2,
    XCircle,
    TrendingUp,
    RefreshCcw,
    AlertCircle,
    Clock,
    PhoneOff,
    Package,
    Wrench,
    ClipboardList,
    CalendarCheck,
} from 'lucide-react';
import { useCRMData } from '@/hooks/useCRMData';
import { MetricCard } from '@/components/crm/MetricCard';
import { SalesChart } from '@/components/crm/SalesChart';
import { DashboardFilters } from '@/components/crm/DashboardFilters';
import { HistoricalTable } from '@/components/crm/HistoricalTable';
import { DateRange } from 'react-day-picker';

type DashboardMode = 'COMERCIAL' | 'TECNICO' | 'TELEOPERADORA';

function parseRow(raw: string) {
    const parts = raw.split('\t');
    return {
        raw,
        date: (parts[1] ?? '').trim(),
        commercial: (parts[3] ?? '').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim(),
        location: (parts[10] ?? '').split('\n')[0].trim(),
        account: (parts[10] ?? '').split('\n')[0].trim(),
        type: (parts[11] ?? '').replace(/\s+/g, ' ').trim().toUpperCase(),
        status: (parts[13] ?? '').replace(/\s+/g, ' ').trim().toUpperCase(),
    };
}

export default function CRMBiofyPage() {
    const { data, loading, error } = useCRMData();
    const [mode, setMode] = useState<DashboardMode>('COMERCIAL');
    const [selectedComercial, setSelectedComercial] = useState('');
    const [selectedTipo, setSelectedTipo] = useState('');
    const [selectedCuenta, setSelectedCuenta] = useState('');
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleModeChange = (newMode: DashboardMode) => {
        setMode(newMode);
        setSelectedComercial('');
        setSelectedTipo('');
        setSelectedCuenta('');
        setDateRange(undefined);
    };

    // ── Filter functions (ported from reference repo) ─────────────────────────

    const isMatchComercial = (row: string) => {
        if (!data) return false;
        const normalizedRow = row.replace(/[\s\t\n\r]+/g, ' ').trim().toUpperCase();
        const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        const matchByUser = (userName: string) => {
            const uObj = data.raw.usuarios?.find((u: any) => u.nombre === userName);
            if (uObj?.login && new RegExp(`\\b${escapeRegExp(uObj.login.toUpperCase())}\\b`).test(normalizedRow)) return true;
            return new RegExp(`\\b${escapeRegExp(userName.toUpperCase())}\\b`).test(normalizedRow);
        };

        // Exclude tecnico events in COMERCIAL mode
        if (mode === 'COMERCIAL' && data.filters?.tecnicos) {
            for (const tecnicoName of data.filters.tecnicos) {
                const tObj = data.raw.usuarios?.find((u: any) => u.nombre === tecnicoName);
                if (tObj?.login && new RegExp(`\\b${escapeRegExp(tObj.login.toUpperCase())}\\b`).test(normalizedRow)) return false;
                if (new RegExp(`\\b${escapeRegExp(tecnicoName.toUpperCase())}\\b`).test(normalizedRow)) return false;
            }
        }

        if (!selectedComercial) {
            const allowedUsers =
                mode === 'COMERCIAL' ? data.filters?.comerciales :
                mode === 'TELEOPERADORA' ? data.filters?.teleoperadoras :
                data.filters?.tecnicos;
            if (!allowedUsers || allowedUsers.length === 0) return true;
            return allowedUsers.some((userName: string) => matchByUser(userName));
        }

        const user = data.raw.usuarios?.find((u: any) => u.nombre === selectedComercial);
        if (user?.login) {
            return new RegExp(`\\b${escapeRegExp(user.login.toUpperCase())}\\b`).test(normalizedRow) ||
                normalizedRow.includes(selectedComercial.toUpperCase());
        }
        return normalizedRow.includes(selectedComercial.toUpperCase());
    };

    const isMatchTipo = (row: string) => {
        const rowUpper = row.toUpperCase();

        if (!selectedTipo) {
            if (mode === 'COMERCIAL') {
                const allowed = ['VISITA', 'ENTREGA', 'RECOGIDA', 'VENTA', 'DATOS ENTREGADOS'];
                return allowed.some(t => rowUpper.includes(t));
            }
            if (mode === 'TECNICO') {
                const allowed = ['INSTALACION', 'MANTENIMIENTO', 'INCIDENCIA'];
                return allowed.some(t => rowUpper.includes(t));
            }
            return true;
        }

        if (mode === 'TELEOPERADORA') {
            if (selectedTipo === 'Lead Digital') {
                return rowUpper.includes('LEAD DIGITAL') || rowUpper.includes('CP') || rowUpper.includes('POTENCIAL');
            } else if (selectedTipo === 'Llamada') {
                return !rowUpper.includes('LEAD DIGITAL') && !rowUpper.includes('CP') && !rowUpper.includes('POTENCIAL');
            }
        }

        return rowUpper.includes(selectedTipo.toUpperCase());
    };

    const isMatchCuenta = (row: string) => {
        if (!selectedCuenta) return true;
        const rowUpper = row.toUpperCase();
        const filterUpper = selectedCuenta.toUpperCase();

        const hasVipBiofy = rowUpper.includes('VIP BIOFY');
        const hasVip = rowUpper.includes('VIP');
        const hasAlquiler = rowUpper.includes('ALQUILER');
        const hasCliente = (rowUpper.includes('CLIENTE') && !rowUpper.includes('POTENCIAL')) ||
            rowUpper.includes('MANTENIMIENTO') ||
            rowUpper.includes('INCIDENCIA') ||
            rowUpper.includes('INSTALACION');

        if (filterUpper === 'POTENCIAL') {
            const isExplicit = rowUpper.includes('POTENCIAL') || rowUpper.includes('CP');
            const isAnyOther = hasVipBiofy || hasVip || hasAlquiler || hasCliente;
            return isExplicit || !isAnyOther;
        }
        if (filterUpper === 'CLIENTE') return hasCliente;
        if (filterUpper === 'VIP BIOFY') return hasVipBiofy;
        if (filterUpper === 'VIP') return hasVip;
        if (filterUpper === 'ALQUILER') return hasAlquiler;
        return rowUpper.includes(filterUpper);
    };

    const isMatchDate = (row: string) => {
        if (!dateRange || (!dateRange.from && !dateRange.to)) return true;
        const dateMatch = row.match(/(\d{2})\/(\d{2})\/(\d{4})/);
        if (!dateMatch) return false;

        const rowDate = new Date(
            parseInt(dateMatch[3]),
            parseInt(dateMatch[2]) - 1,
            parseInt(dateMatch[1])
        );
        rowDate.setHours(0, 0, 0, 0);

        if (dateRange.from && dateRange.to) {
            const start = new Date(dateRange.from); start.setHours(0, 0, 0, 0);
            const end = new Date(dateRange.to); end.setHours(23, 59, 59, 999);
            return rowDate >= start && rowDate <= end;
        } else if (dateRange.from) {
            const start = new Date(dateRange.from); start.setHours(0, 0, 0, 0);
            return rowDate >= start;
        } else if (dateRange.to) {
            const end = new Date(dateRange.to); end.setHours(23, 59, 59, 999);
            return rowDate <= end;
        }
        return true;
    };

    // ── Filtered collections ───────────────────────────────────────────────────

    const { eventosFiltrados, pedidosFiltrados, tareasFiltradas } = useMemo(() => {
        if (!data) return { eventosFiltrados: [], pedidosFiltrados: [], tareasFiltradas: [] };

        const filterEvento = (row: string) =>
            isMatchComercial(row) && isMatchTipo(row) && isMatchCuenta(row) && isMatchDate(row);

        const filterPedido = (row: string) => {
            const rowClean = row.trim().toUpperCase();
            if (!rowClean || rowClean.startsWith('PEDIDO') || rowClean.includes('IMP.INGRE')) return false;
            if (rowClean.includes('MANT.') || rowClean.includes('MANTENIMIENTO')) return false;
            return isMatchComercial(row) && isMatchCuenta(row) && isMatchDate(row);
        };

        const filterTarea = (row: string) => {
            if (typeof row !== 'string') return false;
            if (!row.trim() || !/^\s*\d+\.\s*/.test(row)) return false;
            const matchComercial = selectedComercial ? isMatchComercial(row) : true;
            return matchComercial && isMatchTipo(row) && isMatchDate(row);
        };

        return {
            eventosFiltrados: data.raw.eventos.filter(filterEvento),
            pedidosFiltrados: data.raw.pedidos.filter(filterPedido),
            tareasFiltradas: (data.raw.tareas || []).filter(filterTarea),
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, mode, selectedComercial, selectedTipo, selectedCuenta, dateRange]);

    // ── Metrics ────────────────────────────────────────────────────────────────

    const metrics = useMemo(() => {
        const rows = mode === 'TELEOPERADORA' ? tareasFiltradas : eventosFiltrados;
        const up = (r: string) => r.toUpperCase();

        const byKeyword = (...kw: string[]) => rows.filter(r => kw.some(k => up(r).includes(k))).length;

        const tiposCounts: Record<string, number> = {};
        if (mode === 'TECNICO' && data?.filters?.tipos) {
            data.filters.tipos.forEach((t: string) => {
                tiposCounts[t] = eventosFiltrados.filter(r => up(r).includes(t)).length;
            });
        }

        return {
            entregados: rows.length,
            confirmados: byKeyword('CONFIRMADO', 'CONCERTADO'),
            demos: eventosFiltrados.filter(r => up(r).includes('COMPLETADO')).length,
            ventas: pedidosFiltrados.length,
            nulos: byKeyword('NULO'),
            errores: byKeyword('ERROR'),
            noLocalizados: byKeyword('NO LOCALIZADO', 'NO LOCALIZADA', 'NO LOCALIZA'),
            pendientes: byKeyword('PENDIENTE'),
            ventasAprobadas: pedidosFiltrados.filter(r => up(r).includes('APROBADA')).length,
            tipos: tiposCounts,
        };
    }, [data, mode, eventosFiltrados, pedidosFiltrados, tareasFiltradas]);

    // ── Chart data ─────────────────────────────────────────────────────────────

    const chartData = useMemo(() => {
        const getTipoCount = (keyword: string) => {
            if (!metrics.tipos) return 0;
            const key = Object.keys(metrics.tipos).find(k => k.toLowerCase().includes(keyword.toLowerCase()));
            return key ? metrics.tipos[key] : 0;
        };
        const countInst = getTipoCount('instalaci');
        const countMant = getTipoCount('mantenimiento');
        const countInc = getTipoCount('incidencia');

        if (mode === 'TELEOPERADORA') {
            return [
                { date: '12', concertados: Math.floor(metrics.confirmados * 0.4), cedidos: Math.floor(metrics.entregados * 0.6) },
                { date: '13', concertados: Math.floor(metrics.confirmados * 0.5), cedidos: Math.floor(metrics.entregados * 0.7) },
                { date: '14', concertados: Math.floor(metrics.confirmados * 0.6), cedidos: Math.floor(metrics.entregados * 0.8) },
                { date: '15', concertados: Math.floor(metrics.confirmados * 0.45), cedidos: Math.floor(metrics.entregados * 0.65) },
                { date: '16', concertados: Math.floor(metrics.confirmados * 0.3), cedidos: Math.floor(metrics.entregados * 0.5) },
                { date: '17', concertados: metrics.confirmados, cedidos: metrics.entregados },
            ];
        }
        if (mode === 'TECNICO') {
            return [
                { date: '12', instalacion: Math.floor(countInst * 0.2), mantenimiento: Math.floor(countMant * 0.1), incidencia: Math.floor(countInc * 0.3) },
                { date: '13', instalacion: Math.floor(countInst * 0.3), mantenimiento: Math.floor(countMant * 0.2), incidencia: Math.floor(countInc * 0.1) },
                { date: '14', instalacion: Math.floor(countInst * 0.1), mantenimiento: Math.floor(countMant * 0.4), incidencia: Math.floor(countInc * 0.2) },
                { date: '15', instalacion: Math.floor(countInst * 0.4), mantenimiento: Math.floor(countMant * 0.1), incidencia: Math.floor(countInc * 0.1) },
                { date: '16', instalacion: Math.floor(countInst * 0.2), mantenimiento: Math.floor(countMant * 0.3), incidencia: Math.floor(countInc * 0.4) },
                { date: '17', instalacion: countInst, mantenimiento: countMant, incidencia: countInc },
            ];
        }
        // COMERCIAL
        return [
            { date: '12', ventas: Math.floor(metrics.ventas * 0.2), demos: Math.floor(metrics.demos * 0.15) },
            { date: '13', ventas: Math.floor(metrics.ventas * 0.3), demos: Math.floor(metrics.demos * 0.25) },
            { date: '14', ventas: Math.floor(metrics.ventas * 0.1), demos: Math.floor(metrics.demos * 0.2) },
            { date: '15', ventas: Math.floor(metrics.ventas * 0.4), demos: Math.floor(metrics.demos * 0.3) },
            { date: '16', ventas: Math.floor(metrics.ventas * 0.2), demos: Math.floor(metrics.demos * 0.1) },
            { date: '17', ventas: metrics.ventas, demos: metrics.demos },
        ];
    }, [mode, metrics]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await fetch('/api/crm/scrape');
            window.location.reload();
        } catch (e) {
            console.error(e);
        } finally {
            setIsRefreshing(false);
        }
    };

    // ── Render ─────────────────────────────────────────────────────────────────

    const modeUsuarios =
        mode === 'COMERCIAL' ? (data?.filters?.comerciales || []) :
        mode === 'TELEOPERADORA' ? (data?.filters?.teleoperadoras || []) :
        (data?.filters?.tecnicos || []);

    const modeTipos =
        mode === 'TELEOPERADORA' ? (data?.filters?.tareas || []) :
        (data?.filters?.tipos || []);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <p className="text-sm text-gray-500 font-medium">Gestión de equipo</p>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Análisis por empleado</h1>
                    <p className="text-gray-400 text-sm mt-0.5">Análisis avanzado de rendimiento CRM y conversiones.</p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="bg-white hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl font-semibold text-xs uppercase tracking-wider border border-gray-200 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-sm"
                    >
                        <RefreshCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Sync CRM
                    </button>
                    <div className="bg-gray-100 p-1 rounded-xl flex gap-1">
                        <ModeTab active={mode === 'COMERCIAL'} onClick={() => handleModeChange('COMERCIAL')} icon={Users} label="Comercial" />
                        <ModeTab active={mode === 'TECNICO'} onClick={() => handleModeChange('TECNICO')} icon={Settings} label="Técnico" />
                        <ModeTab active={mode === 'TELEOPERADORA'} onClick={() => handleModeChange('TELEOPERADORA')} icon={PhoneCall} label="Tele" />
                    </div>
                </div>
            </header>

            {data?.timestamp && (
                <p className="text-xs text-gray-400 font-medium">
                    Última actualización: {new Date(data.timestamp).toLocaleString('es-ES')}
                </p>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 text-sm">
                    Error al cargar datos CRM: {error}
                </div>
            )}

            <DashboardFilters
                key={mode}
                usuarios={modeUsuarios}
                tipos={modeTipos}
                cuentas={data?.filters?.cuentas || []}
                selectedComercial={selectedComercial}
                setSelectedComercial={setSelectedComercial}
                selectedTipo={selectedTipo}
                setSelectedTipo={setSelectedTipo}
                selectedCuenta={selectedCuenta}
                setSelectedCuenta={setSelectedCuenta}
                dateRange={dateRange}
                setDateRange={setDateRange}
                mode={mode.toLowerCase() as any}
                hideTipoFilter={mode === 'TECNICO'}
                typeLabel={mode === 'TELEOPERADORA' ? 'Tipo de Tarea' : 'Tipo de Evento'}
            />

            {/* ── Metric Cards ── */}
            {mode === 'COMERCIAL' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCard label="Datos Entregados" value={metrics.entregados} icon={Users} color="text-blue-500" loading={loading} />
                    <MetricCard label="Confirmados" value={metrics.confirmados} icon={CheckCircle2} color="text-emerald-500" loading={loading} />
                    <MetricCard label="Demos Realizadas" value={metrics.demos} icon={ClipboardList} color="text-amber-500" loading={loading} />
                    <MetricCard label="Nulos" value={metrics.nulos} icon={XCircle} color="text-red-500" loading={loading} />
                </div>
            )}

            {mode === 'TECNICO' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCard label="Total Asignados" value={metrics.entregados} icon={Users} color="text-blue-500" loading={loading} />
                    {data?.filters?.tipos?.map((tipo: string) => {
                        const tUp = tipo.toUpperCase();
                        const icon = tUp.includes('INSTALACI') ? Wrench : tUp.includes('MANTENIMIENTO') ? Settings : AlertCircle;
                        const color = tUp.includes('INSTALACI') ? 'text-blue-400' : tUp.includes('MANTENIMIENTO') ? 'text-emerald-400' : 'text-red-400';
                        return (
                            <MetricCard
                                key={tipo}
                                label={tipo}
                                value={metrics.tipos?.[tipo] ?? 0}
                                icon={icon}
                                color={color}
                                loading={loading}
                            />
                        );
                    })}
                </div>
            )}

            {mode === 'TELEOPERADORA' && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <MetricCard label="Cedidos" value={metrics.entregados} icon={Users} color="text-zinc-400" loading={loading} />
                    <MetricCard label="Concertados" value={metrics.confirmados} icon={CalendarCheck} color="text-blue-400" loading={loading} />
                    <MetricCard label="Nulos" value={metrics.nulos} icon={XCircle} color="text-red-400" loading={loading} />
                    <MetricCard label="Errores" value={metrics.errores} icon={AlertCircle} color="text-orange-400" loading={loading} />
                    <MetricCard label="No Localizado/a" value={metrics.noLocalizados} icon={PhoneOff} color="text-zinc-500" loading={loading} />
                    <MetricCard label="Pendientes" value={metrics.pendientes} icon={Clock} color="text-amber-400" loading={loading} />
                </div>
            )}

            {/* ── Chart + Side cards ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <SalesChart
                        data={chartData}
                        bars={mode === 'TECNICO' ? [{ key: 'instalacion', name: 'Instalación', color: '#3b82f6' }] : undefined}
                        lines={mode === 'TECNICO' ? [
                            { key: 'mantenimiento', name: 'Mantenimiento', color: '#10b981' },
                            { key: 'incidencia', name: 'Incidencias', color: '#ef4444' },
                        ] : undefined}
                    />
                </div>
                <div className="flex flex-col gap-6">
                    {mode !== 'TELEOPERADORA' ? (
                        <>
                            {mode === 'COMERCIAL' && (
                                <MetricCard label="Ventas Cerradas" value={metrics.ventas} icon={TrendingUp} color="text-emerald-500" loading={loading} />
                            )}
                            <MetricCard
                                label="Ratio Conversión"
                                value={`${Math.round((metrics.ventas / (metrics.demos || 1)) * 100)}%`}
                                icon={TrendingUp}
                                color="text-purple-500"
                                loading={loading}
                            />
                        </>
                    ) : (
                        <>
                            <MetricCard label="Pedidos" value={metrics.ventas} icon={Package} color="text-purple-400" loading={loading} />
                            <MetricCard label="Ventas Aprobadas" value={metrics.ventasAprobadas} icon={TrendingUp} color="text-emerald-400" loading={loading} />
                        </>
                    )}
                </div>
            </div>

            <HistoricalTable data={eventosFiltrados.map(parseRow)} mode={mode.toLowerCase() as any} />
        </div>
    );
}

function ModeTab({ active, onClick, icon: Icon, label }: any) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all duration-200 ${
                active ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
        >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
        </button>
    );
}
