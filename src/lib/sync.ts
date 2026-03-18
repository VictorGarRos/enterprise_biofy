import prisma from "./prisma";
import { metaGet } from "./meta";

export async function syncMetaData() {
  console.log("[sync] Starting Meta data synchronization...");

  try {
    const campaignsRes = await fetchCampaignsFromMeta();
    console.log(`[sync] Found ${campaignsRes.length} campaigns.`);

    for (const campaign of campaignsRes) {
      await prisma.campaign.upsert({
        where: { id: campaign.id },
        update: {
          name: campaign.name,
          status: campaign.status,
          effectiveStatus: campaign.effective_status,
          objective: campaign.objective,
          lastSyncAt: new Date(),
        },
        create: {
          id: campaign.id,
          name: campaign.name,
          status: campaign.status,
          effectiveStatus: campaign.effective_status,
          objective: campaign.objective,
          adAccountId: campaign.adAccountId,
        },
      });

      const since = "2026-01-01";
      const until = new Date().toISOString().split('T')[0];

      const insights = await fetchInsightsFromMeta(campaign.id, since, until);
      console.log(`[sync] Campaign ${campaign.id}: Synchronizing ${insights.length} daily records.`);

      for (const day of insights) {
        const leads = aggregateLeads(day.actions || []);

        await prisma.dailyInsight.upsert({
          where: {
            campaignId_date: {
              campaignId: campaign.id,
              date: day.date_start,
            },
          },
          update: {
            impressions: parseInt(day.impressions) || 0,
            clicks: parseInt(day.clicks) || 0,
            spend: parseFloat(day.spend) || 0,
            reaches: parseInt(day.reach) || 0,
            leads: leads,
          },
          create: {
            campaignId: campaign.id,
            date: day.date_start,
            impressions: parseInt(day.impressions) || 0,
            clicks: parseInt(day.clicks) || 0,
            spend: parseFloat(day.spend) || 0,
            reaches: parseInt(day.reach) || 0,
            leads: leads,
          },
        });
      }
    }

    console.log("[sync] Synchronization completed successfully.");
    return { success: true };
  } catch (error) {
    console.error("[sync] Error during synchronization:", error);
    throw error;
  }
}

async function fetchCampaignsFromMeta() {
  const { getMetaConfig } = await import("./meta");
  const { acts } = getMetaConfig();
  const all = [];

  for (const act of acts) {
    const res = await metaGet(`${act}/campaigns`, {
      fields: "id,name,status,effective_status,objective",
      limit: "100"
    });
    if (res.data) {
      all.push(...res.data.map((c: any) => ({ ...c, adAccountId: act })));
    }
  }
  return all;
}

async function fetchInsightsFromMeta(campaignId: string, since: string, until: string) {
  return await metaGet(`${campaignId}/insights`, {
    time_range: JSON.stringify({ since, until }),
    fields: "impressions,clicks,spend,actions,reach,date_start",
    time_increment: "1",
    level: "campaign",
    limit: "100"
  }).then(res => res.data || []);
}

function aggregateLeads(actions: any[]): number {
  const leadAction = actions.find(a => a.action_type === "lead");
  if (leadAction) {
    return parseInt(leadAction.value) || 0;
  }

  return actions
    .filter(a => ["offsite_conversion.fb_pixel_lead", "on_facebook_lead"].includes(a.action_type))
    .reduce((sum, a) => sum + (parseInt(a.value) || 0), 0);
}
