"""소스 PDF 를 NotebookLM 이 압축하지 않는 크기의 덩어리로 쪼갠다.

    python split_pdf.py <deck.pdf> <chunks_dir> [--html index.html] [--max 10]

**왜 쪼개나.** NotebookLM 은 소스가 크면 페이지를 1:1 로 옮기지 않고 요약·압축한다.
42페이지 덱을 통째로 넣었더니 21장으로 줄어든 것을 실측했다. 20장 아래로 쪼개
따로 만든 뒤 합치면 장수가 그대로 유지된다.

**경계는 파트에 맞춘다.** `--html` 을 주면 divider-slide 위치를 읽어 파트 경계에서만
자른다. 한 파트가 상한을 넘으면 그 안에서 균등 분할한다. 파트 중간을 자르면
NotebookLM 이 덩어리마다 없는 맥락을 지어내기 쉽다.

덩어리 계획을 `plan.tsv` 로 남긴다. 뒤 단계(생성·합본)가 이 파일을 읽는다.
"""
import argparse
import re
import sys
from pathlib import Path

import fitz

# 20장까지는 NotebookLM 이 1:1 로 옮긴다. 넘으면 요약해서 압축한다.
# 그래서 분할 기준과 덩어리 상한이 같은 값이다.
DEFAULT_MAX = 20
SPLIT_THRESHOLD = 20


# 파트가 시작되는 슬라이드를 알아보는 표식.
# 이 카탈로그에는 divider 전용 레이아웃이 없다. 파트 경계는 그 슬라이드의
# `.eyebrow` 문구로만 드러난다 ("PART 2 · 업무 자동화"). 그래서 문구를 본다.
PART_RE = re.compile(r"^\s*(PART|SECTION|CHAPTER|파트|섹션)\b", re.I)


def part_starts(html_path, n_pages):
    """파트가 시작되는 슬라이드 번호(0-based)를 찾는다."""
    src = Path(html_path).read_text(encoding="utf-8")
    starts = [0]
    # 슬라이드 단위로 자른 뒤 각 조각에서 첫 eyebrow 를 본다
    pieces = re.split(r"<section\b", src)[1:]
    for i, piece in enumerate(pieces):
        if i == 0 or i >= n_pages:
            continue
        if "divider" in piece[:piece.find(">") + 1]:
            starts.append(i)
            continue
        m = re.search(r'class="eyebrow"[^>]*>(.*?)</', piece, re.S)
        if m and PART_RE.match(re.sub(r"<[^>]+>", "", m.group(1))):
            starts.append(i)
    return sorted(set(starts))


def plan_chunks(n_pages, starts, max_pages):
    """파트를 순서대로 담되 상한을 넘지 않게 덩어리를 만든다."""
    bounds = starts + [n_pages]
    parts = [(bounds[i], bounds[i + 1]) for i in range(len(bounds) - 1)]

    # 상한보다 큰 파트는 안에서 균등하게 쪼갠다
    split_parts = []
    for a, b in parts:
        size = b - a
        if size <= max_pages:
            split_parts.append((a, b))
            continue
        k = -(-size // max_pages)          # 올림 나눗셈
        step = -(-size // k)
        for s in range(a, b, step):
            split_parts.append((s, min(s + step, b)))

    # 이어붙여도 상한 안에 들어가면 합친다 (노트북 개수·생성 횟수를 줄인다)
    chunks = []
    for a, b in split_parts:
        if chunks and b - chunks[-1][0] <= max_pages:
            chunks[-1] = (chunks[-1][0], b)
        else:
            chunks.append((a, b))
    return chunks


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("pdf")
    ap.add_argument("out_dir")
    ap.add_argument("--html", help="파트 경계를 읽을 index.html")
    ap.add_argument("--max", type=int, default=DEFAULT_MAX,
                    help=f"덩어리 최대 페이지 (기본 {DEFAULT_MAX}. 올리면 압축된다)")
    ap.add_argument("--boundaries", help="파트 시작 슬라이드를 직접 지정 (1-based, 예: 1,6,12,20,27,33)")
    a = ap.parse_args()

    doc = fitz.open(a.pdf)
    n = doc.page_count
    out_dir = Path(a.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    if n <= SPLIT_THRESHOLD:
        chunks = [(0, n)]
        print(f"{n}페이지 — {SPLIT_THRESHOLD}장 이하라 쪼개지 않는다")
    else:
        if a.boundaries:
            starts = sorted({0} | {int(x) - 1 for x in a.boundaries.split(",") if x.strip()})
            starts = [s for s in starts if 0 <= s < n]
            print(f"파트 경계(직접 지정) {len(starts)}곳: " + ", ".join(f"S{s+1}" for s in starts))
        elif a.html:
            starts = part_starts(a.html, n)
            print(f"파트 경계 {len(starts)}곳: " + ", ".join(f"S{s+1}" for s in starts))
            if len(starts) == 1:
                print("  !! 파트 표식을 못 찾았다. eyebrow 가 'PART …' 로 시작하지 않는 덱이면"
                      " --boundaries 로 직접 준다. 지금은 상한으로만 균등 분할한다.")
        else:
            starts = [0]
            print("!! --html 이 없어 파트 경계를 모른다. 상한으로만 균등 분할한다.")
        chunks = plan_chunks(n, starts, a.max)

    lines = []
    for i, (s, e) in enumerate(chunks, 1):
        name = f"C{i}"
        sub = fitz.open()
        sub.insert_pdf(doc, from_page=s, to_page=e - 1)
        sub.save(out_dir / f"{name}.pdf", garbage=4, deflate=True)
        sub.close()
        lines.append(f"{name}\t{e - s}\t{s + 1}\t{e}")
        print(f"  {name}: 원본 S{s+1:02d}–S{e:02d} ({e - s}페이지)")

    (out_dir / "plan.tsv").write_text("\n".join(lines) + "\n", encoding="utf-8")
    doc.close()

    total = sum(int(l.split('\t')[1]) for l in lines)
    print(f"덩어리 {len(chunks)}개, 합계 {total}페이지 (원본 {n})")
    if total != n:
        print("  !! 합계가 원본과 다르다")
        return 1
    over = [l.split('\t')[0] for l in lines if int(l.split('\t')[1]) > a.max]
    if over:
        print(f"  !! 상한 초과 덩어리: {', '.join(over)} — 압축될 수 있다")
    return 0


if __name__ == "__main__":
    sys.exit(main())
