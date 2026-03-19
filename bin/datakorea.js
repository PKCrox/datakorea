#!/usr/bin/env node
// DataKorea CLI — Korean data accessibility map
// Usage: datakorea <command> [options]

import { stats, orgs, org, search, datasets, domains, categories, categoryLabel } from '../src/index.js';

const args = process.argv.slice(2);
const cmd = args[0];
const flags = {};
const positional = [];

for (let i = 1; i < args.length; i++) {
  if (args[i].startsWith('--')) {
    const [k, v] = args[i].slice(2).split('=');
    flags[k] = v ?? args[++i] ?? true;
  } else {
    positional.push(args[i]);
  }
}

const json = flags.json !== undefined || flags.format === 'json';
const tsv = flags.tsv !== undefined || flags.format === 'tsv';

function out(data) {
  if (json || tsv) {
    if (tsv && Array.isArray(data) && data.length) {
      const keys = Object.keys(data[0]);
      console.log(keys.join('\t'));
      for (const row of data) console.log(keys.map(k => String(row[k] ?? '')).join('\t'));
    } else {
      console.log(JSON.stringify(data, null, json ? 2 : 0));
    }
  } else {
    prettyPrint(data);
  }
}

function typeLabel(org_type) {
  if (org_type === 'gov') return '공공';
  if (org_type === 'public_corp') return '공기업';
  return '민간';
}

function prettyPrint(data) {
  if (Array.isArray(data)) {
    if (!data.length) { console.log('(no results)'); return; }
    const sample = data[0];
    if (sample.name && sample.id) {
      const maxName = Math.min(30, Math.max(...data.map(d => (d.name||'').length)));
      for (const d of data) {
        const name = (d.name || '').padEnd(maxName);
        const ds = d.total_datasets != null ? `${d.total_datasets} ds`.padStart(8) : '';
        const api = d.active_apis != null ? `${d.active_apis} api`.padStart(8) : '';
        const ai = d.avg_ai_score != null ? `AI ${d.avg_ai_score}`.padStart(6) : '';
        console.log(`  ${d.id.padEnd(28)} ${name} ${typeLabel(d.org_type).padEnd(4)} ${ds}${api}  ${ai}`);
      }
    } else if (sample.category) {
      for (const d of data) {
        console.log(`  ${(d.label || d.category || '').padEnd(12)} ${String(d.orgs).padStart(5)} orgs  ${String(d.datasets).padStart(7)} ds  ${String(d.apis).padStart(5)} api`);
      }
    } else {
      console.log(JSON.stringify(data, null, 2));
    }
    console.log(`\n  ${data.length} results`);
  } else if (data && typeof data === 'object') {
    if (data.query !== undefined) {
      console.log(`\n  "${data.query}" → ${data.total} results\n`);
      if (data.orgs?.length) {
        console.log('  --- Organizations ---');
        for (const o of data.orgs) {
          console.log(`  ${o.id.padEnd(28)} ${o.name}  (${typeLabel(o.org_type)})`);
        }
      }
      if (data.datasets?.length) {
        console.log(`\n  --- Datasets (${data.datasets.length}) ---`);
        for (const d of data.datasets.slice(0, 20)) {
          console.log(`  ${(d.org_id||'').padEnd(28)} ${d.name}`);
        }
        if (data.datasets.length > 20) console.log(`  ... +${data.datasets.length - 20} more`);
      }
    } else if (data.datasets !== undefined && data.id) {
      console.log(`\n  ${data.name} (${data.id})`);
      console.log(`  Type: ${typeLabel(data.org_type)}  Industry: ${categoryLabel(data.industry) || '-'}`);
      console.log(`  Datasets: ${data.total_datasets}  APIs: ${data.active_apis}  AI Score: ${data.avg_ai_score}`);
      if (data.website) console.log(`  Website: ${data.website}`);
      if (data.datasets?.length) {
        console.log(`\n  --- Datasets (${data.datasets.length}) ---`);
        for (const d of data.datasets.slice(0, 20)) {
          const open = d.is_open ? '✓' : '✗';
          console.log(`    ${open} ${d.name}`);
        }
        if (data.datasets.length > 20) console.log(`    ... +${data.datasets.length - 20} more`);
      }
      if (data.domains?.length) {
        console.log(`\n  --- Data Domains (${data.domains.length}) ---`);
        for (const d of data.domains) {
          const acc = { api_open: 'OPEN', api_paid: 'PAID', partnership: 'PARTNER', internal: 'INTERNAL' }[d.accessibility] || d.accessibility;
          console.log(`    [${acc.padEnd(8)}] ${d.domain_name} — ${d.description || ''}`);
        }
      }
    } else if (data.total_organizations !== undefined) {
      console.log(`\n  DataKorea Statistics`);
      console.log(`  ─────────────────────────────`);
      console.log(`  Organizations:  ${data.total_organizations.toLocaleString()} (${data.gov_organizations} gov + ${data.private_organizations} private)`);
      console.log(`  Datasets:       ${data.total_datasets.toLocaleString()}`);
      console.log(`  Domains:        ${data.total_domains.toLocaleString()}`);
      console.log(`  Categories:     ${data.categories.length}`);
      console.log(`  Exported:       ${data.exported_at}`);
    } else {
      console.log(JSON.stringify(data, null, 2));
    }
  }
}

function usage() {
  console.log(`
  datakorea — 한국 데이터 접근성 지도 CLI

  Usage:
    datakorea stats                       전체 통계
    datakorea categories                  카테고리별 현황
    datakorea orgs [--type=gov|private]   기관 목록
                   [--industry=health]
                   [--sort=datasets|ai|name]
                   [--limit=20]
    datakorea org <id>                    기관 상세 (데이터셋+도메인 포함)
    datakorea search <query>              기관/데이터셋 검색
    datakorea datasets [org_id]           데이터셋 목록
                       [--limit=100]
    datakorea domains [org_id]            민간 데이터 도메인

  Flags:
    --json          JSON 출력
    --tsv           TSV 출력 (파이프/AI 친화)
    --limit=N       결과 수 제한
    --format=json   --json과 동일

  Examples:
    datakorea stats
    datakorea search 기상청
    datakorea org gov-kma
    datakorea orgs --type=private --sort=datasets --limit=10
    datakorea categories --json
    datakorea search 교통 --tsv | head -20
`);
}

const DEFAULT_LIMITS = { datasets: 100, domains: 100, orgs: 50 };

function parseLimit(val, fallback) {
  if (val === undefined || val === true) return fallback;
  const n = Number(val);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

try {
  switch (cmd) {
    case 'stats':
      out(stats());
      break;
    case 'categories':
    case 'cats':
      out(categories());
      break;
    case 'orgs':
    case 'list':
      out(orgs({
        type: flags.type,
        industry: flags.industry,
        sort: flags.sort || 'datasets',
        limit: parseLimit(flags.limit, DEFAULT_LIMITS.orgs),
      }));
      break;
    case 'org':
    case 'detail':
      if (!positional[0]) { console.error('Usage: datakorea org <id>'); process.exit(1); }
      const result = org(positional[0]);
      if (!result) { console.error(`Organization not found: ${positional[0]}`); process.exit(1); }
      out(result);
      break;
    case 'search':
    case 's':
      if (!positional[0]) { console.error('Usage: datakorea search <query>'); process.exit(1); }
      out(search(positional.join(' '), { limit: parseLimit(flags.limit, 50) }));
      break;
    case 'datasets':
    case 'ds':
      out(datasets(positional[0], { limit: parseLimit(flags.limit, DEFAULT_LIMITS.datasets) }));
      break;
    case 'domains':
      out(domains(positional[0]));
      break;
    case 'help':
    case '--help':
    case '-h':
    case undefined:
      usage();
      break;
    default:
      out(search([cmd, ...positional].join(' '), { limit: parseLimit(flags.limit, 50) }));
  }
} catch (e) {
  console.error('Error:', e.message);
  process.exit(1);
}
