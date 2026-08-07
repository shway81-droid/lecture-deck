#!/usr/bin/env bash
# =============================================================================
# package-deck.sh — 강의 소스 폴더를 "오프라인 자급자족 배포 패키지"로 빌드한다.
#
#   소스(저작용)        : index.html(CDN + <aside class="notes">) · theme.css · assets/
#   ──package-deck.sh──▶
#   STUDENT(수강생 배포본): 노트 0개, vendor/ 번들, 인터넷 없이 동작
#   INSTRUCTOR(강사 교안) : 노트 포함 + reveal notes 플러그인(스피커뷰) 오프라인
#
# 왜 별도 패키지인가:
#   · 저작은 CDN으로 빠르게(리허설은 소스 index.html). 배포는 오프라인이 안전(강의장 와이파이 없음).
#   · 수강생에겐 발표자 노트(대사)를 주지 않는다 → STUDENT는 노트를 도려낸다.
#   · 교안은 노트를 남기고 스피커뷰(S키)가 오프라인에서도 켜지게 notes 플러그인을 번들.
#
# 사용:
#   package-deck.sh <소스폴더> [옵션]
#     --name <slug>      패키지 이름 접두사 (기본: 소스폴더 이름)
#     --title "<제목>"   READ-ME 제목 (기본: 소스폴더 이름)
#     --student-only     STUDENT만 빌드 (교안 생략)
#     --out <dir>        패키지를 만들 위치 (기본: 소스폴더 안)
#
# 출력: <out>/<name>-STUDENT/ , <out>/<name>-INSTRUCTOR/
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENDOR_KIT="$SCRIPT_DIR/vendor"   # 스킬에 고정 번들된 오프라인 자산(폰트·reveal·lucide)

# ---- 인자 파싱 --------------------------------------------------------------
SRC=""; NAME=""; TITLE=""; OUT=""; STUDENT_ONLY=0
while [ $# -gt 0 ]; do
  case "$1" in
    --name)        NAME="$2"; shift 2;;
    --title)       TITLE="$2"; shift 2;;
    --out)         OUT="$2"; shift 2;;
    --student-only) STUDENT_ONLY=1; shift;;
    -h|--help)     sed -n '2,30p' "$0"; exit 0;;
    *)             SRC="$1"; shift;;
  esac
done

[ -n "$SRC" ] || { echo "✗ 소스 폴더를 지정하세요. 예: package-deck.sh lectures/my-topic" >&2; exit 1; }
SRC="${SRC%/}"
[ -f "$SRC/index.html" ] || { echo "✗ $SRC/index.html 가 없습니다." >&2; exit 1; }
[ -f "$SRC/theme.css" ]  || { echo "✗ $SRC/theme.css 가 없습니다." >&2; exit 1; }
[ -d "$VENDOR_KIT/reveal" ] || { echo "✗ vendor 번들이 없습니다: $VENDOR_KIT" >&2; exit 1; }

NAME="${NAME:-$(basename "$SRC")}"
TITLE="${TITLE:-$(basename "$SRC")}"
OUT="${OUT:-$SRC}"
case "$NAME" in
  ""|"."|".."|*/*|*\\*)
    echo "✗ --name은 경로가 아닌 파일명 한 조각이어야 합니다: $NAME" >&2
    exit 2
    ;;
esac
mkdir -p "$OUT"
OUT="$(cd "$OUT" && pwd -P)"

# ---- 공통 변환(저작 CDN → 번들 vendor 경로) ---------------------------------
# perl -0777: 파일 전체를 한 덩어리로 다뤄 멀티라인 <aside>·플러그인 목록까지 안전 치환.
rewrite_index_common() {   # stdin: index.html → stdout
  perl -0777 -pe '
    s{https?://cdn\.jsdelivr\.net/npm/reveal\.js\@[^/"]+/dist/}{vendor/reveal/}g;
    s{https?://cdn\.jsdelivr\.net/npm/reveal\.js\@[^/"]+/plugin/highlight/}{vendor/reveal/highlight/}g;
    s{https?://cdn\.jsdelivr\.net/npm/reveal\.js\@[^/"]+/plugin/notes/}{vendor/reveal/notes/}g;
    s{https?://(?:unpkg\.com|cdn\.jsdelivr\.net/npm)/lucide\@[^/"]+/dist/umd/lucide\.min\.js}{vendor/lucide.min.js}g;
    # 폰트는 theme.css @import로 들어오므로 head의 pretendard <link>는 제거(중복).
    # 줄 끝의 \r 을 함께 먹어야 한다. Windows 에서 만든 덱은 CRLF 라
    # [ \t]*\n 만 쓰면 이 치환이 조용히 실패하고, 패키지 검증이
    # "원격 런타임 자산이 남아 있습니다"로 떨어진다.
    s{^[ \t]*<link[^>]*pretendard[^>]*>[ \t\r]*\n}{}gmi;
  '
}

rewrite_theme() {          # stdin: theme.css → stdout. CDN 폰트 @import → 번들 vendor/fonts.
  perl -0777 -pe '
    s{\@import\s+url\(\s*["'\''"]https?://[^"'\'' )]*pretendard[^"'\'' )]*["'\''"]\s*\);}{\@import url("vendor/fonts/pretendard.css");}gi;
    s{\@import\s+url\(\s*["'\''"]https?://fonts\.googleapis\.com/css2\?family=Instrument\+Serif[^"'\'' )]*["'\''"]\s*\);}{\@import url("vendor/fonts/instrument-serif.css");}gi;
    s{\@import\s+url\(\s*["'\''"]https?://fonts\.googleapis\.com/css2\?family=JetBrains\+Mono[^"'\'' )]*["'\''"]\s*\);}{\@import url("vendor/fonts/jetbrains-mono.css");}gi;
  '
}

strip_student_internals() {
  perl -0777 -pe '
    s{<aside\b[^>]*>.*?</aside>}{}gsi;
    s{\s+data-notes\s*=\s*(?:"[^"]*"|'\''[^'\'']*'\'')}{}gsi;
    s{<script\b[^>]*src=["'\'']vendor/reveal/notes/notes\.js["'\''][^>]*>\s*</script>}{}gsi;
    s{\bRevealNotes\b}{}g;
    s{\[\s*,}{[}g; s{,\s*\]}{]}g; s{,\s*,}{,}g;
    s{<!--\s*ld:(?:slide|end)\b.*?-->}{}gsi;
    s{\s+data-claims?\s*=\s*(?:"[^"]*"|'\''[^'\'']*'\'')}{}gsi;
  '
}

fail() {
  echo "✗ $*" >&2
  return 1
}

contains_remote_runtime_asset() {
  local html="$1" css="$2"
  perl -0777 -ne '
    exit 0 if m{
      <(?:script|img|iframe|source|video|audio|input)\b[^>]*
        (?:src|srcset|poster)\s*=\s*["'\''](?:https?:)?//
      |
      <link\b[^>]*href\s*=\s*["'\''](?:https?:)?//
      |
      data-background-(?:image|video|iframe)\s*=\s*["'\''](?:https?:)?//
      |
      url\(\s*["'\'']?(?:https?:)?//
    }ix;
    exit 1;
  ' "$html" && return 0
  perl -0777 -ne '
    exit 0 if m{
      \@import\s+(?:url\(\s*)?["'\'']?(?:https?:)?//
      |
      url\(\s*["'\'']?(?:https?:)?//
    }ix;
    exit 1;
  ' "$css"
}

validate_variant() {
  local variant="$1" dir="$2" source_note_count packaged_note_count

  [ -s "$dir/index.html" ] || fail "$variant index.html이 비어 있습니다."
  [ -s "$dir/theme.css" ] || fail "$variant theme.css가 비어 있습니다."
  [ -f "$dir/vendor/reveal/reveal.js" ] || fail "$variant reveal.js 번들이 없습니다."

  if contains_remote_runtime_asset "$dir/index.html" "$dir/theme.css"; then
    fail "$variant 패키지에 원격 런타임 자산이 남아 있습니다."
  fi

  source_note_count=$( { grep -c 'class="notes"' "$SRC/index.html" || true; } | tr -d ' ')
  packaged_note_count=$( { grep -c 'class="notes"' "$dir/index.html" || true; } | tr -d ' ')

  if [ "$variant" = student ]; then
    [ "$packaged_note_count" -eq 0 ] || fail "STUDENT 패키지에 발표자 노트가 남아 있습니다."
    ! grep -Eqi '<aside\b|data-notes[[:space:]]*=|RevealNotes|reveal/notes/notes\.js|ld:(slide|end)\b|Claim C[0-9]+|data-claims?[[:space:]]*=' "$dir/index.html" ||
      fail "STUDENT 패키지에 강사용 노트 또는 내부 감사 표식이 남아 있습니다."
    [ ! -e "$dir/vendor/reveal/notes" ] ||
      fail "STUDENT 패키지에 notes 플러그인이 포함되었습니다."
    [ ! -e "$dir/script.md" ] && [ ! -e "$dir/research.md" ] && [ ! -e "$dir/citation-map.json" ] ||
      fail "STUDENT 패키지에 강사용 감사 파일이 포함되었습니다."
    if [ -f "$dir/SOURCES.html" ]; then
      ! grep -Eqi 'ld:(slide|end)\b|Claim C[0-9]+|data-claims?[[:space:]]*=' "$dir/SOURCES.html" ||
        fail "STUDENT SOURCES.html에 내부 claim 표식이 남아 있습니다."
      if contains_remote_runtime_asset "$dir/SOURCES.html" "$dir/theme.css"; then
        fail "STUDENT SOURCES.html에 원격 런타임 자산이 남아 있습니다."
      fi
    fi
  else
    [ "$source_note_count" -gt 0 ] || fail "소스 덱에 발표자 노트가 없습니다."
    [ "$packaged_note_count" -eq "$source_note_count" ] ||
      fail "INSTRUCTOR 발표자 노트 수가 소스와 다릅니다."
  fi
}

# ---- 런처 + READ-ME ---------------------------------------------------------
write_launchers() {        # $1=패키지 디렉터리  $2=READ-ME 본문 제목줄
  local d="$1" header="$2"
  cat > "$d/START-Mac.command" <<'EOF'
#!/bin/bash
# 더블클릭하면 기본 브라우저로 강의 자료가 열립니다.
cd "$(dirname "$0")"
open "index.html"
EOF
  chmod +x "$d/START-Mac.command"

  cat > "$d/START-Windows.bat" <<'EOF'
@echo off
rem 더블클릭하면 기본 브라우저로 강의 자료가 열립니다.
cd /d "%~dp0"
start "" "index.html"
EOF

  # <section 개수 = 대략의 슬라이드 수. ponytail: 세로(vertical) 스택이 있으면 과대 카운트되는 한계.
  local n; n=$(grep -c '<section' "$d/index.html" || echo "?")
  cat > "$d/READ-ME.txt" <<EOF
$header (슬라이드 ${n}장)
==============================================

■ 여는 법
  · macOS   : START-Mac.command  더블클릭
  · Windows : START-Windows.bat  더블클릭
  · 또는 index.html 더블클릭

■ 조작
  · 방향키 ← →  : 슬라이드 이동
  · F           : 전체화면
  · ESC / O     : 전체 슬라이드 한눈에 보기
$3
■ 특징
  · 인터넷 없이도 동작합니다 (폰트·이미지·라이브러리 모두 포함).
  · 폴더 전체를 그대로 두고 여세요. 파일을 따로 옮기면 깨질 수 있습니다.
EOF
}

# ---- 한 패키지 빌드 ---------------------------------------------------------
build_variant() {
  local variant="$1" suffix dir header speaker_line
  local stage_root="$2"
  if [ "$variant" = student ]; then
    suffix="STUDENT"; header="$TITLE — 수강생 배포본"; speaker_line=""
  else
    suffix="INSTRUCTOR"; header="$TITLE — 강사 교안 (스피커 노트 포함)"
    speaker_line="  · S           : 스피커뷰(발표자 노트 + 다음 슬라이드)
"
  fi
  dir="$stage_root/${NAME}-${suffix}"
  case "$dir" in
    "$stage_root"/*) ;;
    *) echo "✗ 임시 출력 경로를 벗어납니다: $dir" >&2; return 2;;
  esac
  echo "▸ $suffix 빌드 검증 중"
  mkdir -p "$dir"

  cp -R "$VENDOR_KIT/." "$dir/vendor/"
  find "$dir/vendor" -name '.DS_Store' -delete 2>/dev/null || true
  [ "$variant" != student ] || rm -rf -- "$dir/vendor/reveal/notes"

  # 생성 이미지 등 자산
  [ -d "$SRC/assets" ] && cp -R "$SRC/assets" "$dir/assets" && find "$dir/assets" -name '.DS_Store' -delete 2>/dev/null || true

  # theme.css: 폰트 @import를 번들 경로로 (← 수작업 패키지의 '폰트가 여전히 CDN' 버그를 자동 교정)
  rewrite_theme < "$SRC/theme.css" > "$dir/theme.css"

  # index.html
  if [ "$variant" = student ]; then
    rewrite_index_common < "$SRC/index.html" | strip_student_internals > "$dir/index.html"
  else
    rewrite_index_common < "$SRC/index.html" > "$dir/index.html"
  fi

  [ -f "$SRC/SOURCES.html" ] && cp "$SRC/SOURCES.html" "$dir/SOURCES.html"
  if [ "$variant" = instructor ]; then
    [ -f "$SRC/script.md" ] && cp "$SRC/script.md" "$dir/script.md"
    [ -f "$SRC/research.md" ] && cp "$SRC/research.md" "$dir/research.md"
    [ -f "$SRC/citation-map.json" ] && cp "$SRC/citation-map.json" "$dir/citation-map.json"
  fi

  write_launchers "$dir" "$header" "$speaker_line"
  validate_variant "$variant" "$dir"
  echo "  ✓ 검증 완료"
}

publish_variant() {
  local suffix="$1" stage_root="$2" staged final backup
  staged="$stage_root/${NAME}-${suffix}"
  final="$OUT/${NAME}-${suffix}"
  backup="$OUT/.${NAME}-${suffix}.backup.$$"

  [ -d "$staged" ] || fail "$suffix 임시 패키지가 없습니다."
  [ ! -e "$backup" ] || fail "$suffix 백업 경로가 이미 존재합니다: $backup"

  if [ -e "$final" ]; then
    mv "$final" "$backup"
  fi
  if mv "$staged" "$final"; then
    [ ! -e "$backup" ] || rm -rf -- "$backup"
    echo "▸ $suffix 게시 → $final"
  else
    [ ! -e "$backup" ] || mv "$backup" "$final"
    fail "$suffix 패키지를 게시하지 못했습니다. 기존 패키지는 복구했습니다."
  fi
}

STAGE_ROOT=$(mktemp -d "$OUT/.${NAME}.package.XXXXXX")
cleanup_stage() {
  case "${STAGE_ROOT:-}" in
    "$OUT"/."$NAME".package.*) [ ! -d "$STAGE_ROOT" ] || rm -rf -- "$STAGE_ROOT" ;;
  esac
}
trap cleanup_stage EXIT HUP INT TERM

build_variant student "$STAGE_ROOT"
[ "$STUDENT_ONLY" -eq 1 ] || build_variant instructor "$STAGE_ROOT"

publish_variant "STUDENT" "$STAGE_ROOT"
[ "$STUDENT_ONLY" -eq 1 ] || publish_variant "INSTRUCTOR" "$STAGE_ROOT"
echo "끝. 배포 전 각 폴더의 index.html을 한 번 열어 눈으로 확인하세요(폰트·이미지·아이콘)."
