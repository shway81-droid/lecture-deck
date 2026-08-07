"""원본 reveal 덱을 Chrome 헤드리스로 슬라이드별 PNG 캡처 (대조 검증용)."""

import subprocess
import sys
from pathlib import Path

CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"


def capture(html: Path, out_dir: Path, indices):
    out_dir.mkdir(parents=True, exist_ok=True)
    url_base = html.resolve().as_uri()
    done = []
    for i in indices:
        out = out_dir / f"html-{i:02d}.png"
        subprocess.run(
            [
                CHROME,
                "--headless=new",
                "--disable-gpu",
                "--hide-scrollbars",
                "--force-device-scale-factor=1",
                "--window-size=1280,720",
                "--virtual-time-budget=6000",
                f"--screenshot={out}",
                f"{url_base}#/{i - 1}",
            ],
            capture_output=True,
            timeout=90,
        )
        if out.exists():
            done.append(i)
    return done


if __name__ == "__main__":
    html = Path(sys.argv[1])
    out_dir = Path(sys.argv[2])
    if len(sys.argv) > 3:
        idxs = [int(x) for x in sys.argv[3].split(",")]
    else:
        idxs = range(1, 47)
    got = capture(html, out_dir, idxs)
    print(f"captured {len(got)} slides -> {out_dir}")
