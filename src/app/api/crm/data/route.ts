import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const snapshot = await prisma.crmSnapshot.findUnique({ where: { id: 1 } });

        if (!snapshot) {
            return NextResponse.json(
                { error: 'No hay datos. Ejecuta un scrape primero.' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            eventos: snapshot.eventos,
            pedidos: snapshot.pedidos,
            tareas: snapshot.tareas,
            usuarios: snapshot.usuarios,
            timestamp: snapshot.timestamp,
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
