# html2pptx

reveal.js 강의 덱(`index.html`)을 **텍스트가 편집되는** PPTX로 바꾼다.
슬라이드를 그림으로 굽지 않고, 제목·본문·카드·목록을 전부 파워포인트 네이티브
도형과 텍스트 상자로 다시 그린다.

에이전트용 사용 안내는 `references/pptx.md`. 이 문서는 구현 쪽 메모다.

## 실행

```bash
python build.py <index.html> [out.pptx] [--notes] [--check] [--quiet]
```

`out.pptx` 를 생략하면 덱 폴더 이름으로 그 폴더에 만든다.

```bash
python build.py ../../lectures/<slug>/index.html            # 배포용 (노트 없음)
python build.py ../../lectures/<slug>/index.html out.pptx --notes   # 강사용
python build.py --check                                     # 의존성·폰트만 확인
```

## 구성

| 파일 | 역할 |
|---|---|
| `preflight.py` | 파이썬 패키지 점검. 없으면 설치 명령을 주고 멈춘다 |
| `themes/` | 테마 모듈. 색·투명도·도형 선택·배경을 한 곳에 선언한다 |
| `theme.py` | 활성 테마 로더 + 치수 상수, px↔pt 환산, 폰트 자동 해석, 줄수 추정기 |
| `parse.py` | bs4 로 `<section>` → 블록 IR. 모르는 컨테이너는 `_generic()` 으로 풀어 글자를 살린다 |
| `render.py` | 블록별 `measure`(높이) / `draw`(그리기) 한 쌍 |
| `shapes.py` | python-pptx 저수준 헬퍼 (알파 채우기, 카드, 런, 표 스타일, 테마 링크색) |
| `background.py` | 시그니처 배경(글로우 2겹 + 점 격자)과 concept 스크림을 PNG 로 굽는다 |
| `build.py` | 조립 + 수직 중앙 정렬 + shrink-to-fit + 슬라이드 단위 레이아웃 |
| `tests/check_coverage.py` | 덱의 글자가 하나라도 사라지면 FAIL 하는 커버리지 테스트 |
| `tests/fixture-deck/` | 카탈로그 전 레이아웃 + 폴백까지 담은 테스트 덱 |
| `capture_html.py` | 검증용: 원본 HTML 을 Chrome 헤드리스로 슬라이드별 캡처 |
| `export_png.py` | 검증용: 만든 PPTX 를 PowerPoint COM 으로 슬라이드별 PNG 내보내기 |

## 새 테마를 추가할 때

`themes/` 에 모듈 하나를 더하면 레지스트리가 자동으로 잡는다. 선언할 것:

| 키 | 내용 |
|---|---|
| `NAME` · `DETECT` | 테마 이름, theme.css 에서 찾을 CSS 변수명 |
| `COLORS` | `BG TEXT SURFACE RULE_C INK ACCENT ACCENT2 MUTED FG2 FG_STRONG CODE_BG CODE_FG` |
| `ALPHA` | `RULE RULE_STRONG SURFACE_1 SURFACE_2 ACCENT_06 ACCENT_25` |
| `STYLE` | 도형 선택 (아래) |
| `BACKGROUND` · `SCRIM` | `background.py` 의 생성기 이름 |

`STYLE` 이 정하는 도형 선택 — **색만 바꿔서는 테마가 안 바뀌는 지점들**이다.

| 키 | 값 |
|---|---|
| `card` | `hairline` \| `shadow` |
| `case_card` | `brackets` \| `left-bar` |
| `dual` | `left-bar` \| `header-bar` |
| `rung_number` | `outline` \| `filled` |
| `chk` | `accent-fill` \| `accent2-fill` |
| `accent_run` | `serif-italic` \| `bold` |
| `stat_num` | `accent` \| `ink` |
| `h2_align` · `eyebrow_align` | `left` \| `center` |
| `eyebrow_prefix` | 아이브로우 앞에 붙일 문자열 (`""` 면 없음) |

**색 이름 세 가지를 헷갈리지 말 것.** `TEXT`(본문 글자) · `SURFACE`(카드 면) ·
`RULE_C`(테두리)는 검정 테마에서 우연히 같은 색이라 예전엔 `PAPER` 하나로 묶여 있었다.
밝은 테마에서는 셋이 전부 달라서, 묶어두면 흰 글자가 흰 카드에 찍힌다.

## 새 레이아웃을 추가할 때

1. `tests/fixture-deck/index.html` 에 그 레이아웃을 쓰는 슬라이드를 한 장 넣는다.
2. `tests/check_coverage.py` 를 돌려 **FAIL 하는 것을 먼저 확인한다.**
3. `parse.py` 에 블록 파서, `render.py` 에 `m_*` / `d_*` 한 쌍과 `MARGIN` 항목을
   더하고 `MEASURE` / `DRAW` 에 등록한다.
4. 커버리지 PASS 를 확인하고, `export_png.py` 로 실제 렌더를 눈으로 본다.

## 좌표 규칙

디자인 기준은 덱과 같은 1280×720 px. 96 DPI 에서 1 px = 1/96 in 이라
슬라이드는 정확히 13.333×7.5 in 이 되고, CSS 값을 그대로 좌표로 쓸 수 있다.
글자는 `pt = px × 0.75`.

## 폰트

`assets/vendor/` 의 폰트는 woff2 라 OS 에 설치되지 않고, PPTX 는 설치된 폰트
이름으로만 지정할 수 있다. 그래서 `theme.py` 가 플랫폼별 폰트 폴더를 훑어
실제 설치된 것 중 가장 가까운 것을 고른다 (Windows·macOS·Linux).

| 원본 | 후보 순서 |
|---|---|
| Pretendard Variable | Pretendard → Noto Sans KR → Apple SD Gothic Neo → 맑은 고딕 |
| Pretendard 900 | Pretendard Black → Noto Sans KR Black → (없으면 SANS + bold) |
| Instrument Serif italic | Instrument Serif → Georgia → Times New Roman |
| JetBrains Mono | JetBrains Mono → D2Coding → Consolas → Menlo |

`.accent` 는 한글이면 sans italic, 라틴이면 serif italic 으로 나눈다 —
Instrument Serif 에 한글 글리프가 없어 브라우저가 그렇게 떨어지기 때문이다.

강제 지정: `LECTURE_DECK_PPTX_FONTS="sans=Pretendard;mono=D2Coding"`

## 알아둘 것

- **줄간격은 반드시 절대값(Pt)으로 준다.** 배수로 주면 폰트 기본 줄높이에
  곱해져 CSS line-height 와 어긋나고, 측정값과 실제 조판이 벌어져 블록이 겹친다.
- **하이퍼링크 색은 테마에서 바꾼다.** 런의 solidFill 을 지정해도 PowerPoint 는
  테마의 `a:hlink` 로 칠한다. `set_theme_hyperlink_color()` 참고.
- `a:ea` / `a:cs` 는 python-pptx 가 모르는 자식이라 `a:latin` 바로 뒤에 직접
  끼워 넣어야 한다. 순서를 어기면 그 런의 서식이 통째로 무시된다.
- `export_png.py` 는 PowerPoint 를 COM 으로 띄운다. 이전 인스턴스가 남아 있으면
  첫 Export 가 OLE 오류로 튕기므로 재시도가 들어 있다.
