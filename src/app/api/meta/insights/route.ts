import { NextRequest, NextResponse } from 'next/server';
import { getMetaConfig, metaGet } from '@/lib/meta';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const dateStart = searchParams.get('dateStart') || new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0];
        const dateEnd = searchParams.get('dateEnd') || new Date().toISOString().split('T')[0];
        const adAccountId = searchParams.get('adAccountId');
        const campaignId = searchParams.get('campaignId');

        const config = getMetaConfig();
        const actIds = adAccountId ? [adAccountId] : config.acts;

        const insightParams: Record<string, string> = {
            'fields': 'date_start,spend,impressions,clicks,actions,reach',
            'time_range': JSON.stringify({ since: dateStart, until: dateEnd }),
            'time_increment': '1',
            'level': campaignId ? 'campaign' : 'account',
            'limit': '1000'
        };
        if (campaignId) insightParams['filtering'] = JSON.stringify([{ field: 'campaign.id', operator: 'IN', value: [campaignId] }]);

        // Fetch insights for all relevant accounts in parallel
        const allResults = await Promise.all(
            actIds.map((id: string) => metaGet(`${id}/insights`, insightParams).catch(() => ({ data: [] })))
        );

        // Aggregate all items from all accounts
        const allItems = allResults.flatMap((r: any) => r.data || []);

        // Merge by date (sum metrics across accounts for the same day)
        const byDate = new Map<string, any>();
        for (const item of allItems) {
            const date = item.date_start || item.date_end;
            const leads = (item.actions || []).reduce((sum: number, action: any) => {
                if (!action || action.action_type !== 'lead') return sum;
                const val = Number(action.value || 0);
                return sum + (Number.isNaN(val) ? 0 : val);
            }, 0);
            if (byDate.has(date)) {
                const existing = byDate.get(date);
                existing.spend += parseFloat(item.spend || 0);
                existing.impressions += parseInt(item.impressions || 0);
                existing.clicks += parseInt(item.clicks || 0);
                existing.reach += parseInt(item.reach || 0);
                existing.leads += leads;
            } else {
                byDate.set(date, {
                    date,
                    spend: parseFloat(item.spend || 0),
                    impressions: parseInt(item.impressions || 0),
                    clicks: parseInt(item.clicks || 0),
                    reach: parseInt(item.reach || 0),
                    leads,
                    costPerLead: 0
                });
            }
        }

        const formattedData = Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));

        return NextResponse.json({ data: formattedData, success: true });
    } catch (error: any) {
        console.error('Meta insights error:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            data: []
        }, { status: 500 });
    }
}
