<p align="center">
  <h1 align="center">DataKorea</h1>
  <p align="center">
    한국 데이터 접근성 지도 — 1,354 기관 · 95K+ 데이터셋 · 4K+ 데이터 도메인
    <br/>
    <em>Korean data accessibility map. Every public agency and major private company's data assets in one place.</em>
  </p>
</p>

<p align="center">
  <a href="https://pkcrox.github.io/datakorea/"><strong>Web Dashboard</strong></a> ·
  <a href="https://www.npmjs.com/package/datakorea">npm</a> ·
  <a href="#cli">CLI</a> ·
  <a href="#as-a-library">Library</a>
</p>

<p align="center">
  <a href="https://pkcrox.github.io/datakorea/"><img src="https://img.shields.io/badge/dashboard-live-F5A623?style=flat-square" alt="dashboard"></a>
  <a href="https://www.npmjs.com/package/datakorea"><img src="https://img.shields.io/npm/v/datakorea.svg?style=flat-square" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/datakorea"><img src="https://img.shields.io/npm/dm/datakorea.svg?style=flat-square" alt="npm downloads"></a>
  <a href="https://github.com/PKCrox/datakorea/blob/main/LICENSE"><img src="https://img.shields.io/github/license/PKCrox/datakorea.svg?style=flat-square" alt="license"></a>
  <img src="https://img.shields.io/badge/dependencies-0-brightgreen.svg?style=flat-square" alt="zero dependencies">
</p>

---

## Web Dashboard

**[pkcrox.github.io/datakorea](https://pkcrox.github.io/datakorea/)** — 서버 없이 브라우저에서 바로 탐색.

- 듀얼트랙 스코어링 — 공공(데이터 품질) vs 민간(데이터 개방성)
- 스캐터플롯 — 1,354 기관 접근 난이도 × 데이터 품질, 민간 호버 시 도메인 분포
- 리더보드 — 공공/민간 Top 15 랭킹
- 섹터별 테이블 — 22개 카테고리, 지역 계층 구조 (17개 광역시도)
- 민간 도메인 탐색 — 61개 기업 4,091개 도메인 접근성 분석
- 클라이언트 사이드 검색 — API 의존성 0, 순수 정적 사이트

기술: 순수 HTML/CSS/JS 단일 파일. React 없음, 번들러 없음, 프레임워크 없음.

---

```
$ datakorea stats

  DataKorea Statistics
  ─────────────────────────────
  Organizations:  1,354 (1,203 gov + 151 private)
  Datasets:       95,731
  Domains:        4,091
  Categories:     40
```

```
$ datakorea orgs --type=private --limit=5

  tech-naver       네이버        민간     10 ds   9 api   AI 61
  tech-kakao       카카오        민간      9 ds   9 api   AI 68
  tech-ncloud      네이버클라우드    민간      7 ds   7 api   AI 64
  fin-dunamu       두나무        민간      3 ds   3 api   AI 74
  game-nexon       넥슨         민간      3 ds   3 api   AI 66
```

## Why?

한국 공공데이터는 data.go.kr에 95,000개 이상, 민간 데이터는 각 기업 포털에 흩어져 있습니다.

**DataKorea는 이걸 하나로 모읍니다:**

- 공공 1,203개 기관 + 민간 151개 기업의 데이터셋, API, 접근 난이도
- AI 에이전트가 `--json`으로 바로 쿼리 가능
- 의존성 0개, Node.js 내장 모듈만 사용

## Install

```bash
npx datakorea stats          # 설치 없이 바로 실행
```

```bash
npm install datakorea        # 프로젝트에 추가
```

## CLI

```bash
datakorea stats                           # 전체 통계
datakorea search 기상청                    # 기관/데이터셋 검색
datakorea org tech-naver                  # 기관 상세 (데이터셋 + 도메인)
datakorea orgs --type=private --limit=10  # 민간 기업 목록
datakorea categories                      # 카테고리별 현황
datakorea domains tech-naver              # 네이버 데이터 도메인 (82개)
datakorea datasets dgk-6110000 --limit=20 # 서울시 데이터셋
```

### Output Formats

```bash
datakorea search 교통 --json      # JSON (AI/프로그램 친화)
datakorea orgs --tsv              # TSV (스프레드시트/파이프)
datakorea stats                   # Pretty print (기본)
```

AI 에이전트에서 사용 시 `--json` 플래그 추천.

## As a Library

```js
import { search, org, orgs, stats, categories, domains } from 'datakorea';

// 검색
const result = search('네이버');
console.log(result.orgs);    // [{id: 'tech-naver', name: '네이버', ...}]

// 기관 상세 (데이터셋 + 도메인 포함)
const naver = org('tech-naver');
console.log(naver.domains);  // [{domain_key: '네이버 검색', accessibility: 'api_open', ...}]

// 카테고리별 현황
const cats = categories();
console.log(cats[0]);        // {category: 'gov_admin', label: '공공행정', orgs: 225, ...}
```

### API

| Function | Description | Returns |
|---|---|---|
| `stats()` | 전체 통계 | `{total_organizations, total_datasets, ...}` |
| `orgs({type?, industry?, sort?, limit?})` | 기관 목록 | `Organization[]` |
| `org(id)` | 기관 상세 + 데이터셋 + 도메인 | `Organization & {datasets, domains}` |
| `search(query, {limit?})` | 기관/데이터셋 검색 | `{orgs, datasets, total}` |
| `datasets(orgId?, {limit?})` | 데이터셋 목록 | `Dataset[]` |
| `domains(orgId?)` | 민간 데이터 도메인 | `Domain[]` |
| `categories()` | 카테고리별 현황 | `Category[]` |
| `categoryLabel(key)` | 카테고리 영문→한글 | `string` |

## Data

| | Count | Description |
|---|---|---|
| Organizations | 1,354 | 공공 1,203 + 민간 151 |
| Datasets | 95,731 | data.go.kr 기반 공공데이터 |
| Data Domains | 4,091 | 민간 기업 데이터 도메인 (151사) |
| Categories | 40 | 공공행정, 의료, 교통, AI, 핀테크 등 |

### Schema

<details>
<summary>Organization</summary>

| Field | Type | Description |
|---|---|---|
| `id` | string | 고유 식별자 (e.g., `dgk-6110000`, `tech-naver`) |
| `name` | string | 기관명 |
| `org_type` | `gov` \| `private` \| `public_corp` | 유형 |
| `industry` | string | 산업 카테고리 (40종) |
| `total_datasets` | number | 보유 데이터셋 수 |
| `active_apis` | number | 활성 API 수 |
| `avg_ai_score` | number | AI 친화도 점수 (0-100) |
| `website` | string? | 웹사이트 |
| `total_domains` | number | 데이터 도메인 수 (민간) |

</details>

<details>
<summary>Dataset</summary>

| Field | Type | Description |
|---|---|---|
| `id` | number | PK |
| `org_id` | string | 소속 기관 ID |
| `name` | string | 데이터셋명 |
| `description` | string? | 설명 |
| `category` | string? | 분류 |
| `is_open` | boolean | 공개 여부 |
| `tags` | string[]? | 태그 |

</details>

<details>
<summary>Data Domain (Private)</summary>

| Field | Type | Description |
|---|---|---|
| `org_id` | string | 소속 기관 ID |
| `domain_key` | string | 도메인 식별자 |
| `domain_name` | string | 도메인명 |
| `accessibility` | `api_open` \| `api_paid` \| `partnership` \| `internal` | 접근 수준 |
| `description` | string | 상세 설명 |

</details>

## Use Cases

- **데이터 기자** — 특정 분야 공공데이터 보유 현황 빠르게 파악
- **AI 연구자** — 학습 데이터 후보 탐색, API 접근성 평가
- **스타트업** — 사업에 활용 가능한 데이터 소스 검색
- **AI 에이전트** — `--json` 출력으로 자동화 파이프라인에 통합
- **정책 분석** — 기관별/분야별 데이터 개방 수준 비교

## Data Sources

- **공공**: [data.go.kr](https://www.data.go.kr) (공공데이터포털), [AI Hub](https://aihub.or.kr)
- **민간**: 기업별 개발자 포털, API 문서, IR 자료 기반 리서치

## Contributing

데이터 오류 발견 시 [Issue](https://github.com/PKCrox/datakorea/issues)로 제보해주세요. PR도 환영합니다.

### 기관/도메인 추가

1. `data/organizations.json`에 기관 추가
2. `data/domains.json`에 도메인 추가 (민간 기업의 경우)
3. PR 제출

### 데이터 갱신 (maintainer)

```bash
SUPABASE_URL=... SUPABASE_SERVICE_KEY=... node scripts/dump-supabase.js
```

## License

[MIT](LICENSE)
