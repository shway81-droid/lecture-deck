"""덩어리별 NotebookLM 산출물을 순서대로 이어 붙인다.

    python merge_chunks.py <chunk_dir> <out_basename> [--allow-partial]

`plan.tsv` 의 순서대로 `C*.pptx` · `C*.pdf.out` 을 찾아 합친다.

`--allow-partial` 을 주면 아직 안 받은 덩어리를 건너뛰고 있는 것만 이어 붙인다.
레이트 리밋으로 한 덩어리가 막혔을 때 나머지로 먼저 확인하는 용도다. 빠진 구간은
표와 요약에 **반드시** 찍는다. 부분 합본을 완성본으로 착각하면 안 된다.

NotebookLM 이 만든 PPTX 는 슬라이드마다 전면 PNG 한 장뿐이다(텍스트 상자·런·노트
전부 0). 그래서 그 PNG 를 **원본 바이트 그대로** 꺼내 새 프레젠테이션에 다시
배치한다. 다시 렌더하지 않으므로 화질이 그대로다.
"""
import io
import sys
from pathlib import Path

import fitz
from pptx import Presentation
from pptx.util import Emu

args = [a for a in sys.argv[1:] if not a.startswith("--")]
ALLOW_PARTIAL = "--allow-partial" in sys.argv
chunk_dir = Path(args[0])
out_base = Path(args[1])

plan = chunk_dir / "plan.tsv"
if not plan.exists():
    print(f"plan.tsv 가 없다: {plan}")
    raise SystemExit(1)

rows = [l.split("\t") for l in plan.read_text(encoding="utf-8").splitlines() if l.strip()]
names = [r[0] for r in rows]
want = {r[0]: int(r[1]) for r in rows}
span = {r[0]: (int(r[2]), int(r[3])) for r in rows}

missing = [n for n in names
           if not (chunk_dir / f"{n}.pptx").exists() or not (chunk_dir / f"{n}.pdf.out").exists()]
if missing and not ALLOW_PARTIAL:
    print(f"아직 안 받은 덩어리: {', '.join(missing)}")
    raise SystemExit(1)
if missing:
    print(f"!! 부분 합본이다. 빠진 덩어리: {', '.join(missing)}")
    for n in missing:
        a, b = span[n]
        print(f"   {n} = 원본 S{a:02d}–S{b:02d} ({want[n]}장) 가 결과에 없다")
    names = [n for n in names if n not in missing]
    if not names:
        print("받은 덩어리가 하나도 없다.")
        raise SystemExit(1)

# ---------------------------------------------------------------- PDF
out_pdf = fitz.open()
per_chunk = []
for n in names:
    d = fitz.open(chunk_dir / f"{n}.pdf.out")
    out_pdf.insert_pdf(d)
    per_chunk.append((n, d.page_count))
    d.close()
out_pdf.save(out_base.with_suffix(".pdf"), garbage=4, deflate=True)
pdf_pages = out_pdf.page_count
out_pdf.close()

# ---------------------------------------------------------------- PPTX
first = Presentation(chunk_dir / f"{names[0]}.pptx")
W, H = first.slide_width, first.slide_height       # NotebookLM 은 17.78 x 10.0 in

merged = Presentation()
merged.slide_width, merged.slide_height = W, H
blank = merged.slide_layouts[6]

added = 0
sizes = set()
for n in names:
    src = Presentation(chunk_dir / f"{n}.pptx")
    for s in src.slides:
        pics = [sh for sh in s.shapes if sh.shape_type == 13]
        if len(pics) != 1:
            print(f"  경고: {n} 의 한 슬라이드에 이미지가 {len(pics)}개 (1개 가정)")
        dst = merged.slides.add_slide(blank)
        for p in pics:
            sizes.add(p.image.size)
            dst.shapes.add_picture(io.BytesIO(p.image.blob), Emu(0), Emu(0), W, H)
        added += 1

merged.save(out_base.with_suffix(".pptx"))

print("합본 완료")
print(f"  PDF : {pdf_pages} 페이지  → {out_base.with_suffix('.pdf').name}")
print(f"  PPTX: {added} 장          → {out_base.with_suffix('.pptx').name}")
print(f"  크기: {round(W/914400, 2)} x {round(H/914400, 2)} in")
print(f"  임베드 이미지 해상도: {sizes}  (재렌더 없음)")

print("\n  덩어리   원본 슬라이드   입력   출력")
bad = 0
for n, got in per_chunk:
    a, b = span[n]
    mark = "" if got == want[n] else "   ← 압축됨"
    if got != want[n]:
        bad = 1
    print(f"  {n:<6}   S{a:02d}–S{b:02d}       {want[n]:>3}   {got:>3}{mark}")
merged_in = sum(want[n] for n in names)          # 실제로 합친 덩어리의 입력 합
deck_total = sum(want.values())                  # 원본 덱 전체
print(f"  {'합계':<6}   {'':<12}   {merged_in:>3}   {added:>3}")

if pdf_pages != added:
    print(f"  !! PDF({pdf_pages}) 와 PPTX({added}) 장수가 다르다")
    bad = 1
if added != merged_in:
    # 합친 덩어리 안에서 장수가 줄었다면 그건 압축이다.
    print(f"  !! 합친 구간 {merged_in}장 → 결과 {added}장. 덩어리 상한을 더 낮춰 다시 만든다.")
    bad = 1
if missing:
    # 빠진 덩어리는 압축과 원인이 다르다. 섞어서 말하지 않는다.
    print(f"  !! 부분 합본이다. 원본 {deck_total}장 중 {added}장만 들어 있다.")
    print(f"     빠진 덩어리: {', '.join(missing)}. 받은 뒤 --allow-partial 없이 다시 합친다.")
    bad = 1
raise SystemExit(bad)
