import { CustomSelect } from './CustomSelect';
import { DateRangePicker } from './DateRangePicker';
import { DateRange } from 'react-day-picker';

interface DashboardFiltersProps {
    usuarios: string[];
    tipos: string[];
    cuentas: string[];
    selectedComercial: string;
    setSelectedComercial: (val: string) => void;
    selectedTipo: string;
    setSelectedTipo: (val: string) => void;
    selectedCuenta: string;
    setSelectedCuenta: (val: string) => void;
    dateRange: DateRange | undefined;
    setDateRange: (range: DateRange | undefined) => void;
    mode: 'comercial' | 'tecnico' | 'teleoperadora';
    hideTipoFilter?: boolean;
    typeLabel?: string;
}

const USER_LABEL: Record<string, string> = {
    comercial: 'Comercial',
    tecnico: 'Técnico',
    teleoperadora: 'Teleoperadora',
};

export function DashboardFilters({
    usuarios,
    tipos,
    cuentas,
    selectedComercial,
    setSelectedComercial,
    selectedTipo,
    setSelectedTipo,
    selectedCuenta,
    setSelectedCuenta,
    dateRange,
    setDateRange,
    mode,
    hideTipoFilter = false,
    typeLabel,
}: DashboardFiltersProps) {
    const userLabel = USER_LABEL[mode] ?? 'Usuario';
    const tipoLabel = typeLabel ?? (mode === 'teleoperadora' ? 'Tipo de Tarea' : 'Tipo de Evento');

    const userOptions = [
        { value: '', label: `Todos`, description: 'Ver todos' },
        ...usuarios.map(c => ({ value: c, label: c }))
    ];

    const tipoOptions = [
        { value: '', label: 'Cualquier Tipo', description: 'Todos' },
        ...tipos.map(t => ({ value: t, label: t }))
    ];

    const cuentaOptions = [
        { value: '', label: 'Todas', description: 'Todos los tipos' },
        ...cuentas.map(c => ({ value: c, label: c }))
    ];

    const cols = hideTipoFilter ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4';

    return (
        <div className="relative z-30 flex flex-col gap-4 p-4 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className={`grid ${cols} gap-4`}>
                <CustomSelect
                    label={userLabel}
                    placeholder="Todos"
                    options={userOptions}
                    value={selectedComercial}
                    onChange={setSelectedComercial}
                    searchable
                />

                {!hideTipoFilter && (
                    <CustomSelect
                        label={tipoLabel}
                        placeholder="Todos los tipos"
                        options={tipoOptions}
                        value={selectedTipo}
                        onChange={setSelectedTipo}
                    />
                )}

                <CustomSelect
                    label="Tipo de Cliente"
                    placeholder="Todos"
                    options={cuentaOptions}
                    value={selectedCuenta}
                    onChange={setSelectedCuenta}
                />

                <DateRangePicker
                    label="Rango Fechas"
                    date={dateRange}
                    setDate={setDateRange}
                />
            </div>
        </div>
    );
}
