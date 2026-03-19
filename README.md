# DataKorea — 한국 데이터 접근성 지도

한국에 **데이터 메타 카탈로그**가 없다.

data.go.kr은 공공만 다루고, 각 포털은 자기 데이터만 보여준다. 민간 기업이 어떤 데이터를 갖고 있는지, API로 열려 있는지, 접근하려면 뭘 해야 하는지 — 한눈에 보여주는 곳이 없다. "어떤 데이터가 존재하는지"부터 모르는 상태.

AI 에이전틱 시대에 데이터가 어디에 있고, 얼마나 열려 있는지 보여주는 지도가 필요했다. DataKorea는 그 첫 시도다.

**[pkcrox.github.io/datakorea](https://pkcrox.github.io/datakorea/)**

---

## 현재 상태 — 초기 버전

솔직히 아직 초기다. 데이터 수집은 꽤 진행됐지만, 스코어링 모델은 실험적이고, UI는 계속 바뀌고 있다.

| 지표 | 수치 | 비고 |
|---|---|---|
| 등록 기관 | **1,354** | 공공 1,203 + 민간 151 |
| 데이터셋 | **95,731** | data.go.kr 전수 크롤 기반 |
| 민간 데이터 도메인 | **4,091** | 61개 기업 딥리서치 완료 |
| 카테고리 | **22** | 공공행정, 의료, 교통 등 |

**아직 부족한 것들:**
- 스코어링은 v1 — 공식이 확정된 게 아니라 계속 실험 중
- 민간 151개 중 딥리서치 완료는 61개, 나머지는 얕음
- KOSIS/ECOS/DART 같은 핵심 통계 DB 미연동
- 데이터셋 개별 상세(설명, 스키마, 샘플)는 아직 없음
- 모바일 UX 개선 필요

기여/피드백 환영. 데이터 오류 발견 시 [Issue](https://github.com/PKCrox/datakorea/issues)로.

---

## 기획 의도

### 왜 "접근성 지도"인가

데이터 카탈로그는 이미 있다. data.go.kr이 그 역할을 한다. 하지만 "이 데이터에 실제로 접근할 수 있는가?"에 대한 답은 없다.

- API가 있는 건지, 파일 다운로드만 가능한 건지
- 인증이 필요한지, 승인이 필요한지
- 민간 기업은 어떤 데이터를 갖고 있고, 얼마나 열어놓았는지

DataKorea는 "존재 여부"가 아니라 **"접근 가능 여부"**를 매핑한다.

### 공공 vs 민간 — 다른 잣대

공공과 민간은 같은 기준으로 평가할 수 없다. 공공은 "데이터를 잘 열어놓았는가"가 본질이고, 민간은 "AI 시대에 데이터 개방에 안목이 있는가"가 본질이다.

**공공 스코어** — 데이터 품질 (100점):
- API Coverage 40% + Format Quality 25% + Richness 20% + Friction 15%
- L5 Data Platform → L4 API Provider → L3 File Publisher → L2 Portal

**민간 스코어** — 데이터 개방성 (100점):
- Openness 40% + DevEx 25% + Breadth 20% + Depth 15%
- L4 API Available → L3 Partnership → L2 Mostly Internal

### 정적 사이트인 이유

서버 없이 GitHub Pages에서 돌아간다. API 호출 0건. `organizations.json`(848KB)과 `domains.json`(1.5MB)만 로드하면 끝.

이유: 데이터가 실시간으로 변하지 않는다. 기관 목록, 데이터셋 수, 접근성 — 이건 분기에 한 번 바뀌는 수준. 서버를 붙이면 관리 부담만 늘고 가치는 없다. 정적 JSON 스냅샷이 정답이다.

---

## 대시보드 기능

- **스캐터플롯** — 접근 난이도 × 데이터 품질. 1,354개 점. 공공/민간/전체 토글. 호버 시 기관 상세 + 민간은 도메인 접근성 분포
- **섹터별 테이블** — 22개 카테고리, 접근 분포 막대, 지역 계층 구조 (17개 광역시도). 기관 클릭 시 상세 패널 (통계, 스코어 차원, 도메인 목록, 링크)
- **민간 도메인 탐색** — 151개 기업의 데이터 도메인. 공개/유료/제휴/내부 분류. 도메인별 설명, 규모, API 노트
- **검색** — 기관명, 영문명, 요약, 사업 내용으로 검색. 클라이언트 사이드, 서버 불필요
- **리더보드 + 티어 분포** — 공공/민간 Top 15, L5~L2 히스토그램 (스코어링 안정화 후 상단 이동 예정)

기술: 순수 HTML/CSS/JS 단일 파일. React 없음, 번들러 없음. Canvas 스캐터플롯 (DPR-aware). 도메인 데이터 lazy load.

---

## 데이터 수집 파이프라인

| Phase | 소스 | 산출물 |
|---|---|---|
| 1 | data.go.kr 메타 API 전수 크롤 | 1,117 공공기관, 95K 데이터셋 |
| 2 | AI Hub + K-문샷 기업 | 905 데이터셋, 11 기관 |
| 3 | 테크 기업 dev portal 조사 | 20 기관, 42 데이터셋 |
| 4 | 금융 섹터 조사 | 33 기관, 44 데이터셋 |
| 5 | 산업별 수직 조사 | 42 기관, 54 데이터셋 |
| 7 | API Health Check | 98% 성공 |
| 9 | 민간 딥리서치 (9차) | 61 기업, 4,091 도메인 |
| 10 | 듀얼트랙 스코어링 | 공공 1,203 + 민간 150 |

---

## npm 패키지 / CLI

```bash
npx datakorea stats          # 설치 없이 실행
npm install datakorea        # 프로젝트에 추가
```

```
$ datakorea stats

  DataKorea Statistics
  ─────────────────────────────
  Organizations:  1,354 (1,203 gov + 151 private)
  Datasets:       95,731
  Domains:        4,091
  Categories:     40
```

```bash
datakorea search 기상청              # 기관/데이터셋 검색
datakorea org tech-naver             # 기관 상세 (데이터셋 + 도메인)
datakorea orgs --type=private --json # AI 에이전트 친화 JSON 출력
datakorea domains tech-naver         # 네이버 데이터 도메인 (82개)
```

라이브러리로도 사용 가능:

```js
import { search, org, stats } from 'datakorea';
const naver = org('tech-naver');
console.log(naver.domains); // 82개 도메인
```

---

## 데이터 스키마

**organizations.json** — 기관별 레코드:
```
id, name, name_en, org_type(gov|private), industry, sub_industry,
website, dev_portal_url, summary, primary_business,
total_datasets, open_datasets, active_apis, avg_ai_score,
data_tier(L5|L4|L3|L2), score_dimensions, easiest_auth, total_domains
```

**domains.json** — 민간 도메인별 레코드:
```
id, org_id, domain_name, domain_key, description, estimated_scale,
significance, accessibility(api_open|api_paid|partnership|internal),
linked_dataset_id, public_api_note, barrier_note
```

---

## 라이선스

데이터 출처: [공공데이터포털](https://data.go.kr), 각 기관 공개 정보, 수동 리서치.

공공데이터는 [공공누리 제1유형](https://www.kogl.or.kr)에 따라 자유 이용 가능.
민간 기업 데이터는 각 기업의 공개 정보(개발자 포털, IR, 보도자료)를 기반으로 수집.
