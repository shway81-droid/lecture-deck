# 이 저장소에 대하여

`lecture-deck` 스킬 한 벌과, 그 스킬로 실제로 만든 강의 자료 세 건이 함께 들어 있다.

```
/                       ← 스킬 본체 (SKILL.md, assets/, references/, scripts/)
lectures/               ← 스킬로 만든 강의 결과물
```

## 다른 컴퓨터에서 스킬 쓰기

저장소 루트가 곧 스킬이라 스킬 폴더로 바로 클론하면 된다.

**Windows**

```bash
git clone https://github.com/shway81-droid/lecture-deck.git "%USERPROFILE%\.claude\skills\lecture-deck"
```

**macOS / Linux**

```bash
git clone https://github.com/shway81-droid/lecture-deck.git ~/.claude/skills/lecture-deck
```

설치 후 점검한다.

```bash
node ~/.claude/skills/lecture-deck/scripts/setup.mjs check
```

### 강의 자료 없이 스킬만 받기

`lectures/` 가 150MB 가까이 된다. 스킬만 필요하면 부분 체크아웃을 쓴다.

```bash
git clone --filter=blob:none --sparse https://github.com/shway81-droid/lecture-deck.git ~/.claude/skills/lecture-deck
cd ~/.claude/skills/lecture-deck
git sparse-checkout set --no-cone '/*' '!/lectures'
```

## 들어 있는 강의 자료

| 강의 | 장수 | 대상 |
|---|---|---|
| `lectures/notebooklm-수업-업무-자동화` | 46 | 교사 · NotebookLM |
| `lectures/claude-cowork-수업-업무-자동화` | 42 | 초등교사 · Claude Cowork |
| `lectures/canva-ai-수업자료-만들기` | 44 | 초등교사 · 캔바 AI |

강의마다 이런 파일이 들어 있다.

| 파일 | 설명 |
|---|---|
| `index.html` · `theme.css` · `serve.sh` | reveal.js 덱 소스 (리허설은 이걸로) |
| `brief.md` · `outline.md` | 한 페이지 브리프와 승인된 아웃라인 |
| `research.md` · `research-state.json` | 출처 원장과 C/O/R 검증 기록 |
| `script.md` | 슬라이드별 강사 대본 (발표자 노트와 동일 내용) |
| `*-STUDENT/` | 수강생 배포본. 노트 제거, 오프라인 자급자족 |
| `*-INSTRUCTOR/` | 강사 교안. 노트와 스피커뷰 포함 |
| `*.pptx` | 파워포인트 (글자 편집 가능). `-강사용` 은 노트 포함 |
| `*-notebooklm.pptx` · `.pdf` | NotebookLM 이 다시 디자인한 판 (이미지, 글자 편집 불가) |

STUDENT·INSTRUCTOR 폴더는 인터넷 없이 동작한다. 폴더를 열어 `START-Windows.bat`
또는 `START-Mac.command` 를 더블클릭하면 된다.

## 저장소에 없는 것

중간 산출물은 뺐다. 다시 만들 수 있고 용량만 차지한다.

- `notebooklm-chunks/` — 소스 PDF, 분할 덩어리, 노트북 ID
- 부분 합본 — 완성본으로 대체됨
- 코워크 덱을 통째로 넣어 21장으로 압축된 판 — 아래 표로 대신한다

## NotebookLM 은 20장을 넘으면 압축한다

덱을 통째로 NotebookLM 에 넣으면 페이지를 1:1 로 옮기지 않고 요약한다.
20장 아래로 쪼개 따로 만든 뒤 합치면 장수가 유지된다. 실측값이다.

| 넣은 것 | 나온 것 |
|---|---|
| 42페이지 통째로 | **21장** (압축) |
| 5 / 6 / 8 / 7 / 6 / 10 페이지로 분할 | 5 / 6 / 8 / 7 / 6 / 10 장 |
| 20 / 12 / 12 페이지로 분할 | 20 / 12 / 12 장 |

`assets/nlm2deck/` 가 이 분할과 합본을 자동으로 처리한다. 상세는
`references/notebooklm.md`.

## 출처와 라이선스

스킬 본체는 MIT 다. `LICENSE` 를 본다. 설계 출처와 독립 구현 범위는
`PROVENANCE.md`, 번들 자산(reveal.js·폰트·highlight.js·lucide)의 라이선스는
`THIRD_PARTY_NOTICES.md` 를 본다.

`lectures/` 의 강의 자료는 저장소 소유자가 작성한 것이다. 슬라이드에 인용된 자료는
각 덱의 출처 슬라이드와 `research.md` 에 원문 링크로 표시돼 있다.
`*-notebooklm.*` 파일의 이미지는 Google NotebookLM 이 생성한 것이다.

## 스킬을 고쳤을 때

이 저장소는 실제 스킬 폴더의 복사본이다. 스킬을 고쳤으면 저장소로 옮겨 커밋한다.

```bash
rsync -a --delete \
  --exclude 'lectures/' --exclude '.git/' --exclude 'node_modules/' \
  --exclude '__pycache__/' --exclude 'assets/html2pptx/cache/' \
  ~/.claude/skills/lecture-deck/ /path/to/lecture-deck-repo/
```

Windows 에서 `rsync` 가 없으면 `robocopy` 를 쓰거나, 저장소를 스킬 폴더에 직접
클론해 그 폴더 자체를 저장소로 삼는다.
