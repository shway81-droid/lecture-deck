"""덱 index.html 을 NotebookLM 소스용 PDF 로 굽는다.

    python render_pdf.py lectures/<slug>/index.html [out.pdf]

reveal.js 4.x 에는 인쇄 지원이 내장돼 있다. `?print-pdf` 를 붙이면 setupPDF() 가
슬라이드 하나를 페이지 하나로 펼치고 @page 크기까지 잡아준다. **HTML 을 고치지
않는다.** 헤드리스 크롬으로 그 URL 을 인쇄해 받는다.

NotebookLM 은 HTML 을 소스로 받지 않는다(PDF·텍스트·마크다운·EPUB·Word).
그래서 PDF 가 중간 형식이다. 이미지 캡처가 아니라 텍스트가 살아 있는 PDF 라야
NotebookLM 이 내용을 읽는다 — 그래서 마지막에 텍스트 추출을 검증한다.
"""
import http.server
import os
import re
import shutil
import socket
import socketserver
import subprocess
import sys
import tempfile
import threading
from pathlib import Path

CHROME_CANDIDATES = [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
]


def find_chrome():
    env = os.environ.get("LECTURE_DECK_CHROME")
    if env and Path(env).exists():
        return env
    for name in ("chrome", "google-chrome", "chromium", "msedge"):
        p = shutil.which(name)
        if p:
            return p
    for c in CHROME_CANDIDATES:
        if Path(c).exists():
            return c
    return None


def free_port():
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def serve(root, port):
    """덱 폴더를 정적 서버로 연다.

    file:// 로는 안 된다. reveal 을 ES 모듈로 불러오는 구성에서 CORS 에 막히고,
    theme.css·assets 상대 경로도 브라우저마다 다르게 걸린다.
    """
    class H(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *a, **kw):
            super().__init__(*a, directory=str(root), **kw)

        def log_message(self, *a):
            pass

    httpd = socketserver.TCPServer(("127.0.0.1", port), H)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        return 2

    html = Path(sys.argv[1]).resolve()
    if not html.exists():
        print(f"index.html 이 없다: {html}")
        return 1
    out = Path(sys.argv[2]).resolve() if len(sys.argv) > 2 else html.parent / "nlm-source.pdf"
    out.parent.mkdir(parents=True, exist_ok=True)

    src = html.read_text(encoding="utf-8")
    n_sections = len(re.findall(r"<section\b", src))
    print(f"소스 슬라이드: {n_sections}장")

    chrome = find_chrome()
    if not chrome:
        print("크롬을 못 찾았다. LECTURE_DECK_CHROME 에 실행 파일 경로를 준다.")
        return 1

    port = free_port()
    httpd = serve(html.parent, port)
    url = f"http://127.0.0.1:{port}/{html.name}?print-pdf"
    print(f"인쇄: {url}")

    with tempfile.TemporaryDirectory() as prof:
        cmd = [
            chrome,
            "--headless=new",
            "--disable-gpu",
            "--no-sandbox",
            "--no-pdf-header-footer",
            f"--user-data-dir={prof}",
            # reveal 의 setupPDF 와 폰트 로딩이 끝날 시간을 준다.
            # 가상 시간이라 실제로 15초를 기다리지는 않는다.
            "--virtual-time-budget=15000",
            f"--print-to-pdf={out}",
            url,
        ]
        # 한국어 Windows 는 기본 코덱이 cp949 라 크롬의 UTF-8 stderr 에서
        # UnicodeDecodeError 가 터진다. 인코딩을 못 박고 깨진 바이트는 흘린다.
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=300,
                           encoding="utf-8", errors="replace")
    httpd.shutdown()

    if not out.exists() or out.stat().st_size == 0:
        print("PDF 가 생기지 않았다.")
        print((r.stderr or "")[-1500:])
        return 1

    # ---- 검증: 페이지 수와 텍스트. 둘 중 하나라도 어긋나면 그대로 알린다.
    try:
        import fitz
    except ImportError:
        print(f"완료(미검증): {out}  — pymupdf 가 없어 페이지 수를 못 셌다")
        return 0

    d = fitz.open(out)

    # reveal 의 print-pdf 는 끝에 빈 페이지를 한 장 더 붙일 때가 있다(실측).
    #
    # 판정 기준을 "내용이 없어 보이는가"로 두면 위험하다. 그 페이지에도 테마의
    # 배경 이미지와 도형은 그대로 깔려서, 어떤 임계값을 잡아도 진짜 슬라이드를
    # 지울 여지가 남는다. 그래서 **소스 슬라이드 수를 기준으로 삼는다**:
    # 페이지가 슬라이드보다 많을 때만, 글자 없는 꼬리 페이지를 하나씩 뗀다.
    # 수가 맞는 순간 멈추므로 진짜 슬라이드는 절대 지워지지 않는다.
    dropped = 0
    while d.page_count > n_sections:
        if d[d.page_count - 1].get_text().strip():
            break
        d.delete_page(d.page_count - 1)
        dropped += 1
    if dropped:
        # 열려 있는 파일에 그대로 덮어쓸 수 없어서 옆에 쓰고 바꿔 끼운다
        tmp = out.with_suffix(".trim.pdf")
        d.save(tmp, garbage=4, deflate=True)
        d.close()
        out.unlink()
        tmp.rename(out)
        d = fitz.open(out)
        print(f"  끝의 빈 페이지 {dropped}장 제거")

    pages = d.page_count
    chars = sum(len(d[i].get_text().strip()) for i in range(pages))
    d.close()

    print(f"PDF: {pages}페이지 · 추출 텍스트 {chars:,}자 → {out}")
    bad = 0
    if pages != n_sections:
        print(f"  !! 페이지({pages}) 와 슬라이드({n_sections}) 수가 다르다. "
              f"세로 스택(<section> 중첩)이 있으면 정상일 수 있으니 눈으로 확인한다.")
        bad = 1
    if chars < 200 * pages / 10:
        print("  !! 텍스트가 거의 없다. 이미지로 구워졌을 수 있다. "
              "NotebookLM 이 내용을 못 읽으므로 원인을 찾고 다시 굽는다.")
        bad = 1
    return bad


if __name__ == "__main__":
    sys.exit(main())
