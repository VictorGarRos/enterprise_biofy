import cron from 'node-cron';
// node-fetch not needed — global fetch available in Node 18+

const CRM_SCRAPE_URL = process.env.CRM_SCRAPE_URL || 'http://localhost:3000/api/crm/scrape';

async function runScraper() {
  const ts = new Date().toISOString();
  console.log(`[${ts}] Starting scheduled CRM Biofy scrape: ${CRM_SCRAPE_URL}`);
  try {
    const res = await fetch(CRM_SCRAPE_URL);
    const body = await res.text();

    if (!res.ok) {
      console.error(`[${ts}] Scrape failed status=${res.status} body=${body}`);
      return;
    }

    console.log(`[${ts}] Scrape success status=${res.status} body=${body}`);
  } catch (error) {
    console.error(`[${ts}] Scrape error:`, error);
  }
}

cron.schedule('0 0 * * *', () => {
  runScraper().catch(err => console.error('RunScraper catch:', err));
});

console.log('Enterprise-hub CRM Biofy scheduler started.');
console.log('Task scheduled for every day at 00:00 (midnight)');

// Run now on start.
runScraper().catch(err => console.error('Initial scrape catch:', err));
