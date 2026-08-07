"""PDF 페이지 수를 찍는다. 실패하면 아무것도 안 찍고 종료 코드 1.

    python pagecount.py <file.pdf>

셸에 `python -c "import fitz;print(...)"` 를 인라인으로 넣지 않기 위한 파일이다.
인라인으로 두면 경로의 한글·따옴표와 바깥 셸이 부딪히고, 실패가 조용히 "?" 로
바뀌어 "압축됐을 수 있다" 같은 엉뚱한 경고를 만든다.

다운로드 직후에는 파일이 아직 다 쓰이지 않았을 수 있어 잠깐씩 다시 읽는다.
"""
import sys
import time

try:
    import fitz
except ImportError:
    sys.exit(1)

path = sys.argv[1]
for attempt in range(5):
    try:
        with fitz.open(path) as d:
            print(d.page_count)
            sys.exit(0)
    except Exception:
        time.sleep(2)
sys.exit(1)
