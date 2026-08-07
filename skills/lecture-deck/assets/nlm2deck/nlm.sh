#!/usr/bin/env bash
# notebooklm CLI 재시도 래퍼.
#
# NotebookLM 호출은 간헐적으로 SSL 로 튕긴다 (`CERTIFICATE_VERIFY_FAILED`,
# `EE certificate key too weak`). 15초 간격으로 3회 다시 건다.
#
# **SSL 오류에만 재시도한다.** 인자 오류·인증 만료·레이트 리밋 같은 결정적 오류는
# 몇 번을 걸어도 같은 답이 오므로 즉시 반환한다. 전부 재시도하면 실패를 늦게
# 발견하고 로그만 지저분해진다.
set -o pipefail

n=0
max=4
until [ $n -ge $max ]; do
  out=$(notebooklm "$@" 2>&1)
  rc=$?
  if ! printf '%s' "$out" | grep -q 'CERTIFICATE_VERIFY_FAILED'; then
    printf '%s\n' "$out"
    exit $rc
  fi
  n=$((n+1))
  if [ $n -lt $max ]; then
    echo "  [retry $n/$((max-1))] SSL 오류, 15초 후 재시도" >&2
    sleep 15
  fi
done
printf '%s\n' "$out"
exit 1
