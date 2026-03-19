<p align="center">
  <h1 align="center">DataKorea</h1>
  <p align="center">
    한국 데이터 접근성 지도 — 1,354 기관 · 95K+ 데이터셋 · 4K+ 데이터 도메인
    <br/>
    <em>Korean data accessibility map for humans and AI agents.</em>
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
  <a href="https://github.com/PKCrox/datakorea/blob/main/LICENSE"><img src="https://img.shields.io/github/license/PKCrox/datakorea.svg?style=flat-square" alt="license"></a>
  <img src="https://img.shields.io/badge/dependencies-0-brightgreen.svg?style=flat-square" alt="zero dependencies">
</p>

---

## 왜 만들었나

AI 에이전트 시대가 왔다. 에이전트는 데이터를 먹고 산다. 그런데 한국의 데이터 인프라는 이 시대를 따라가고 있는가?

**불안하다.** 솔직히 비참하기까지 하다.

- data.go.kr에 95,000개 데이터셋이 있다지만, API로 접근 가능한 건 18%
- 민간 기업은 데이터를 갖고 있으면서도 대부분 닫아놓고 있다
- "한국 데이터가 어느 수준인지" 판단할 수 있는 전체 그림 자체가 없다

DataKorea는 이 판단을 하기 위해 만들었다. 공공 1,203개 기관, 민간 151개 기업의 데이터셋과 API를 전수 조사해서, **한국 데이터가 실제로 얼마나 열려 있고, 얼마나 접근 가능한지** 한눈에 보여준다.

그리고 이건 사람만을 위한 대시보드가 아니다. `--json` 플래그 하나로 AI 에이전트가 바로 쿼리할 수 있는 **AI-readable 한국 데이터 어그리게이터**이기도 하다.

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

### AI가 읽을 수 있는 한국 데이터 카탈로그

DataKorea의 목표는 단순한 대시보드가 아니다. AI 에이전트가 "한국에 교통 관련 공개 API가 뭐가 있어?"라고 물으면 바로 답할 수 있는 **구조화된 데이터 어그리게이터**다.

```bash
datakorea search 교통 --json | jq '.orgs[] | {name, active_apis, data_tier}'
```

사람은 대시보드로, 에이전트는 CLI/JSON으로 — 같은 데이터, 두 가지 인터페이스.

### "존재 여부"가 아니라 "접근 가능 여부"

데이터 카탈로그는 이미 있다. data.go.kr이 그 역할을 한다. 하지만 "이 데이터에 실제로 접근할 수 있는가?"에 대한 답은 없다.

- API가 있는 건지, 파일 다운로드만 가능한 건지
- 인증이 필요한지, 승인이 필요한지
- 민간 기업은 어떤 데이터를 갖고 있고, 얼마나 열어놓았는지

DataKorea는 **접근 가능 여부**를 매핑한다.

### 공공 vs 민간 — 다른 잣대

공공은 "데이터를 잘 열어놓았는가"가 본질. 민간은 "AI 시대에 데이터 개방에 안목이 있는가"가 본질.

**공공 스코어** — 데이터 품질 (100점):
- API Coverage 40% + Format Quality 25% + Richness 20% + Friction 15%
- L5 Data Platform → L4 API Provider → L3 File Publisher → L2 Portal

**민간 스코어** — 데이터 개방성 (100점):
- Openness 40% + DevEx 25% + Breadth 20% + Depth 15%
- L4 API Available → L3 Partnership → L2 Mostly Internal

---

## 대시보드

**[pkcrox.github.io/datakorea](https://pkcrox.github.io/datakorea/)** — 서버 없이 브라우저에서 바로.

- **스캐터플롯** — 접근 난이도 × 데이터 품질. 1,354개 점. 호버 시 기관 상세 + 도메인 분포
- **섹터별 테이블** — 22개 카테고리, 접근 분포 시각화, 지역 계층 구조 (17개 광역시도)
- **기관 상세** — 클릭 시 통계, 스코어 차원 바, 도메인 목록, 외부 링크
- **민간 도메인 탐색** — 151개 기업의 데이터 도메인. 공개/유료/제휴/내부 분류
- **검색** — 기관명, 영문명, 사업 내용. 클라이언트 사이드, API 의존성 0

기술: 순수 HTML/CSS/JS 단일 파일. Canvas 스캐터플롯. 도메인 lazy load. 정적 JSON만 로드.

---

## CLI

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

## As a Library

```js
import { search, org, stats } from 'datakorea';
const naver = org('tech-naver');
console.log(naver.domains); // 82개 도메인
```

---

## 수집 파이프라인

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

## 로드맵

- [ ] 스코어링 v2 — 모델 검증, 가중치 조정, 외부 피드백 반영
- [ ] 민간 딥리서치 확대 — 나머지 90개 기업
- [ ] KOSIS/ECOS/DART 통계 DB 연동
- [ ] 데이터셋 개별 상세 (스키마, 샘플, 갱신 주기)
- [ ] **해외 기관·기업 추가** — 같은 기준으로 미국(data.gov), EU(data.europa.eu), 일본, 글로벌 테크(Google, AWS, Meta) 매핑. 한국 데이터 인프라가 글로벌 대비 어느 수준인지 직접 비교
- [ ] AI 에이전트 전용 엔드포인트 (MCP 서버 / OpenAPI spec)

---

## 라이선스

[MIT](LICENSE)

데이터 출처: [공공데이터포털](https://data.go.kr), 각 기관 공개 정보, 수동 리서치.
공공데이터는 [공공누리 제1유형](https://www.kogl.or.kr)에 따라 자유 이용 가능.
민간 기업 데이터는 각 기업의 공개 정보(개발자 포털, IR, 보도자료)를 기반으로 수집.
