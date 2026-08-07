#!/usr/bin/env bash
# 덱 index.html → NotebookLM 이 디자인한 슬라이드(PPTX·PDF) 한 벌.
#
#   bash run.sh lectures/<slug>/index.html [--profile default] [--max 10] [--jobs 3]
#
# 흐름: PDF 로 굽기 → 20장 넘으면 파트 경계로 쪼개기 → 덩어리마다 NotebookLM
#       생성(병렬) → 순서대로 합치기.
#
# 중간에 끊겨도 다시 실행하면 이미 받은 덩어리는 건너뛴다.
set -u
export PYTHONIOENCODING=utf-8

# 이 스크립트를 죽이면 자식 워커도 같이 죽어야 한다.
# 안 그러면 워커가 고아로 살아남아 계속 노트북을 만들고 생성 할당량을 갉아먹는다.
# 실제로 옛 분할 계획으로 돌던 고아 워커들이 새 실행의 레이트 리밋을 유발하고,
# 계획에 없는 C4·C5 노트북과 파일을 남긴 적이 있다.
cleanup() {
  local kids
  kids=$(jobs -p 2>/dev/null)
  [ -n "$kids" ] && kill $kids 2>/dev/null
  exit 130
}
trap cleanup INT TERM HUP

HERE="$(cd "$(dirname "$0")" && pwd)"
HTML=""; PROFILE="${NOTEBOOKLM_PROFILE:-default}"; MAX=20; JOBS=3
while [ $# -gt 0 ]; do
  case "$1" in
    --profile) PROFILE="$2"; shift 2;;
    --max)     MAX="$2";     shift 2;;
    --jobs)    JOBS="$2";    shift 2;;
    *)         HTML="$1";    shift;;
  esac
done
[ -n "$HTML" ] || { echo "사용법: bash run.sh <index.html> [--profile P] [--max N] [--jobs N]"; exit 2; }
[ -f "$HTML" ] || { echo "index.html 이 없다: $HTML"; exit 1; }

DECK="$(cd "$(dirname "$HTML")" && pwd)"
SLUG="$(basename "$DECK")"
WORK="$DECK/notebooklm-chunks"

# ---- 0. 인증. `auth check`/`doctor` 는 세션이 만료돼도 통과한다고 답한 적이 있다.
#         실제 호출로 확인한다.
echo "== 0. 인증 확인 (프로필: $PROFILE) =="
# 한 번 실패했다고 로그인 문제로 단정하지 않는다. 네트워크 순간 장애로도 떨어지는데
# 그때 "로그인하세요"라고 하면 멀쩡한 세션을 다시 만들게 만든다. 세 번 걸어보고,
# 그래도 안 되면 **실제 오류 문구를 보여준 뒤** 인증 문제일 때만 로그인을 안내한다.
auth_ok=0
auth_out=""
for i in 1 2 3; do
  if auth_out=$(bash "$HERE/nlm.sh" -p "$PROFILE" list 2>&1); then
    auth_ok=1; echo "  OK"; break
  fi
  auth_out="${auth_out:-(출력 없음)}"
  [ "$i" -lt 3 ] && { echo "  확인 실패 ($i/3), 10초 후 재시도"; sleep 10; }
done
if [ "$auth_ok" -ne 1 ]; then
  echo "  마지막 오류:"
  printf '%s\n' "$auth_out" | sed 's/^/    /' | head -10
  if printf '%s' "$auth_out" | grep -Eqi 'auth|login|credential|unauthor|401|403|token|sign in'; then
    cat <<EOF

인증 문제로 보인다. 브라우저가 열리는 구글 OAuth 라 사용자가 직접 해야 한다:

    notebooklm -p $PROFILE login

끝나면 이 스크립트를 다시 실행한다.
EOF
  else
    echo
    echo "인증이 아니라 다른 원인으로 보인다. 위 오류를 확인하고 다시 실행한다."
  fi
  exit 1
fi
mkdir -p "$WORK"          # 인증이 통과한 뒤에만 작업 폴더를 만든다

# ---- 1. 렌더
echo "== 1. 덱을 PDF 로 굽기 =="
SRC="$WORK/source.pdf"
if [ -f "$SRC" ]; then
  echo "  이미 있음: $SRC"
else
  python "$HERE/render_pdf.py" "$HTML" "$SRC" || exit 1
fi

# ---- 2. 분할
echo "== 2. 분할 =="
if [ -f "$WORK/plan.tsv" ]; then
  echo "  계획 이미 있음:"; sed 's/^/    /' "$WORK/plan.tsv"
else
  python "$HERE/split_pdf.py" "$SRC" "$WORK" --html "$HTML" --max "$MAX" || exit 1
fi

# ---- 3. 덩어리별 생성.
# 동시 실행은 3개까지. 6개를 한꺼번에 띄웠더니 구글이 RATE_LIMITED 로 절반을 막았다.
# 시작 시각도 40초씩 어긋뜨린다.
echo "== 3. NotebookLM 슬라이드 생성 (동시 $JOBS 개) =="
i=0; running=0
while IFS=$'\t' read -r C N _ _; do
  [ -n "$C" ] || continue
  bash "$HERE/chunk_worker.sh" "$WORK" "$C" "$N" "$PROFILE" $((i * 40)) &
  i=$((i + 1)); running=$((running + 1))
  if [ "$running" -ge "$JOBS" ]; then wait -n 2>/dev/null || wait; running=$((running - 1)); fi
done < "$WORK/plan.tsv"
wait

# ---- 4. 합본
echo "== 4. 합본 =="
python "$HERE/merge_chunks.py" "$WORK" "$DECK/${SLUG}-notebooklm"
rc=$?
echo
echo "산출물: $DECK/${SLUG}-notebooklm.pptx / .pdf"
echo "덩어리 원본: $WORK/"
echo "!! 이 PPTX 는 슬라이드마다 이미지 한 장이라 파워포인트에서 글자를 고칠 수 없다."
echo "   글자를 고쳐야 하면 html2pptx 로 만든 PPTX 를 쓴다."
exit $rc
