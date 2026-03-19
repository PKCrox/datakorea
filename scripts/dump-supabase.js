#!/usr/bin/env node
// Dump all DataKorea tables from Supabase to local JSON files
// Usage: node --env-file=../.env.local scripts/dump-supabase.js

import { writeFileSync, readFileSync } from 'fs';
import { gzipSync } from 'zlib';

for (const p of ['../.env.local', '.env.local']) {
  try {
    const f = readFileSync(p, 'utf8');
    for (const l of f.split('\n')) {
      const m = l.match(/^([A-Z_]+)=(.+)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
    }
  } catch {}
}

const SB_URL = process.env.SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_KEY;
if (!SB_URL || !SB_KEY) { console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY'); process.exit(1); }

async function fetchAll(table, select = '*', order = 'id') {
  const rows = [];
  let offset = 0;
  const limit = 1000;
  while (true) {
    const url = `${SB_URL}/rest/v1/${table}?select=${encodeURIComponent(select)}&order=${order}&offset=${offset}&limit=${limit}`;
    const res = await fetch(url, {
      headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` },
    });
    if (!res.ok) throw new Error(`${table}: ${res.status} ${await res.text()}`);
    const batch = await res.json();
    rows.push(...batch);
    if (batch.length < limit) break;
    offset += limit;
  }
  return rows;
}

// Strip internal timestamps + useless uniform fields
function stripMeta(rows) {
  return rows.map(r => {
    const { created_at, updated_at, ...rest } = r;
    return rest;
  });
}

function stripDatasetMeta(rows) {
  return rows.map(r => {
    const { created_at, updated_at, data_type, estimated_records, ...rest } = r;
    return rest;
  });
}

async function main() {
  console.log('Dumping DataKorea data from Supabase...\n');

  // 1. Organizations (raw)
  console.log('  dk_organizations...');
  const rawOrgs = stripMeta(await fetchAll('dk_organizations'));

  // 2. Datasets — gzipped (too large for plain JSON in git)
  console.log('  dk_datasets...');
  const datasets = stripDatasetMeta(await fetchAll('dk_datasets', '*', 'org_id'));
  const dsJson = JSON.stringify(datasets);
  const dsGz = gzipSync(Buffer.from(dsJson), { level: 9 });
  writeFileSync('data/datasets.json.gz', dsGz);
  console.log(`    ${datasets.length} rows → datasets.json.gz (${(dsGz.length / 1024 / 1024).toFixed(1)}MB, raw ${(dsJson.length / 1024 / 1024).toFixed(0)}MB)`);

  // 3. Data domains (private)
  console.log('  dk_data_domains...');
  const domains = stripMeta(await fetchAll('dk_data_domains', '*', 'org_id'));
  const domJson = JSON.stringify(domains);
  writeFileSync('data/domains.json', domJson);
  console.log(`    ${domains.length} rows → domains.json (${(domJson.length / 1024).toFixed(0)}KB)`);

  // 4. Fetch org stats via RPC (includes materialized view data)
  console.log('  dk_org_list RPC (with stats)...');
  let mvStats = {};
  try {
    const rpcRes = await fetch(`${SB_URL}/rest/v1/rpc/dk_org_list`, {
      method: 'POST',
      headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_sort: 'datasets_desc', p_limit: 2000 }),
    });
    if (rpcRes.ok) {
      const rpcBody = await rpcRes.json();
      const rpcData = rpcBody.orgs || rpcBody;
      for (const r of rpcData) mvStats[r.id] = r;
      console.log(`    ${rpcData.length} rows from RPC`);
    } else throw new Error(await rpcRes.text());
  } catch (e) {
    console.log(`    RPC unavailable (${e.message}), computing from datasets...`);
    for (const d of datasets) {
      if (!mvStats[d.org_id]) mvStats[d.org_id] = { total_datasets: 0, open_datasets: 0, active_apis: 0 };
      mvStats[d.org_id].total_datasets++;
      if (d.is_open) mvStats[d.org_id].open_datasets++;
    }
  }
  const domStats = {};
  for (const d of domains) {
    if (!domStats[d.org_id]) domStats[d.org_id] = 0;
    domStats[d.org_id]++;
  }
  // Whitelist public fields only — strip internal CRM/ops fields
  const orgs = rawOrgs.map(o => {
    const mv = mvStats[o.id] || {};
    return {
      id: o.id,
      name: o.name,
      name_en: o.name_en || null,
      org_type: o.org_type,
      industry: o.industry,
      sub_industry: o.sub_industry || null,
      website: o.website || null,
      dev_portal_url: o.dev_portal_url || null,
      summary: o.summary || null,
      primary_business: o.primary_business || null,
      total_datasets: mv.total_datasets || 0,
      open_datasets: mv.open_datasets || 0,
      active_apis: mv.active_apis || 0,
      avg_ai_score: mv.avg_ai_score || 0,
      easiest_auth: mv.easiest_auth || null,
      total_domains: domStats[o.id] || 0,
    };
  });
  const orgsJson = JSON.stringify(orgs);
  writeFileSync('data/organizations.json', orgsJson);
  console.log(`    ${orgs.length} rows → organizations.json (${(orgsJson.length / 1024).toFixed(0)}KB)`);

  // 5. Stats summary
  const stats = {
    exported_at: new Date().toISOString(),
    total_organizations: orgs.length,
    gov_organizations: orgs.filter(o => o.org_type === 'gov').length,
    private_organizations: orgs.filter(o => o.org_type !== 'gov').length,
    total_datasets: datasets.length,
    total_domains: domains.length,
    categories: [...new Set(orgs.map(o => o.industry))].filter(Boolean).sort(),
  };
  writeFileSync('data/stats.json', JSON.stringify(stats, null, 2));

  console.log(`\nDone. ${orgs.length} orgs, ${datasets.length} datasets, ${domains.length} domains.`);
}

main().catch(e => { console.error(e); process.exit(1); });
