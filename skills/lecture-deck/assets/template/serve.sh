#!/usr/bin/env bash
# 강의 덱 로컬 미리보기. 이 스크립트가 있는 폴더(=강의 폴더)에서 정적 서버를 띄운다.
set -euo pipefail
cd "$(dirname "$0")"
PORT="${1:-8800}"
echo "▶ 강의 덱: http://localhost:${PORT}/index.html  (Ctrl+C로 종료)"
python3 -m http.server "${PORT}"
