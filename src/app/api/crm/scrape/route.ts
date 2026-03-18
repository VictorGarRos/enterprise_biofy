import { NextResponse } from 'next/server';
import { scrapeCRMData } from '@/lib/scraper';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        console.log("Starting forced API scrape...");
        const result = await scrapeCRMData(
            process.env.CRM_USERNAME || 'VICTOR',
            process.env.CRM_PASSWORD || 'VICTOR'
        );

        if (result.success && result.data) {
            const { eventos, pedidos, tareas, usuarios, timestamp } = result.data;

            await prisma.crmSnapshot.upsert({
                where: { id: 1 },
                update: {
                    eventos: eventos as any,
                    pedidos: pedidos as any,
                    tareas: (tareas ?? []) as any,
                    usuarios: (usuarios ?? []) as any,
                    timestamp,
                },
                create: {
                    id: 1,
                    eventos: eventos as any,
                    pedidos: pedidos as any,
                    tareas: (tareas ?? []) as any,
                    usuarios: (usuarios ?? []) as any,
                    timestamp,
                },
            });

            return NextResponse.json({
                success: true,
                message: `Scraped and saved: ${eventos.length} eventos, ${pedidos.length} pedidos, ${(tareas ?? []).length} tareas, ${(usuarios ?? []).length} usuarios.`
            });
        } else {
            return NextResponse.json({ success: false, error: result.error }, { status: 500 });
        }
    } catch (e: any) {
        console.error('Scrape route error:', e);
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
