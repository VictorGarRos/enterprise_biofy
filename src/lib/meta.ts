function normalizeEnvValue(val: string | undefined) {
  if (!val) return "";
  return val.trim().replace(/^["']|["']$/g, "").trim();
}

function normalizeVersion(raw: string) {
  const v = normalizeEnvValue(raw).replace(/^\/+|\/+$/g, "");
  return v.startsWith("v") ? v : `v${v}`;
}

function normalizePath(raw: string) {
  return raw.trim().replace(/^\/+/, "");
}

export function getMetaConfig() {
  const token = normalizeEnvValue(process.env.META_ACCESS_TOKEN);
  const actRaw = normalizeEnvValue(process.env.META_AD_ACCOUNT_ID);
  const vRaw = process.env.META_API_VERSION ?? "v19.0";
  const v = normalizeVersion(vRaw);

  const acts = actRaw.split(',').map(a => {
    let val = a.trim();
    if (!val) return "";
    if (!val.startsWith("act_")) val = `act_${val}`;
    return val;
  }).filter(Boolean);

  if (!token || acts.length === 0) throw new Error("Missing META_ACCESS_TOKEN or META_AD_ACCOUNT_ID");

  return { token, acts, act: acts[0], v };
}

export async function metaGet(path: string, params: Record<string, string> = {}) {
  const { token, v } = getMetaConfig();
  const cleanPath = normalizePath(path);

  const url = new URL(`https://graph.facebook.com/${v}/${cleanPath}`);
  for (const [k, val] of Object.entries(params)) url.searchParams.set(k, val);
  url.searchParams.set("access_token", token);

  const r = await fetch(url.toString(), { cache: "no-store" });
  const j = await r.json();

  if (!r.ok) throw new Error(JSON.stringify({ status: r.status, error: j }));
  return j;
}
