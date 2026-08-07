"""stdin 의 JSON 에서 값 하나를 꺼낸다.

    ... --json | python pick.py notebook.id
    ... --json | python pick.py sources.0.status
    ... --json | python pick.py artifacts.0.status

**셸 안에 파이썬 인라인 파서를 쓰지 않으려고 파일로 분리했다.** 인라인으로 넣으면
바깥 셸의 따옴표와 충돌해 조용히 SyntaxError 를 내고, 그러면 값이 빈 문자열로
넘어가 스크립트는 아무 일 없다는 듯 계속 진행한다. 실제로 이걸로 45회 연속
실패를 놓친 적이 있다.

값이 없으면 빈 줄을 찍고 종료 코드 1.
"""
import json
import re
import sys

path = sys.argv[1].split(".")
raw = sys.stdin.read()
m = re.search(r"\{.*\}", raw, re.S)
if not m:
    print("")
    sys.exit(1)
try:
    cur = json.loads(m.group(0))
    for key in path:
        cur = cur[int(key)] if key.isdigit() else cur[key]
except Exception:
    print("")
    sys.exit(1)
print(cur)
