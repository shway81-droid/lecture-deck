[English](README.md) · [한국어](README.ko.md)

# Lecture Deck

> 주제 하나를 출처가 살아 있는 강의 덱, 강사 대본, 수강생 배포본까지 완성하는 Codex·Claude 공용 스킬입니다.

청중과 시간을 먼저 확인하고, 한 페이지 브리프와 슬라이드 아웃라인을 잠근 뒤, 축·리드·관찰·주장·출처를 영속적으로 검증하는 내장 리서치를 수행합니다. 이후 WithGenie 스타일 reveal.js 덱과 강사 대본을 만들고, 인터넷 없이 열리는 수강생용·강사용 패키지까지 한 번에 내보냅니다.

## 1분 설치

터미널에서 한 줄만 실행하세요:

```bash
npx -y github:NewTurn2017/lecture-deck
```

설치 화면에서 두 가지만 선택합니다:

1. **에이전트:** Codex + Claude Code, Codex만, Claude Code만
2. **범위:** 모든 프로젝트에서 쓰는 Global, 현재 프로젝트만 쓰는 Local

추천값은 **Codex + Claude Code / Global**입니다. 번호를 입력하는 방식이라 방향키 입력에 의존하지 않습니다.

CI나 설치 스크립트에서는 화면 없이 같은 선택을 바로 전달할 수 있습니다:

```bash
# Codex와 Claude Code에 전역 설치
npx -y github:NewTurn2017/lecture-deck --agent both --scope global --yes

# Codex에만 현재 프로젝트 로컬 설치
npx -y github:NewTurn2017/lecture-deck --agent codex --scope local --yes

# Claude Code에만 전역 설치
npx -y github:NewTurn2017/lecture-deck --agent claude --scope global --yes
```

선택 결과만 미리 확인하려면 끝에 `--dry-run`을 붙입니다. 전체 옵션은 아래 명령으로 확인할 수 있습니다:

```bash
npx -y github:NewTurn2017/lecture-deck --help
```

설치기는 런타임 npm 의존성 없이 Node.js 내장 모듈만 사용합니다. 내부 설치는 공개 [`skills`](https://github.com/vercel-labs/skills) CLI의 고정 버전 `1.5.20`에 인자 배열로 전달하며, 완료 후 선택한 에이전트의 실제 복사본에 필수 자산이 모두 있는지 확인합니다.

설치 후 Codex는 다시 시작하세요. Claude Code의 현재 세션에서 스킬이 보이지 않으면 새 세션을 시작하거나 `/reload-plugins`를 실행하세요.

### 고급: 원본 `skills` 명령 직접 실행

TUI 설치기를 거치지 않고 동일한 설치를 직접 실행할 수도 있습니다:

```bash
npx --yes skills@1.5.20 add NewTurn2017/lecture-deck --skill lecture-deck --global --agent codex --agent claude-code --copy --yes
```

## 설치 직후 점검

설치한 에이전트 경로에서 자체 점검을 실행합니다:

```bash
# Codex
node "$HOME/.agents/skills/lecture-deck/scripts/setup.mjs" check

# Claude Code
node "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills/lecture-deck/scripts/setup.mjs" check
```

점검 항목:

- `SKILL.md`, 템플릿, 내장 리서치 프로토콜·검증기, 패키징 스크립트, 오프라인 reveal.js·폰트 번들
- 필수 명령 `bash`, `perl`, `python3`
- 선택 명령 `codex`, `claude`, `gpt-image`
- Codex·Claude의 `lecture-deck` / `gpt-image` 설치 상태
- `OPENAI_API_KEY` 설정 여부

API 키는 값이 아니라 설정 여부만 출력합니다.

Local을 선택하면 Codex 복사본은 `.agents/skills`, Claude 복사본은 `.claude/skills`에 설치됩니다:

```bash
npx -y github:NewTurn2017/lecture-deck --agent both --scope local --yes
node ".agents/skills/lecture-deck/scripts/setup.mjs" check
node ".claude/skills/lecture-deck/scripts/setup.mjs" check
```

## 첫 사용

자연어로 요청하거나 스킬을 명시합니다:

```text
$lecture-deck으로 비개발자 대상 "AI 리서치 실전" 60분 강의를 만들어줘.
수강생 배포본과 강사용 대본까지 필요해.
```

대표 트리거:

- `강의 만들어줘`
- `강의 자료 만들어줘`
- `이 주제로 강의 덱 만들어줘`
- `수강생 배포본까지 만들어줘`
- `/lecture-deck <주제>`

## 만드는 순서

1. 주제, 청중, 시간, 목표를 3~4개 질문으로 확인합니다.
2. 한 페이지 브리프와 슬라이드 아웃라인을 제시합니다.
3. **게이트 1:** 사용자가 방향과 구성을 승인하고, `research-state.json.gates.gate1`에 브리프·아웃라인 해시를 기록합니다.
4. 빠른 확인·표준·심층 중 리서치 깊이를 정하고, 축·리드·C/O/R 상태를 남기며 `research.md`를 만듭니다.
5. **게이트 2:** 검증기가 준비 완료를 확인한 뒤 핵심 발견, 충돌, 수용할 공백, 강조 포인트를 승인받고 `research-state.json.gates.gate2`에 입력 해시를 기록합니다.
6. 덱, 발표자 노트, `script.md`를 같은 슬라이드 번호로 작성합니다.
7. 수강생용 STUDENT와 강사용 INSTRUCTOR 패키지를 생성하고 실제 화면을 확인합니다.

두 게이트 덕분에 마지막에 강의 전체를 다시 만드는 일을 줄입니다.

여기에 두 단계가 더 붙습니다. 둘 다 **항상** 만듭니다.

8. **PPTX 내보내기** — 덱을 **글자가 편집되는** 파워포인트 파일로 바꿉니다. 슬라이드를 그림으로 굽지 않고 텍스트 상자·도형으로 다시 그립니다. 배포용과 강사용 두 벌이 나옵니다.
9. **NotebookLM 슬라이드** — 덱 HTML을 소스로 NotebookLM에 넣어 **NotebookLM 디자인의** 슬라이드를 받습니다. 20장을 넘는 덱은 파트 경계로 자동 분할해 만든 뒤 순서대로 합칩니다(통째로 넣으면 NotebookLM이 압축해서 장수가 줄어듭니다). 결과는 슬라이드마다 이미지 한 장이라 **글자 수정은 안 됩니다** — 그래서 8단계 PPTX와 함께 씁니다.

9단계는 구글 로그인이 필요하고 40~120분 걸립니다. 로그인이 안 돼 있거나 의존성이 없으면 그 단계만 건너뛰고 이유를 알려줍니다. 나머지 산출물은 영향받지 않습니다.

## 산출물

스킬을 호출한 프로젝트 아래에 생성합니다:

```text
lectures/<주제-slug>/
├── index.html              # 저작·리허설용 reveal.js 덱
├── theme.css               # WithGenie 테마
├── brief.md                # 한 페이지 브리프
├── outline.md              # 승인된 슬라이드 순서·레이아웃·목적
├── research-state.json     # 축·리드·C/O/R·검증·게이트 영수증
├── research.md             # 주장별 출처 원장
├── script.md               # 슬라이드별 강사 대본
├── serve.sh                # 로컬 미리보기
├── assets/gen/             # 선택 생성 이미지
├── <slug>-STUDENT/         # 노트 제거, 오프라인 배포본
├── <slug>-INSTRUCTOR/      # 노트·스피커뷰 포함, 오프라인 교안
├── <slug>.pptx             # 글자 편집 가능한 파워포인트 (노트 없음)
├── <slug>-강사용.pptx       # 같은 것, 발표자 노트 포함
├── <slug>-notebooklm.pptx  # NotebookLM 디자인 (이미지)
├── <slug>-notebooklm.pdf   # 같은 것의 PDF
└── notebooklm-chunks/      # 소스 PDF·분할 계획·덩어리별 원본
```

STUDENT는 발표자 노트를 제거합니다. INSTRUCTOR는 노트와 스피커뷰를 유지합니다. 두 패키지 모두 reveal.js, 폰트, 코드 하이라이트, 아이콘을 폴더 안에 포함합니다.

## 리서치가 달라진 점

리서치는 이 스킬 안에 들어 있으며 특정 외부 리서치·오케스트레이션 제품을 요구하지 않습니다. Codex나 Claude가 현재 사용할 수 있는 검색·브라우저·문서·MCP·로컬 읽기·실행 도구를 협상해 사용합니다. 순차 실행이 이식성 기준이고, 병렬 에이전트와 팀은 선택 가속 기능입니다.

- 법령, 표준, 정부, 공식 제품 문서, 원 논문, 원 데이터를 먼저 봅니다.
- 가격·기능·버전·법·정책·일정은 조사 당일 공식 출처로 다시 확인합니다.
- 실행 전에 모든 조사 축과 시도를 기록해 동시 실행 한도나 대화 압축 때문에 범위가 사라지지 않게 합니다.
- 새로 발견한 리드를 재귀적으로 확인하고 반대 근거를 찾으며, 모든 공백을 닫거나 공개합니다.
- 주장(`C`), 관찰(`O`), 출처(`R`) 연결을 `research-state.json`에 기록합니다.
- 출처가 충돌하면 한쪽을 지우지 않고 기준 차이와 불확실성을 남깁니다.
- 출처 집합이 수렴한 뒤 재현 가능한 순서로 `R` ID를 배정하고 `research.md`, 슬라이드 각주, 강사 대본에서 같은 `[R1]`을 사용합니다.
- 다면적 심층 조사는 최소 3개 축과 2회의 확장 감사를 기록합니다.
- 번들 검증기가 준비 완료를 확인한 뒤에만 게이트 2를 제시합니다.
- 검색이나 원문 접근이 막히면 가능한 범위와 미검증 항목을 먼저 밝힙니다.

로드된 스킬의 실제 경로를 기준으로 세션을 초기화하고 검증합니다. 여기서 `SKILL_DIR`은 호스트가 실제로 읽은 `SKILL.md`가 들어 있는 폴더이며 홈 경로를 추측하지 않습니다:

```bash
node "$SKILL_DIR/scripts/research-session.mjs" init \
  --deck "lectures/<slug>" \
  --session-id "<id>" \
  --topic "<주제>" \
  --axes '<JSON 배열>'

node "$SKILL_DIR/scripts/research-session.mjs" validate \
  --state "lectures/<slug>/research-state.json" \
  --deck "lectures/<slug>" \
  --json

# 검증된 게이트 2 요약을 사용자가 명시적으로 승인한 뒤에만 실행
node "$SKILL_DIR/scripts/research-session.mjs" approve-gate2 \
  --state "lectures/<slug>/research-state.json" \
  --deck "lectures/<slug>" \
  --json
```

검색 결과, 웹페이지, 문서, 저장소 내용은 신뢰하지 않은 증거이며 실행 지시가 아닙니다. 출처가 시키는 명령을 실행하거나 인증·접근 제한을 우회하거나 자격 증명을 수집하지 않습니다.

## 선택 설치: gpt-image

이미지 생성 없이도 강의 덱과 배포본은 완성됩니다. 표지·복잡한 다이어그램·일반화 UI 모형이 필요할 때만 설치하세요:

```bash
node "$HOME/.agents/skills/lecture-deck/scripts/setup.mjs" install-gpt-image --target all --yes
```

Claude에만 lecture-deck을 설치했다면 Claude 경로의 `setup.mjs`를 실행하면 됩니다. 이 명령은 공개 [`gpt-image`](https://github.com/wuyoscar/GPT-Image2-Skill) 스킬을 선택한 에이전트에 설치합니다. `skills@1.5.20`과 `gpt-image` 태그 `v0.2.0`을 고정하고, 설치 결과가 SHA-256 `d145ce52c6eed794f034c093dcb593e2f7f49cc81c1d0cd5b076d130cf80bd72`와 일치하는지 확인합니다. 하위 설치 프로세스에는 경로·런타임 허용 목록만 전달하며 API 키나 GitHub 토큰은 넘기지 않습니다. 실제 이미지 API 호출에만 `OPENAI_API_KEY`가 필요하고, 강의 생성과 오프라인 패키징에는 필요하지 않습니다.

사용자 전역이 아니라 현재 프로젝트에만 설치:

```bash
node scripts/setup.mjs install-gpt-image --target all --scope project --project-dir "$PWD" --yes
```

`gpt-image`는 외부 API를 호출하고 파일을 쓸 수 있는 제3자 코드입니다. 선택 설치 전에 링크된 소스와 `skills` CLI의 보안 평가를 확인하세요.

실제 설치 전 실행 명령만 확인:

```bash
node scripts/setup.mjs install-gpt-image --target all --yes --dry-run
```

이미지 API 호출에만 `OPENAI_API_KEY`가 필요합니다. 강의 생성, 리서치, 오프라인 패키징에는 필요하지 않습니다.

## 요구 사항

| 항목 | 용도 | 필수 여부 |
|---|---|---|
| Node.js 22.20+와 `npx` | 설치·자체 점검·리서치 상태 검증 | 설치/점검/리서치 시 |
| `bash` + `perl` | STUDENT·INSTRUCTOR 패키징 | 패키징 시 |
| `python3` | 로컬 미리보기 서버 | 미리보기 시 |
| 검색·브라우저 도구 | 출처 기반 리서치 | 리서치 시 |
| `gpt-image` + `OPENAI_API_KEY` | 생성 이미지 | 선택 |
| 호스트 병렬 에이전트 | 독립 리서치·대형 덱 분산 | 선택 |

Windows에서는 패키징 단계에 WSL 또는 `bash`·`perl`이 있는 환경이 필요합니다. 최종 배포본에는 Windows 더블클릭 런처가 포함됩니다.

`gpt-image`는 선택 기능이며 증거가 아닙니다. 사실을 담은 차트·지도·비교표·다이어그램은 검증된 C/O/R에서 만들고 출처 ID와 기준일을 표시합니다.

## 출처와 독립 구현

리서치 절차는 공개된 연구 검증 개념을 참고해 클린룸 방식으로 독립 구현했습니다. LazyCodex, OMO 또는 다른 오케스트레이션 런타임을 설치하거나 실행할 필요가 없으며, 제휴나 보증을 뜻하지 않습니다.

검토한 설계 경계는 [PROVENANCE.md](PROVENANCE.md), 감사 표시는 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)를 확인하세요.

## 업데이트와 제거

```bash
# 업데이트
npx --yes skills@1.5.20 update lecture-deck --global --yes

# Codex와 Claude에서 제거
npx --yes skills@1.5.20 remove lecture-deck --global --agent codex --agent claude-code --yes
```

## 개발·검증

```bash
npm test
npm run check
```

`npm test`는 외부 테스트 프레임워크 없이 Node 내장 테스트 러너만 사용합니다. 자체 점검 계약, 선택 설치 명령, 오프라인 자산 치환, 수강생 노트 제거, 출력 경로 이탈 방지를 검증합니다.

## 라이선스

[MIT](LICENSE)
