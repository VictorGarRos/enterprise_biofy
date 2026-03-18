import { NextRequest, NextResponse } from 'next/server';
import { getMetaConfig, metaGet } from '@/lib/meta';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const accountId = searchParams.get('adAccountId');

        const config = getMetaConfig();
        const actId = accountId || config.act;

        // Get campaigns for the ad account
        const campaigns = await metaGet(`${actId}/campaigns`, {
            'fields': 'id,name,status,objective,daily_budget,lifetime_budget,spend_cap,created_time,updated_time,start_date,stop_date',
            'limit': '100'
        });

        const formattedCampaigns = (campaigns.data || []).map((campaign: any) => ({
            id: campaign.id,
            name: campaign.name,
            status: campaign.status,
            objective: campaign.objective,
            dailyBudget: campaign.daily_budget ? parseFloat(campaign.daily_budget) / 100 : null,
            lifetimeBudget: campaign.lifetime_budget ? parseFloat(campaign.lifetime_budget) / 100 : null,
            spendCap: campaign.spend_cap ? parseFloat(campaign.spend_cap) / 100 : null,
            createdAt: campaign.created_time,
            updatedAt: campaign.updated_time,
            startDate: campaign.start_date,
            stopDate: campaign.stop_date
        }));

        return NextResponse.json({
            data: formattedCampaigns,
            success: true,
            count: formattedCampaigns.length
        });
    } catch (error: any) {
        console.error('Meta campaigns error:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            data: []
        }, { status: 500 });
    }
}
