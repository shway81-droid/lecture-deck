"""PPTX 변환에 필요한 파이썬 패키지 점검.

build.py 가 맨 먼저 import 한다. 없으면 ImportError 스택 대신 설치 명령을 준다.
"""

import importlib
import sys

REQUIRED = [
    ("pptx", "python-pptx", "PPTX 작성"),
    ("bs4", "beautifulsoup4", "index.html 파싱"),
    ("lxml", "lxml", "HTML 파서 백엔드"),
    ("PIL", "Pillow", "배경·이미지 처리"),
    ("numpy", "numpy", "배경 그라데이션 계산"),
]


def missing() -> list:
    out = []
    for mod, pkg, why in REQUIRED:
        try:
            importlib.import_module(mod)
        except ImportError:
            out.append((pkg, why))
    return out


def install_hint(pkgs) -> str:
    return f"{sys.executable} -m pip install " + " ".join(pkgs)


def require():
    gaps = missing()
    if not gaps:
        return
    lines = ["PPTX 변환에 필요한 파이썬 패키지가 없습니다:"]
    lines += [f"  - {pkg}  ({why})" for pkg, why in gaps]
    lines.append("")
    lines.append("설치:")
    lines.append("  " + install_hint([p for p, _ in gaps]))
    raise SystemExit("\n".join(lines))


def report() -> int:
    gaps = missing()
    for mod, pkg, why in REQUIRED:
        ok = all(pkg != g for g, _ in gaps)
        print(f"  {pkg:<16} {'OK' if ok else 'MISSING'}   {why}")
    if gaps:
        print("\n설치: " + install_hint([p for p, _ in gaps]))
        return 1
    import theme  # 폰트 해석은 패키지가 다 있을 때만 의미가 있다

    print(f"\n폰트: {theme.font_report()}")
    return 0


if __name__ == "__main__":
    print(f"python: {sys.version.split()[0]}  ({sys.executable})")
    sys.exit(report())
