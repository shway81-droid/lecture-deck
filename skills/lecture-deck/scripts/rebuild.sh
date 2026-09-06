#!/usr/bin/env bash
# 덱 소스를 고친 뒤 산출물을 한 번에 다시 만든다.
#
#   bash "$SKILL_DIR/scripts/rebuild.sh" lectures/<slug> [--title "강의 제목"] [--theme <이름>]
#
# 왜 필요한가
#   index.html 을 고쳐도 script.md·패키지·PPTX 는 따라오지 않는다. 손으로 하다 보면
#   빠뜨린다. 실제로 구분 슬라이드를 넣었을 때 노트 안 상호참조 두 개를 놓쳤다.
#   순서를 고정해 한 번에 돌린다.
#
# 하는 일
#   1) 클래스·노트 검사 (theme.css 에 없는 클래스가 있으면 멈춘다)
#   2) index.html 의 발표자 노트로 script.md 재생성
#   3) STUDENT · INSTRUCTOR 패키지
#   4) PPTX 2벌 (배포용 · 강사용)
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"
SKILL="$(dirname "$HERE")"

DECK=""; TITLE=""; THEME=""
while [ $# -gt 0 ]; do
  case "$1" in
    --title) TITLE="$2"; shift 2;;
    --theme) THEME="$2"; shift 2;;
    -*) echo "모르는 옵션: $1"; exit 2;;
    *) DECK="$1"; shift;;
  esac
done
[ -n "$DECK" ] || { echo "사용법: rebuild.sh <강의폴더> [--title \"제목\"] [--theme <이름>]"; exit 2; }
[ -f "$DECK/index.html" ] || { echo "index.html 이 없다: $DECK"; exit 2; }

SLUG="$(basename "$DECK")"
[ -n "$TITLE" ] || TITLE="$SLUG"
THEME_ARG=""; [ -n "$THEME" ] && THEME_ARG="--theme $THEME"

echo "== 1/4 클래스·노트 검사 =="
if ! node "$HERE/check-classes.mjs" "$DECK"; then
  echo "!! 미정의 클래스가 있다. 고친 뒤 다시 돌린다."
  exit 1
fi

echo "== 2/4 script.md 재생성 =="
PYTHONUTF8=1 python - "$DECK" <<'PY'
import re, sys, pathlib
deck = pathlib.Path(sys.argv[1])
html = (deck / "index.html").read_text(encoding="utf-8")
sp = deck / "script.md"
# 기존 머리말(첫 슬라이드 블록 전까지)은 손으로 쓴 것이라 보존한다.
# "---" 로 자르면 파트 구분선에 걸려 앞쪽 슬라이드까지 머리말로 딸려 오고,
# 다시 돌릴 때마다 블록이 불어난다. 반드시 "## 슬라이드" 를 기준으로 자른다.
head = ""
if sp.exists():
    old = sp.read_text(encoding="utf-8")
    i = old.find("\n## 슬라이드")
    head = old[:i] if i > 0 else old
    lines = head.rstrip().splitlines()
    while lines and (lines[-1].startswith("#") or lines[-1].strip() in ("", "---")):
        lines.pop()
    head = "\n".join(lines)
if not head.strip():
    head = f"# 강사 대본 — {deck.name}\n\n각 블록은 index.html 의 발표자 노트와 같습니다.\n"

buf = [head.rstrip() + "\n"]
for i, s in enumerate(re.split(r"(?=<section)", html)[1:], 1):
    m = re.search(r"<h1[^>]*>(.*?)</h1>|<h2[^>]*>(.*?)</h2>", s, re.S)
    title = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", (m.group(1) or m.group(2)))).strip() if m else "표지"
    n = re.search(r'<aside class="notes">(.*?)</aside>', s, re.S)
    note = re.sub(r"<[^>]+>", "", n.group(1)).replace("&amp;", "&").strip() if n else ""
    if 'divider-slide' in s.split(">")[0]:
        num = re.search(r'<p class="section-num">(.*?)</p>', s)
        label = num.group(1) if num else "PART"
        buf.append(f"\n---\n\n# {label} — {title}\n\n## 슬라이드 {i} — {title}\n{note}\n")
        continue
    buf.append(f"\n## 슬라이드 {i} — {title}\n{note}\n")
sp.write_text("".join(buf), encoding="utf-8")
print(f"  블록 {len(re.findall(r'^## 슬라이드', ''.join(buf), re.M))}개")
PY
[ $? -eq 0 ] || { echo "!! script.md 재생성 실패"; exit 1; }

echo "== 3/4 배포 패키지 =="
bash "$SKILL/assets/package-deck.sh" "$DECK" --title "$TITLE" 2>&1 | tail -3 || exit 1

echo "== 4/4 PPTX 2벌 =="
PYTHONUTF8=1 python "$SKILL/assets/html2pptx/build.py" "$DECK/index.html" "$DECK/$SLUG.pptx" $THEME_ARG 2>&1 | tail -4 || exit 1
PYTHONUTF8=1 python "$SKILL/assets/html2pptx/build.py" "$DECK/index.html" "$DECK/$SLUG-강사용.pptx" --notes $THEME_ARG 2>&1 | tail -2 || exit 1

echo "== 끝 =="
echo "  소스를 또 고치면 이 스크립트를 다시 돌린다."
