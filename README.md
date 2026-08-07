# lecture-deck

주제 하나로 **reveal.js 강의 덱 · 강사 대본 · 오프라인 배포본 · 편집 가능한 PPTX ·
NotebookLM 슬라이드**까지 만드는 Claude Code / Codex 스킬과, 그 스킬로 실제로 만든
강의 자료 세 건.

```
skills/lecture-deck/    ← 스킬 본체
lectures/               ← 스킬로 만든 강의 결과물 (146MB)
```

## 설치

한 줄이면 끝난다. 강의 자료는 딸려오지 않고 스킬(5MB)만 설치된다.

```bash
npx -y skills@1.5.20 add shway81-droid/lecture-deck --skill lecture-deck --global --agent claude-code --copy --yes
```

Codex 에도 함께 깔려면 `--agent codex` 를 덧붙인다. 특정 프로젝트에만 깔려면
`--global` 을 빼고 그 폴더에서 실행한다.

설치 후 점검한다. Windows 는 **Git Bash** 에서 실행한다(PowerShell 은 PATH 때문에
`bash`/`perl` 을 못 찾아 FAIL 로 나온다).

```bash
node ~/.claude/skills/lecture-deck/scripts/setup.mjs check
```

`lecture-deck setup: PASS` 가 나오면 된다. Claude Code 를 다시 열면 `/lecture-deck`
이 잡힌다.

### 설치 관리

```bash
npx -y skills@1.5.20 list                     # 설치된 스킬 확인
npx -y skills@1.5.20 update lecture-deck      # 최신으로 갱신
npx -y skills@1.5.20 remove lecture-deck      # 제거
```

## 쓰는 법

```
/lecture-deck 초등교사 대상 캔바 AI 활용법
```

인터뷰 3~4개 → 브리프·아웃라인 승인(게이트1) → 출처 검증 리서치 승인(게이트2) →
덱 조립 → 배포본·PPTX·NotebookLM 슬라이드까지 자동으로 나온다.

## 강의 자료

`lectures/` 는 참고용 완성 예시다. 설치할 때는 따라오지 않는다.

| 강의 | 장수 | 대상 |
|---|---|---|
| `notebooklm-수업-업무-자동화` | 46 | 교사 · NotebookLM |
| `claude-cowork-수업-업무-자동화` | 42 | 초등교사 · Claude Cowork |
| `canva-ai-수업자료-만들기` | 44 | 초등교사 · 캔바 AI |

각 폴더에 덱 소스(`index.html`), 브리프, 아웃라인, 출처 원장(`research.md`),
강사 대본(`script.md`), STUDENT·INSTRUCTOR 오프라인 패키지, PPTX 두 벌,
NotebookLM 판이 들어 있다. STUDENT·INSTRUCTOR 폴더는 인터넷 없이 동작한다
(`START-Windows.bat` 또는 `START-Mac.command` 더블클릭).

강의 자료까지 받으려면 저장소를 클론한다.

```bash
git clone https://github.com/shway81-droid/lecture-deck.git
```

## NotebookLM 은 20장을 넘으면 압축한다

덱을 통째로 NotebookLM 에 넣으면 페이지를 1:1 로 옮기지 않고 요약한다. 20장 아래로
쪼개 따로 만든 뒤 합치면 장수가 유지된다. 실측값이다.

| 넣은 것 | 나온 것 |
|---|---|
| 42페이지 통째로 | **21장** (압축) |
| 5 / 6 / 8 / 7 / 6 / 10 페이지로 분할 | 5 / 6 / 8 / 7 / 6 / 10 장 |
| 20 / 12 / 12 페이지로 분할 | 20 / 12 / 12 장 |

`skills/lecture-deck/assets/nlm2deck/` 가 이 분할과 합본을 자동으로 처리한다.
상세는 `skills/lecture-deck/references/notebooklm.md`.

## 의존성

| 단계 | 필요한 것 |
|---|---|
| 1~7 덱·패키징 | Node.js 22.20+, python3, bash, perl (Windows 는 Git Bash) |
| 8 PPTX | `pip install python-pptx beautifulsoup4 lxml Pillow numpy` |
| 9 NotebookLM | `notebooklm` CLI + 그 컴퓨터에서 직접 로그인, 헤드리스 크롬, `pymupdf` |

9단계 로그인은 컴퓨터마다 새로 해야 한다. 세션 파일은 저장소에 올리지 않는다.

## 라이선스와 출처

스킬 본체는 MIT. `skills/lecture-deck/LICENSE` 를 본다. 원저작자는
[NewTurn2017/lecture-deck](https://github.com/NewTurn2017/lecture-deck) 이고,
이 저장소는 NotebookLM 파이프라인(9단계)을 더한 포크다. 설계 출처는
`PROVENANCE.md`, 번들 자산(reveal.js·폰트·highlight.js·lucide) 라이선스는
`THIRD_PARTY_NOTICES.md` 를 본다.

`lectures/` 의 강의 자료는 저장소 소유자가 작성한 것이다. 인용 자료는 각 덱의 출처
슬라이드와 `research.md` 에 원문 링크로 표시돼 있다. `*-notebooklm.*` 파일의 이미지는
Google NotebookLM 이 생성한 것이다.
