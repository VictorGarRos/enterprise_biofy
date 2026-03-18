import { NextRequest, NextResponse } from 'next/server';
import { getMetaConfig, metaGet } from '@/lib/meta';

export async function GET(request: NextRequest) {
    try {
        const config = getMetaConfig();

        // Fetch each configured account directly by ID
        const results = await Promise.all(
            config.acts.map((actId: string) =>
                metaGet(actId, {
                    fields: 'id,name,account_status,currency,timezone_name,business_city,business_state,business_zip,business_country_code'
                })
            )
        );

        const formattedAccounts = results.map((account: any) => ({
            id: account.id,
            name: account.name,
            status: account.account_status,
            currency: account.currency,
            timezone: account.timezone_name,
            city: account.business_city,
            state: account.business_state,
            zip: account.business_zip,
            country: account.business_country_code
        }));

        return NextResponse.json({
            data: formattedAccounts,
            success: true,
            count: formattedAccounts.length
        });
    } catch (error: any) {
        console.error('Meta accounts error:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            data: []
        }, { status: 500 });
    }
}
