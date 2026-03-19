// DataKorea — Korean data accessibility map
// 1,354 organizations · 95K+ datasets · 4K+ domains

import { readFileSync } from 'fs';
import { gunzipSync } from 'zlib';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data');

let _orgs, _datasets, _domains, _stats;

function loadOrgs() {
  if (!_orgs) _orgs = JSON.parse(readFileSync(join(DATA_DIR, 'organizations.json'), 'utf8'));
  return _orgs;
}

function loadDatasets() {
  if (!_datasets) {
    const gz = readFileSync(join(DATA_DIR, 'datasets.json.gz'));
    _datasets = JSON.parse(gunzipSync(gz).toString());
  }
  return _datasets;
}

function loadDomains() {
  if (!_domains) _domains = JSON.parse(readFileSync(join(DATA_DIR, 'domains.json'), 'utf8'));
  return _domains;
}

function loadStats() {
  if (!_stats) _stats = JSON.parse(readFileSync(join(DATA_DIR, 'stats.json'), 'utf8'));
  return _stats;
}

// ── Category labels ──
export const CATEGORY_LABELS = {
  gov_admin: '공공행정', culture: '문화관광', corporate: '기업정보', transport: '교통',
  weather: '기상·환경', health: '의료', agriculture: '농축수산', realestate: '부동산',
  finance: '금융', social: '사회복지', education: '교육', safety: '재난안전',
  science: '과학기술', diplomacy: '통일외교', legal: '법률', ai: 'AI·데이터셋',
  statistics: '통계', geo: '지도·위치', ip: '지식재산', commerce: '커머스',
  energy: '에너지', trade: '무역·관세',
  tech: '테크', game: '게임', media: '미디어', hr: 'HR·채용',
  mobility: '모빌리티', logistics: '물류', travel: '여행',
  auto: '자동차', bio: '바이오', biotech: '바이오테크', data: '데이터',
  electronics: '전자', manufacturing: '제조', robotics: '로보틱스',
  saas: 'SaaS', semiconductor: '반도체', software: '소프트웨어', steel: '철강',
};

export function categoryLabel(key) {
  return CATEGORY_LABELS[key] || key;
}

const VALID_TYPES = new Set(['gov', 'private']);
const VALID_SORTS = new Set(['datasets', 'ai', 'name']);

// ── Public API ──

export function stats() {
  return loadStats();
}

export function orgs({ type, industry, sort, limit } = {}) {
  if (type && !VALID_TYPES.has(type)) {
    throw new Error(`Invalid type "${type}". Use: gov, private`);
  }
  if (sort && !VALID_SORTS.has(sort)) {
    throw new Error(`Invalid sort "${sort}". Use: datasets, ai, name`);
  }
  let list = loadOrgs();
  if (type === 'gov') list = list.filter(o => o.org_type === 'gov');
  else if (type === 'private') list = list.filter(o => o.org_type !== 'gov');
  if (industry) list = list.filter(o => o.industry === industry);
  if (sort === 'datasets') list = [...list].sort((a, b) => b.total_datasets - a.total_datasets);
  else if (sort === 'ai') list = [...list].sort((a, b) => b.avg_ai_score - a.avg_ai_score);
  else if (sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
  if (limit > 0) list = list.slice(0, limit);
  return list;
}

export function org(id) {
  const o = loadOrgs().find(o => o.id === id);
  if (!o) return null;
  const datasets = loadDatasets().filter(d => d.org_id === id);
  const domains = loadDomains().filter(d => d.org_id === id);
  return { ...o, datasets, domains };
}

export function search(query, { limit = 50 } = {}) {
  if (!query || typeof query !== 'string') return { query: '', orgs: [], datasets: [], total: 0 };
  const q = String(query).slice(0, 200).toLowerCase();
  const orgResults = loadOrgs().filter(o =>
    o.name?.toLowerCase().includes(q) ||
    o.id?.toLowerCase().includes(q) ||
    o.industry?.toLowerCase().includes(q)
  ).slice(0, limit);

  const dsResults = loadDatasets().filter(d =>
    d.name?.toLowerCase().includes(q) ||
    d.description?.toLowerCase().includes(q) ||
    d.tags?.some(t => t.toLowerCase().includes(q))
  ).slice(0, limit);

  return { query, orgs: orgResults, datasets: dsResults, total: orgResults.length + dsResults.length };
}

export function datasets(orgId, { limit } = {}) {
  let list = loadDatasets();
  if (orgId) list = list.filter(d => d.org_id === orgId);
  if (limit > 0) list = list.slice(0, limit);
  return list;
}

export function domains(orgId) {
  let list = loadDomains();
  if (orgId) list = list.filter(d => d.org_id === orgId);
  return list;
}

export function categories() {
  const orgsData = loadOrgs();
  const map = {};
  for (const o of orgsData) {
    const k = o.industry || 'etc';
    if (!map[k]) map[k] = { category: k, label: categoryLabel(k), orgs: 0, datasets: 0, apis: 0 };
    map[k].orgs++;
    map[k].datasets += o.total_datasets || 0;
    map[k].apis += o.active_apis || 0;
  }
  return Object.values(map).sort((a, b) => b.datasets - a.datasets);
}
