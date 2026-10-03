# PPTX 내보내기 (기본 산출물 · 8단계)

`index.html` 을 **글자를 직접 고칠 수 있는** PPTX 로 바꾼다. 슬라이드를 그림으로
굽는 방식이 아니라 제목·본문·카드·목록·표를 파워포인트 네이티브 도형과 텍스트
상자로 다시 그린다. 파워포인트에서 열어 문구를 바로 수정할 수 있다.

STUDENT·INSTRUCTOR 패키징(7단계)과 별개다. reveal 덱을 못 쓰는 자리
(교내 발표 PC, 파워포인트 제출 요구, 공동 편집)에 대비한 세 번째 배포 형식이다.

**9단계(`references/notebooklm.md`)와 헷갈리지 않는다.** 이쪽은 내 디자인 그대로
글자를 편집할 수 있게 옮긴다. 9단계는 NotebookLM 이 디자인을 새로 하고 결과가
이미지라 글자를 못 고친다. 사용자가 "PPT 로 만들어줘"라고만 하면 이 8단계다.

## 언제 만드나

**항상 만든다.** 요청을 기다리지 않는다. 7단계 패키징이 끝나면 바로 이어서 돌린다.

건너뛰는 경우는 둘뿐이다. 어느 쪽이든 **이유를 사용자에게 보고한다.**

- 파이썬 패키지가 없고 사용자가 설치를 거절했을 때
- 사용자가 "PPT는 필요 없다"고 명시했을 때

## 실행

노트가 확정된 뒤(7단계 직후) **두 벌을 만든다.**

```bash
python "$SKILL_DIR/assets/html2pptx/build.py" "lectures/<slug>/index.html" "lectures/<slug>/<slug>.pptx"
python "$SKILL_DIR/assets/html2pptx/build.py" "lectures/<slug>/index.html" "lectures/<slug>/<slug>-강사용.pptx" --notes
```

배포용(노트 없음)과 강사용(노트 포함)이다. STUDENT·INSTRUCTOR 패키지를 둘 다 만드는
것과 같은 이유다 — 강사 노트가 수강생 손에 넘어가면 안 된다.

두 번째 인자를 생략하면 덱 폴더 이름으로 그 폴더에 만든다.

| 옵션 | 뜻 |
|---|---|
| `--notes` | `<aside class="notes">` 를 파워포인트 발표자 노트에 넣는다 (강사 교안용) |
| `--theme <이름>` | 테마 강제 지정. 생략하면 덱의 `theme.css` 를 보고 고른다 |
| `--check` | 의존성과 해석된 폰트만 확인하고 끝낸다 |
| `--quiet` | 테마·폰트 보고 줄을 생략한다 |

## 테마는 theme.css 를 따라간다

PPTX 의 색·도형은 **덱 폴더의 `theme.css` 에서 자동으로 정해진다.** HTML 만 바꾸고
PPTX 는 옛 디자인으로 남는 어긋남을 막기 위한 장치다.

| 테마 | 감지 기준 | 모양 |
|---|---|---|
| `withgenie` | `--wg-bg` | 검정 배경 · 지니그린 · 헤어라인 카드 (기본값) |
| `warmpaper` | `--wp-paper` | 크림 종이 · 딥네이비 · 테라코타 · 흰 카드 + 그림자 |
| `coralreef` | `--cr-paper` | 크림 종이 · 코랄(#E8836B) · 청록(#3D9A8B) · 24pt 본문 · 흰 카드 + 그림자 |

실행할 때마다 어떤 테마로 갔는지 한 줄 찍는다. `theme.css` 를 못 읽으면 기본값으로
가되 그 사실을 함께 알린다. 조용히 넘어가지 않는다.

```
테마: warmpaper  (theme.css 감지)
```

**새 테마를 추가하려면** `assets/html2pptx/themes/` 에 모듈 하나를 더한다.
`COLORS`(색) · `ALPHA`(투명도) · `STYLE`(도형 선택) · `BACKGROUND` · `DETECT` 를 선언하면
레지스트리가 자동으로 잡는다. `STYLE` 이 정하는 것은 카드가 헤어라인이냐 그림자냐,
대비 2열이 좌측 바냐 상단 헤더냐, 강조어가 세리프 이탤릭이냐 볼드냐 같은 **도형 선택**이다.
색만으로는 테마가 바뀌지 않아서 나눠둔 값들이다.


## 의존성

`python-pptx` · `beautifulsoup4` · `lxml` · `Pillow` · `numpy`.
없으면 build.py 가 스택 대신 설치 명령을 알려주고 멈춘다. 먼저 확인하려면:

```bash
python "$SKILL_DIR/assets/html2pptx/build.py" --check
```

없으면 이 단계만 건너뛰고 이유를 사용자에게 알린다. 덱 자체는 영향 없다.

## 실행 후 반드시 확인할 것

build.py 가 찍는 경고 줄을 읽는다. 조용히 넘어가지 않는다.

| 경고 | 뜻과 대응 |
|---|---|
| `!! 여전히 넘침: S12=+80px` | 그 슬라이드는 최대 축소(0.72)로도 안 들어간다. 원본 슬라이드의 내용을 줄인다. |
| `!! 이미지 파일 없음` | `assets/gen/…` 경로가 틀렸다. PPTX 에는 자리표시 상자가 들어간다. |
| `전용 렌더러가 없어 글자만 살린 요소` | theme.css 에 없는 컨테이너다. 글자는 남지만 디자인은 빠진다. 해당 슬라이드를 theme.css 컴포넌트로 바꾸거나 그대로 둔다. |
| `축소 적용: S7=0.94` | 정상이다. reveal 의 shrink-to-fit 과 같다. |

그리고 **파워포인트로 실제로 열어** 복구 경고가 없는지, 밀린 글자가 없는지 본다.

## 폰트

덱은 Pretendard / Instrument Serif / JetBrains Mono 를 쓰지만 `assets/vendor/`
안의 폰트는 woff2 라 OS 에 설치되지 않는다. PPTX 는 설치된 폰트 이름으로만
지정할 수 있어서, 변환기가 실제 설치된 폰트를 찾아 가장 가까운 것을 고른다
(Pretendard → Noto Sans KR → 맑은 고딕 / Apple SD Gothic Neo 순).

해석 결과는 실행할 때마다 `폰트:` 줄에 찍힌다. 강제로 지정하려면:

```bash
LECTURE_DECK_PPTX_FONTS="sans=Pretendard;mono=D2Coding" python "$SKILL_DIR/assets/html2pptx/build.py" ...
```

## 옮겨지는 것과 안 옮겨지는 것

**옮겨진다** — `assets/layouts.md` 8종 + theme.css 컴포넌트 전부:
title-slide · divider-slide · card-row · card-grid · step-list(ol/check-list) ·
ladder · cap-grid · code · dual(카드형·라벨형 둘 다) · table · pull-quote ·
tl · byline · thesis-flow · stat-row · tier-grid · chip-row · case-card ·
brief-block · formula · kpi-line · image-slot · qr-grid · hero-img · concept ·
source-list · `data-background-image`(투명도 포함) · `[R#]` 인용 링크.

theme.css 에 없는 클래스(`grid-3` `v2-card` `big-list` `trouble-table`
`resources`)도 받는다. 아예 모르는 컨테이너는 안쪽을 풀어 **글자만이라도**
남기고 경고에 적는다.

**안 옮겨진다** — reveal 전용 기능: fragment 단계 등장, 슬라이드 전환 효과,
세로 스택(`<section>` 중첩), 배경의 은은한 글로우·점 격자는 배경 이미지 한 장으로
구워 넣는다(그 위 텍스트는 편집 가능).

## 커버리지 테스트

레이아웃을 새로 만들거나 변환기를 고쳤으면 반드시 돌린다. 덱의 글자가 하나라도
PPTX 에서 사라지면 FAIL 한다.

```bash
python "$SKILL_DIR/assets/html2pptx/tests/check_coverage.py" "$SKILL_DIR/assets/html2pptx/tests/fixture-deck/index.html"
```

픽스처(`tests/fixture-deck/index.html`)는 카탈로그 전 레이아웃 + 모르는 마크업
폴백까지 한 장씩 담고 있다. 새 레이아웃을 `assets/layouts.md` 에 추가했다면
픽스처에도 한 장 추가한다.

## 내부 구조

자세한 설계·주의점은 `assets/html2pptx/README.md`. 요약하면:

- 1280×720 디자인 = 96 DPI 에서 13.333×7.5 in. CSS px 를 그대로 좌표로 쓴다.
- 줄간격은 항상 절대값(Pt). 배수로 주면 폰트 기본 줄높이에 곱해져 겹친다.
- 하이퍼링크 색은 런이 아니라 테마의 `a:hlink` 에서 바꾼다.
- python-pptx 에 자동 레이아웃이 없어 블록 높이를 직접 재고 수직 중앙 정렬한다.
  넘치면 reveal 의 shrink-to-fit 처럼 균일 축소(하한 0.72)한다.
