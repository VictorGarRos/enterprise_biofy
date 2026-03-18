import { useState, useEffect, useMemo } from 'react';

export function useCRMData() {
    const [rawData, setRawData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/crm/data')
            .then(r => { if (!r.ok) throw new Error('Sin datos CRM. Ejecuta un sync primero.'); return r.json(); })
            .then(json => setRawData(json))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    const data = useMemo(() => {
        if (!rawData) return null;

        const usuarios: { login: string; nombre: string; tipo: string; rawRow: string; cells: string[] }[] =
            rawData.usuarios || [];
        const eventos: string[] = rawData.eventos || [];
        const pedidos: string[] = rawData.pedidos || [];
        const tareas: string[] = rawData.tareas || [];

        // Build user lists from usuarios by tipo
        const byTipo = (tipo: string): string[] =>
            [...new Set(
                usuarios
                    .filter(u => u.tipo?.toUpperCase() === tipo)
                    .map(u => u.nombre)
                    .filter(Boolean)
            )].sort() as string[];

        // Unique event types from eventos (tab index 11)
        const tipos: string[] = [...new Set(
            eventos
                .filter(r => r.trim().length > 0 && !r.includes('Fecha Hora'))
                .map(r => {
                    const parts = r.split('\t');
                    return (parts[11] ?? '').replace(/\s+/g, ' ').trim().toUpperCase();
                })
                .filter(Boolean)
        )].sort() as string[];

        // Base metrics (unfiltered, for reference)
        const validEvents = eventos.filter(r => /\d{2}\/\d{2}\/\d{4}/.test(r));
        const validPedidos = pedidos.filter(r => {
            const u = r.trim().toUpperCase();
            return u && !u.startsWith('PEDIDO') && !u.includes('IMP.INGRE') &&
                !u.includes('MANT.') && !u.includes('MANTENIMIENTO');
        });

        const metrics = {
            entregados: validEvents.length,
            confirmados: validEvents.filter(r =>
                r.toUpperCase().includes('CONFIRMADO') || r.toUpperCase().includes('CONCERTADO')).length,
            demos: validEvents.filter(r => r.toUpperCase().includes('COMPLETADO')).length,
            ventas: validPedidos.length,
        };

        return {
            timestamp: rawData.timestamp as string,
            metrics,
            filters: {
                comerciales: byTipo('COMERCIAL'),
                tecnicos: byTipo('TECNICO'),
                teleoperadoras: byTipo('TELEOPERADORA'),
                tipos,
                tareas: ['Lead Digital', 'Llamada'],
                cuentas: ['POTENCIAL', 'CLIENTE', 'VIP', 'VIP BIOFY', 'ALQUILER'],
            },
            raw: {
                eventos,
                pedidos,
                tareas,
                usuarios,
            },
        };
    }, [rawData]);

    return { data, loading, error };
}
