# lecture-deck 레이아웃 라이브러리 (8종)

재사용 슬라이드 패턴. 각 항목은 **복붙용 HTML 스니펫 + 1줄 용도 + 발표자 노트 위치**다.

> **스타일의 진실 원천은 `assets/template/theme.css`(WithGenie 검정+지니그린)다.** 아래 스니펫은 출발점일 뿐이다. 클래스를 쓰기 전에 그 클래스가 theme.css에 정의돼 있는지 확인하고, 없으면 theme.css에 있는 컴포넌트(`.title-slide`·`.case-card`·`.dd`·`.cap-grid`·`.pull-quote`·`.flow-step` 등)로 바꾼다. 실제 강의 예시는 현재 작업 프로젝트의 `lectures/*/index.html`이 있을 때만 참고한다.

## 사용 규칙

- **모든 슬라이드 `<section>`에는 반드시 `<aside class="notes">` 발표자 노트를 넣는다.** (reveal 발표자 뷰 `S` 키 + `script.md`와 내용 일치)
- 사실·수치·비교 문장 바로 뒤에는 `research.md`와 같은 ID의 `<a class="citation" data-source-id="R1" href="https://공개-출처" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer">[R1]</a>`를 붙인다.
- 출처 링크는 공개용으로 정리한 `https` URL만 쓴다. 토큰·세션·개인정보가 든 쿼리, 로컬 경로, 사설 호스트는 넣지 않는다.
- 슬라이드는 `index.html`의 `<div class="slides">` 안, 타이틀과 마무리 사이 주석 자리에 추가한다.
- 본문 슬라이드 제목은 `<h2>`. 강조 단어는 `<span class="accent">…</span>`.
- `{{...}}`는 채워 넣을 자리 표시자다. 실제 내용으로 교체한다.
- 분량 가이드: 한 슬라이드에 핵심 1개. 불릿은 3~5개를 넘기지 않는다.

### 시각 노이즈 룰 (anti-slop · `references/anti-slop.md`)

슬라이드 본문이 AI 글처럼 보이는 가장 흔한 원인은 셋이다. 다음을 어기지 않는다:

- **굵게(`<strong>`/`**`)는 한 문장에 1곳, 한 슬라이드에 3곳 이내.** 모든 핵심 단어를 굵게 칠하면 어느 것도 강조되지 않는다.
- **`<h2>` 헤더 안에 이모지 금지.** 이모지는 `capability-grid`의 `.cap-icon` 슬롯이나 마무리 자료 리스트 글머리에서만 허용.
- **줄표 `—` 본문 사용 금지.** 마침표·쉼표·콜론·괄호로 끊는다. (참고: `theme.css`의 `.title-block`처럼 디자인 컴포넌트 내부 장식은 예외)

### 이미지 슬롯 (gpt-image 출력 삽입)

복잡 다이어그램·표지·일반화 시연 모형은 `gpt-image` 스킬로 생성해 `assets/gen/<slide-id>.png`에 저장하고 다음 패턴으로 슬라이드에 넣는다 (자세한 호출 가이드는 `references/visuals-and-parallel.md`):

```html
<section>
  <h2>{{H2}}</h2>
  <div class="image-slot">
    <img src="assets/gen/{{slide-id}}.png" alt="{{한 줄 설명}}" />
  </div>
  <p class="muted center small">{{이미지 한 줄 캡션 (선택)}}</p>
  <aside class="notes">{{이 이미지를 어떻게 짚을지}}</aside>
</section>
```

배경 풀스크린은 reveal.js 자체 속성으로:
```html
<section data-background-image="assets/gen/cover.png" data-background-opacity="0.4">…</section>
```

**이미지가 정답이 아닌 경우**: 실제 도구 UI 시연(현실 스크린샷이 정답) / 정확한 표·매트릭스(HTML 표가 정답) / 단순 아이콘(이모지·SVG가 정답).

---

## 1. title-slide — 표지 (eyebrow + 제목 + 부제)
용도: 첫 장. 강의 제목과 한 줄 약속을 다크 그라데이션 위에 크게.
```html
<section class="title-slide" data-background-gradient="linear-gradient(160deg, #0A0A0A 0%, #05140b 100%)">
  <div class="title-block">
    <p class="eyebrow">{{분야 · 난이도}}</p>
    <h1>{{강의 제목}}</h1>
    <p class="subtitle">{{한 줄 약속/부제}}</p>
  </div>
  <p class="footer-meta">{{한 줄 메타 · 연도}}</p>
  <aside class="notes">{{인사 + 오늘 강의의 약속을 한 문장으로}}</aside>
</section>
```

## 2. big-statement — 큰 한마디 + 옆 불릿 ("오늘 만들/배울 것")
용도: 결과물·핵심 메시지를 크게 보여주고 옆에 근거 불릿.
```html
<section>
  <h2>{{H2 · 예: 오늘 만들 것}}</h2>
  <div class="card-row">
    <div class="hero-card">
      <p class="big">{{큰 한마디}}<br/><strong>{{강조구}}</strong></p>
    </div>
    <ul class="bullets">
      <li>{{포인트 1}}</li>
      <li>{{포인트 2}}</li>
      <li>{{포인트 3}}</li>
    </ul>
  </div>
  <aside class="notes">{{결과부터 보여주는 멘트. 가능하면 실물 시연}}</aside>
</section>
```

## 3. card-grid — 개념 카드 3열 나열
용도: 3~6개 개념·기능·항목을 나란히 비교/열거.
```html
<section>
  <h2>{{H2 · 예: 핵심 개념 3가지}}</h2>
  <div class="grid-3">
    <div class="v2-card"><strong>{{제목 1}}</strong>{{한 줄 설명}}</div>
    <div class="v2-card"><strong>{{제목 2}}</strong>{{한 줄 설명}}</div>
    <div class="v2-card"><strong>{{제목 3}}</strong>{{한 줄 설명}}</div>
  </div>
  <p class="muted center small">{{묶는 한마디 (선택)}}</p>
  <aside class="notes">{{각 카드를 한 문장씩 풀어 설명}}</aside>
</section>
```

## 4. step-list — 절차/체크리스트 (순서가 중요할 때)
용도: 따라 하기 단계, 준비물 체크. 순서가 있으면 `<ol class="big-list">`, 체크 느낌은 `check-list`.
```html
<section>
  <p class="eyebrow">{{STEP N · 소요시간 (선택)}}</p>
  <h2>{{H2 · 예: 한 방에 만들기}}</h2>
  <ol class="big-list">
    <li>{{1단계 — <strong>핵심 동작</strong>}}</li>
    <li>{{2단계}}</li>
    <li>{{3단계}}</li>
  </ol>
  <p class="muted center small">{{보충 한 줄 (선택)}}</p>
  <aside class="notes">{{시연 큐. 학생이 막히는 지점 미리 짚기}}</aside>
</section>
```
대안(체크리스트 톤):
```html
<ul class="check-list">
  <li><span class="chk">✓</span> {{확인 항목 1}}</li>
  <li><span class="chk">✓</span> {{확인 항목 2}}</li>
</ul>
```

## 5. capability-grid — 아이콘 카드 그리드 (*선택적 · "N가지" 열거형*)
용도: "X가지 능력/사례"처럼 많은 항목을 아이콘+라벨로 한눈에. 주제에 맞을 때만 사용.
> DreamCatcher의 Chrome 창 mockup은 이 베이스에서 **제거됨**. 여기서는 이모지 아이콘(`.cap-icon`) + 라벨(`.cap-text`)의 일반 카드만 쓴다. 진짜 mockup 화면이 꼭 필요하면 그 슬라이드에서 ad-hoc 마크업으로 직접 작성한다.
```html
<section>
  <h2 class="compact">{{주제}} <span class="accent">{{N가지}}</span></h2>
  <div class="cap-grid">
    <div class="cap"><span class="cap-icon">⏰</span><span class="cap-text">{{항목 1}}</span></div>
    <div class="cap"><span class="cap-icon">🔔</span><span class="cap-text">{{항목 2}}</span></div>
    <div class="cap"><span class="cap-icon">📥</span><span class="cap-text">{{항목 3}}</span></div>
    <div class="cap"><span class="cap-icon">💾</span><span class="cap-text">{{항목 4}}</span></div>
  </div>
  <p class="muted center small">{{묶는 한마디}}</p>
  <aside class="notes">{{카탈로그를 빠르게 훑으며 영감 주기}}</aside>
</section>
```

## 6. code-block — 코드/프롬프트 (highlight.js monokai)
용도: 코드, 명령, 붙여넣을 프롬프트를 보여줄 때. 평범한 `<pre><code class="language-…">`면 충분하다 — 덱이 로드한 highlight.js monokai가 다크 배경·문법색을 입힌다(별도 컨테이너 클래스 불필요).
```html
<section>
  <p class="eyebrow">{{라벨 (선택)}}</p>
  <h2 class="small-h2">{{이 코드로 무엇을 하나}}</h2>
  <pre><code class="language-javascript">{{코드/프롬프트 본문
여러 줄 가능}}</code></pre>
  <aside class="notes">{{핵심 줄만 짚기. 전부 읽지 말 것}}</aside>
</section>
```
터미널 출력은 `<pre><code class="language-bash">…</code></pre>`. 입력/출력을 시각적으로 더 구분하고 싶으면 그 슬라이드에서 ad-hoc 인라인 스타일(예: 좌측 그린 보더)을 직접 준다 — theme.css에 전용 클래스는 없다.

## 7. comparison — 비교 / before-after / 강조 인용
용도: 두 선택지 대비, 전/후, 또는 한 문장 강조. 2열은 `dual`, 문제→해결 표는 `trouble-table`, 한마디 강조는 `pull-quote`.
```html
<section>
  <h2>{{H2 · 예: 직접 vs AI}}</h2>
  <div class="dual">
    <div>
      <p class="eyebrow">{{왼쪽 라벨}}</p>
      <ul class="bullets"><li>{{포인트}}</li><li>{{포인트}}</li></ul>
    </div>
    <div>
      <p class="eyebrow accent">{{오른쪽 라벨}}</p>
      <ul class="bullets"><li>{{포인트}}</li><li>{{포인트}}</li></ul>
    </div>
  </div>
  <aside class="notes">{{왜 이 비교가 중요한지}}</aside>
</section>
```
변형 A — 문제/해결 표:
```html
<table class="trouble-table">
  <tr><td class="prob">{{흔한 문제}}</td><td>{{해결책 — <em>"이렇게 물어보세요"</em>}}</td></tr>
</table>
```
변형 B — 한 문장 강조: `<p class="pull-quote">{{핵심 한마디}}</p>`

## 8. closing — 마무리 + 다음 액션
용도: 마지막 장. 격려 + 이어서 할 일/자료 링크.
```html
<section class="title-slide" data-background-gradient="linear-gradient(160deg, #0A0A0A 0%, #05140b 100%)">
  <div class="title-block">
    <h1>{{수고 멘트 · 예: 수고하셨습니다 ✨}}</h1>
    <p class="subtitle">{{여운/한 줄 마무리}}</p>
  </div>
  <ul class="resources">
    <li>{{📂 자료/폴더}}</li>
    <li>{{📖 다시 볼 슬라이드/링크}}</li>
    <li>{{💬 Q&A}}</li>
  </ul>
  <aside class="notes">{{Q&A 유도. 현장 디버깅이 가장 강한 학습}}</aside>
</section>
```

## 9. references — 공개 출처 부록

용도: STUDENT와 INSTRUCTOR 양쪽에서 `[R#]`의 제목·발행처·날짜를 확인하는 부록. 한 장에 최대 6개를 넣고, ID 오름차순으로 여러 장에 나눈다. URL은 짧은 표시 텍스트로 두되 링크 대상은 검토된 공개 URL을 유지한다.

```html
<section>
  <p class="eyebrow">SOURCES · 1/2</p>
  <h2>출처</h2>
  <ol class="source-list">
    <li id="source-R1">
      <span class="source-id">[R1]</span>
      <span class="source-title">{{출처 제목}}</span><br />
      <span class="source-meta">{{발행처 · 발행/수정일 또는 날짜 미표기}}</span>
      <a class="citation" data-source-id="R1" href="{{검토된 공개 URL}}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer">[원문]</a>
    </li>
  </ol>
  <aside class="notes">출처를 다시 확인할 때는 같은 R 번호를 사용합니다.</aside>
</section>
```

본문에서 사용하는 단순 인용:

```html
<p>가격과 기능은 조사일 기준 공식 문서로 다시 확인합니다.<a class="citation" data-source-id="R1" href="{{검토된 공개 URL}}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer">[R1]</a></p>
```
