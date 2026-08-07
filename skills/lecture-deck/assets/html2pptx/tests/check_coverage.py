"""커버리지 테스트: 덱의 어떤 글자도 PPTX 에서 사라지지 않는지 확인한다.

레이아웃 카탈로그가 늘어나면 파서가 모르는 컨테이너가 생기고, 그 안의 글자는
조용히 증발한다. 이 테스트가 그걸 잡는다.

    python tests/check_coverage.py <index.html>
"""

import re
import sys
import unicodedata
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from bs4 import BeautifulSoup  # noqa: E402

from parse import parse_deck  # noqa: E402

# 렌더러가 CSS ::before / list-style 를 대신해 넣는 장식 문자
MARKERS = set("•—▸“”✓→")


def norm(t: str) -> str:
    return re.sub(r"\s+", "", unicodedata.normalize("NFC", t))


def ir_text(block) -> str:
    """블록 IR 안의 모든 문자열을 긁어모은다."""
    out = []

    def walk(v):
        if isinstance(v, str):
            out.append(v)
        elif isinstance(v, dict):
            for k, sub in v.items():
                if k in ("kind", "style", "link", "tone", "variant", "url", "src", "alt"):
                    continue
                walk(sub)
        elif isinstance(v, (list, tuple)):
            for sub in v:
                walk(sub)

    walk(block)
    return "".join(out)


def main(path: Path) -> int:
    soup = BeautifulSoup(path.read_text(encoding="utf-8"), "lxml")
    for a in soup.find_all("aside", class_="notes"):
        a.decompose()
    sections = soup.select(".reveal > .slides > section")

    deck = parse_deck(path)
    assert len(deck) == len(sections), f"슬라이드 수 불일치: {len(deck)} vs {len(sections)}"

    failures = []
    for sec, slide in zip(sections, deck):
        want = norm(sec.get_text(" "))
        got = norm("".join(ir_text(b) for b in slide["blocks"]))
        missing = Counter(want)
        for ch in got:
            if missing[ch]:
                missing[ch] -= 1
        lost = {c: n for c, n in missing.items() if n > 0 and c not in MARKERS}
        if lost:
            head = sec.find(["h1", "h2"])
            failures.append({
                "index": slide["index"],
                "title": (head.get_text(" ", strip=True) if head else "(제목 없음)"),
                "lost_chars": sum(lost.values()),
                "sample": "".join(list(lost)[:40]),
                "kinds": [b["kind"] for b in slide["blocks"]],
            })

    unknown = sum(len(s.get("unknown", [])) for s in deck)

    print(f"슬라이드: {len(deck)}   파서가 모른 요소: {unknown}")
    if not failures:
        print("PASS — 모든 슬라이드의 글자가 IR 에 남아 있습니다.")
        return 0

    print(f"\nFAIL — {len(failures)}개 슬라이드에서 글자가 사라졌습니다.\n")
    for f in failures:
        print(f"  S{f['index']:02d} {f['title']}")
        print(f"      잃은 글자 {f['lost_chars']}자: {f['sample']}")
        print(f"      잡힌 블록: {f['kinds'] or '(없음)'}")
    return 1


if __name__ == "__main__":
    raise SystemExit(main(Path(sys.argv[1])))
