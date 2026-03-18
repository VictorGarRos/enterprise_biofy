import { NextRequest, NextResponse } from 'next/server';
import { getMetaConfig, metaGet } from '@/lib/meta';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const campaignId = searchParams.get('campaignId');

        if (!campaignId) {
            return NextResponse.json({
                success: false,
                error: 'campaignId is required',
                data: []
            }, { status: 400 });
        }

        // Get ad sets for the campaign
        const adsets = await metaGet(`${campaignId}/adsets`, {
            'fields': 'id,name,status,daily_budget,lifetime_budget,start_date,end_date,targeting,created_time',
            'limit': '100'
        });

        const formattedAdsets = (adsets.data || []).map((adset: any) => ({
            id: adset.id,
            name: adset.name,
            status: adset.status,
            dailyBudget: adset.daily_budget ? parseFloat(adset.daily_budget) / 100 : null,
            lifetimeBudget: adset.lifetime_budget ? parseFloat(adset.lifetime_budget) / 100 : null,
            startDate: adset.start_date,
            endDate: adset.end_date,
            createdAt: adset.created_time
        }));

        return NextResponse.json({
            data: formattedAdsets,
            success: true,
            count: formattedAdsets.length
        });
    } catch (error: any) {
        console.error('Meta adsets error:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            data: []
        }, { status: 500 });
    }
}
