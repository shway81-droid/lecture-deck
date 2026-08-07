#!/usr/bin/env bash
# 덩어리 하나를 끝까지 책임진다: 노트북 생성 → 소스 추가 → 인덱싱 대기 →
# 슬라이드 생성 → 완료 대기 → PPTX·PDF 다운로드.
#
#   bash chunk_worker.sh <chunk_dir> <name> <pages> <profile> [start_delay_sec]
#
# 여러 개를 동시에 띄워 병렬로 돌린다. 재실행해도 안전하다 —
# 산출물이 이미 있으면 건너뛰고, 노트북 ID 는 파일에 남겨 재사용한다.
set -u
export PYTHONIOENCODING=utf-8

HERE="$(cd "$(dirname "$0")" && pwd)"
R="$HERE/nlm.sh"
P="$HERE/pick.py"

DIR="$1"; C="$2"; N="$3"; PROFILE="$4"; DELAY="${5:-0}"
NBFILE="$DIR/$C.notebook"

sleep "$DELAY"

if [ -f "$DIR/$C.pptx" ] && [ -f "$DIR/$C.pdf.out" ]; then
  echo "[$C] 이미 있음, 건너뜀"; exit 0
fi
echo "[$C] 시작 (입력 ${N}페이지, 지연 ${DELAY}s)"

# ---- 1. 덩어리 전용 노트북. 한 노트북에 여러 덩어리를 넣으면 결과가 섞인다.
if [ -s "$NBFILE" ]; then
  NB=$(cat "$NBFILE")
  echo "[$C] 기존 노트북 ${NB:0:8} 재사용"
else
  NB=$(bash "$R" -p "$PROFILE" create "덱-$C" --json 2>&1 | python "$P" notebook.id)
  if [ -z "$NB" ]; then echo "[$C] 노트북 생성 실패"; exit 1; fi
  printf '%s' "$NB" > "$NBFILE"
  echo "[$C] 노트북 ${NB:0:8}"

  # 소스 추가.
  #
  # CLI 의 출력이나 종료 코드로 성공을 판정하지 않는다. 두 번 데였다:
  #  1) 없는 명령(add_file)을 쓰면서 stdout/stderr 를 /dev/null 로 버려, 소스가
  #     하나도 안 들어간 채 15분간 인덱싱을 기다렸다.
  #  2) 이름을 고친 뒤에는, 업로드에 성공하고도 asyncio 트레이스백
  #     ("AssertionError: Data should not be empty")을 뱉으며 0 이 아닌 코드를
  #     돌려줘서, 멀쩡히 올라간 소스를 실패로 판정하고 노트북을 버렸다.
  #
  # 그래서 **API 에 직접 물어** 소스가 실제로 존재하는지로 판정한다.
  add_out=$(bash "$R" -p "$PROFILE" source add "$DIR/$C.pdf" --notebook "$NB" 2>&1)
  landed=0
  for i in $(seq 1 10); do
    st=$(bash "$R" -p "$PROFILE" source list --notebook "$NB" --json 2>/dev/null | python "$P" sources.0.status)
    [ -n "$st" ] && { landed=1; echo "[$C] 소스 확인됨 (상태 $st)"; break; }
    sleep 6
  done
  if [ "$landed" -ne 1 ]; then
    echo "[$C] 소스 추가 실패. add 명령 출력:"
    printf '%s\n' "$add_out" | sed 's/^/    /' | head -12
    rm -f "$NBFILE"          # 반쪽 노트북을 재사용하지 않게 지운다
    exit 1
  fi
fi

# ---- 2. 인덱싱 대기
# 20페이지짜리는 15분을 넘길 때가 있다. 90회 x 20초 = 30분까지 기다린다.
# 업로드가 중간에 끊기면 소스가 preparing 에서 영영 안 나오므로, 타임아웃 시
# 소스를 지우고 다시 올리라고 안내한다.
st=""
for i in $(seq 1 90); do
  st=$(bash "$R" -p "$PROFILE" source list --notebook "$NB" --json 2>&1 | python "$P" sources.0.status)
  [ "$st" = "ready" ] && break
  [ "$st" = "error" ] && { echo "[$C] 소스 처리 실패"; exit 1; }
  sleep 20
done
if [ "$st" != "ready" ]; then
  echo "[$C] 인덱싱 타임아웃 (마지막 ${st:-호출실패})"
  echo "[$C] preparing 에서 멈춘 것이면 업로드가 잘린 것이다. 소스를 지우고 다시 올린다:"
  echo "     notebooklm -p $PROFILE source list --notebook $NB"
  echo "     notebooklm -p $PROFILE source delete <소스ID> --notebook $NB -y"
  echo "     notebooklm -p $PROFILE source add \"$DIR/$C.pdf\" --notebook $NB"
  exit 1
fi
echo "[$C] 소스 ready"

# ---- 3. 생성 요청.
# 지시문이 1:1 을 명시해야 한다. 없으면 5페이지짜리도 3장으로 줄여 놓는다.
PROMPT="소스 PDF 는 이미 완성된 발표 슬라이드 ${N}장이다. 각 페이지를 슬라이드 한 장씩 그대로 옮겨라. 정확히 ${N}장을 만들고, 여러 페이지를 하나로 합치거나 줄이지 마라. 페이지 순서와 제목, 문구를 그대로 유지하라."

# 슬라이드 생성은 구글이 계정 단위로 레이트 리밋을 건다(RATE_LIMITED).
# 병렬로 몰면 바로 걸리고, 짧게 3번 재시도하고 포기하면 할당량이 열리기 전에 끝난다.
# 5분 간격 24회 = 최대 2시간 동안 문을 두드린다.
#
# **레이트 리밋인지 확인하고 기다린다.** 예전에는 task_id 를 못 뽑으면 무조건
# "레이트 리밋"이라고 찍고 2시간을 기다렸다. 인자 오류나 인증 만료여도 똑같이
# 표시돼서, 5분마다 같은 오류를 24번 반복하고서야 포기했다.
# 이제 응답에 RATE_LIMITED 가 있을 때만 기다리고, 다른 오류는 즉시 중단한다.
AID=""
for attempt in $(seq 1 24); do
  gen_out=$(bash "$R" -p "$PROFILE" generate slide-deck "$PROMPT" \
            --notebook "$NB" --format detailed --language ko --retry 3 --json 2>&1)
  AID=$(printf '%s' "$gen_out" | python "$P" task_id)
  [ -n "$AID" ] && { echo "[$C] 요청 통과 (시도 $attempt) task ${AID:0:8}"; break; }

  if printf '%s' "$gen_out" | grep -q 'RATE_LIMITED'; then
    echo "[$C] 레이트 리밋 대기 (시도 $attempt/24)"
    sleep 300
  else
    echo "[$C] 생성 요청 실패 — 레이트 리밋이 아니다. 기다려도 안 풀린다:"
    printf '%s\n' "$gen_out" | sed 's/^/    /' | head -12
    exit 1
  fi
done
[ -n "$AID" ] || { echo "[$C] 2시간 동안 할당량이 열리지 않음 — 포기"; exit 1; }

# ---- 4. 완료 대기.
# `artifact wait` 는 쓰지 않는다. RPC 오류로 0.1초 만에 조용히 반환해서
# 아직 만들어지지도 않은 산출물을 받으러 가게 만든 적이 있다. 직접 폴링한다.
st=""
for i in $(seq 1 80); do
  st=$(bash "$R" -p "$PROFILE" artifact list --notebook "$NB" --json 2>&1 | python "$P" artifacts.0.status)
  [ "$st" = "completed" ] && break
  sleep 25
done
[ "$st" = "completed" ] || { echo "[$C] 생성 타임아웃 (마지막 ${st:-호출실패})"; exit 1; }

# ---- 5. 다운로드. 입력 PDF 와 이름이 겹치지 않게 `.pdf.out` 으로 받는다.
bash "$R" -p "$PROFILE" download slide-deck "$DIR/$C.pdf.out" -a "$AID" -n "$NB" >/dev/null 2>&1
bash "$R" -p "$PROFILE" download slide-deck "$DIR/$C.pptx" --format pptx -a "$AID" -n "$NB" >/dev/null 2>&1

if [ -f "$DIR/$C.pdf.out" ] && [ -f "$DIR/$C.pptx" ]; then
  # 장수 확인은 별도 스크립트로. 실패했을 때 "압축됐다"고 단정하지 않는다.
  # 예전에 카운트가 실패해 "?장"이 나왔는데도 압축 경고를 띄워 헛다리를 짚었다.
  if got=$(python "$HERE/pagecount.py" "$DIR/$C.pdf.out"); then
    echo "[$C] 완료: ${got}장 (입력 ${N})"
    [ "$got" = "$N" ] || echo "[$C] !! 입력 ${N} 과 출력 ${got} 이 다르다 — 압축됐을 수 있다"
  else
    echo "[$C] 완료: 파일은 받았으나 장수를 못 읽었다 (합본 단계에서 다시 센다)"
  fi
else
  echo "[$C] 다운로드 실패"; exit 1
fi
