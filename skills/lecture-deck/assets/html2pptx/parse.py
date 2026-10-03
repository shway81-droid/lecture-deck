"""index.html → 슬라이드 IR.

reveal 덱의 `<section>` 하나가 슬라이드 하나다. `aside.notes` 는 `--notes`
옵션이 있을 때만 살린다.

블록 IR 은 `{"kind": ..., ...}` 딕셔너리 목록이고, 인라인 서식은 run 목록
`{"text": ..., "style": ..., "link": ...}` 으로 평탄화한다. style 이 실제
폰트·색으로 번역되는 것은 render.py 쪽 책임이다.

**모르는 마크업도 글자를 잃지 않는다.** 전용 렌더러가 없는 컨테이너는
`_generic()` 이 안쪽을 걸어 들어가 문단·목록·이미지로 풀어낸다. 그렇게 처리한
요소는 `slide["unknown"]` 에 남겨 build.py 가 경고로 알린다.
"""

import re
from pathlib import Path

from bs4 import BeautifulSoup, NavigableString, Tag

# run style 종류
PLAIN = "plain"
STRONG = "strong"
ACCENT = "accent"        # .accent / <em> — serif italic green
CODE = "code"            # inline <code>
CITATION = "citation"    # a.citation — 작은 그린 링크
OP = "op"                # .formula .op
BHOT = "bhot"            # .formula b — 그린 볼드
BR = "br"                # 줄바꿈


def _cls(el) -> list:
    return el.get("class", []) if isinstance(el, Tag) else []


def inline(el, base=PLAIN) -> list:
    """엘리먼트 안의 텍스트를 run 목록으로 평탄화한다."""
    if el is None:
        return []
    runs = []

    def emit(text, style, link=None):
        if not text:
            return
        if runs and runs[-1]["style"] == style and runs[-1]["link"] == link:
            runs[-1]["text"] += text
        else:
            runs.append({"text": text, "style": style, "link": link})

    def walk(node, style):
        for child in node.children:
            if isinstance(child, NavigableString):
                emit(re.sub(r"\s+", " ", str(child)), style)
                continue
            if not isinstance(child, Tag):
                continue
            name = child.name
            classes = _cls(child)
            if name == "br":
                runs.append({"text": "", "style": BR, "link": None})
            elif name == "a" and "citation" in classes:
                emit(child.get_text(strip=True), CITATION, child.get("href"))
            elif name == "strong":
                walk(child, STRONG)
            elif name == "b":
                walk(child, BHOT if "formula" in _cls(node) else STRONG)
            elif name == "em" or "accent" in classes:
                walk(child, ACCENT)
            elif name == "code":
                walk(child, CODE)
            elif "op" in classes:
                walk(child, OP)
            else:
                walk(child, style)

    walk(el, base)

    while runs and runs[0]["style"] != BR and not runs[0]["text"].strip():
        runs.pop(0)
    while runs and runs[-1]["style"] != BR and not runs[-1]["text"].strip():
        runs.pop()
    if runs and runs[0]["style"] != BR:
        runs[0]["text"] = runs[0]["text"].lstrip()
    if runs and runs[-1]["style"] != BR:
        runs[-1]["text"] = runs[-1]["text"].rstrip()
    return runs


def plain(runs) -> str:
    return "".join("\n" if r["style"] == BR else r["text"] for r in runs)


# --------------------------------------------------------------------------
# 조각 파서
# --------------------------------------------------------------------------


def _list_items(el) -> list:
    return [inline(li) for li in el.find_all("li", recursive=False)]


def _img(el):
    return {"kind": "image", "src": el.get("src", ""), "alt": el.get("alt", "")}


def _table(el):
    rows = []
    head = False
    for tr in el.find_all("tr"):
        cells = tr.find_all(["td", "th"], recursive=False)
        if not cells:
            continue
        if any(c.name == "th" for c in cells):
            head = True
        rows.append([
            {"runs": inline(c), "muted": "prob" in _cls(c), "th": c.name == "th"}
            for c in cells
        ])
    return {"kind": "table", "rows": rows, "head": head}


def _dual(el):
    """dual 2열. .dd 카드형과 layouts.md 의 평범한 div 형 둘 다 받는다."""
    cols = []
    for col in el.find_all("div", recursive=False):
        classes = _cls(col)
        if "dd" in classes:
            head = col.find("p", class_="dd-h")
            tone = "do" if "do" in classes else "dont"
        else:
            head = col.find("p", class_="eyebrow")
            tone = "plain"
        cols.append({
            "tone": tone,
            "head": inline(head) if head else [],
            "items": [inline(li) for li in col.find_all("li")],
            # 목록이 아닌 잔여 문단도 잃지 않는다
            "extra": [inline(p) for p in col.find_all("p", recursive=False)
                      if p is not head],
        })
    return {"kind": "dual", "cols": cols}


def _card_grid(el):
    """grid-3 / v2-card 처럼 '제목 + 한 줄' 카드가 나열된 격자."""
    cards = []
    for c in el.find_all("div", recursive=False):
        strong = c.find("strong")
        title = inline(strong) if strong else []
        if strong:
            strong.extract()
        cards.append({"title": title, "body": inline(c)})
    return {"kind": "card-grid", "cards": cards}


def _tier_grid(el):
    tiers = []
    for t in el.find_all("div", class_="tier", recursive=False):
        name = t.find(class_="tier-name")
        price = t.find(class_="tier-price")
        ul = t.find("ul")
        items = [inline(li) for li in ul.find_all("li")] if ul else []

        # 카탈로그 마크업은 tier-name + tier-price + ul 이지만, 값 대신 설명
        # 문단을 넣은 카드도 흔하다. 그런 <p> 를 그냥 두면 PPTX 에서 글자가
        # 통째로 사라지는데 tier-grid 는 아는 컨테이너라 경고도 안 뜬다.
        # 남는 문단을 항목으로 주워 담아 조용한 손실을 막는다.
        for p in t.find_all("p", recursive=False):
            if p is name or p is price:
                continue
            txt = inline(p)
            if txt:
                items.append(txt)

        tiers.append({
            "name": name.get_text(strip=True) if name else "",
            "price": inline(price),
            "items": items,
            "featured": "featured" in _cls(t),
        })
    return {"kind": "tier-grid", "tiers": tiers}


def _chip_row(el):
    return {"kind": "chip-row", "chips": [
        {"text": ch.get_text(strip=True), "arrow": "arr" in _cls(ch)}
        for ch in el.find_all("span", recursive=False)
    ]}


def _qr_grid(el):
    cards = []
    for c in el.find_all("div", class_="qr-card", recursive=False):
        img = c.find("img")
        eb = c.find(class_="qr-eyebrow")
        url = c.find(class_="qr-url")
        cards.append({
            "src": img.get("src") if img else None,
            "eyebrow": eb.get_text(strip=True) if eb else "",
            "name": inline(c.find(class_="qr-name")),
            "desc": inline(c.find(class_="qr-desc")),
            # 화면에 그대로 찍히는 주소 문자열 (href 가 아니라 표시 텍스트)
            "url_text": url.get_text(strip=True) if url else "",
        })
    return {"kind": "qr-grid", "cards": cards}


# --------------------------------------------------------------------------
# 블록 디스패치
# --------------------------------------------------------------------------


def _parse_child(el, unknown: list) -> list:
    """엘리먼트 하나 → 블록 0개 이상."""
    name = el.name
    classes = _cls(el)

    if name == "aside":
        return []

    if name == "h1":
        return [{"kind": "h1", "runs": inline(el)}]

    if name == "h2":
        variant = ("compact" if "compact" in classes
                   else "small" if "small-h2" in classes else None)
        return [{"kind": "h2", "variant": variant, "runs": inline(el)}]

    if name == "p":
        img = el.find("img")
        if img is not None and not el.get_text(strip=True):
            return [_img(img)]
        return [{"kind": "p", "classes": classes, "runs": inline(el)}]

    if name == "pre":
        code = el.find("code")
        return [{"kind": "code", "text": (code or el).get_text()}]

    if name == "img":
        return [_img(el)]

    if name == "table":
        return [_table(el)]

    if name == "ol" and "source-list" in classes:
        items = []
        for li in el.find_all("li", recursive=False):
            sid = li.find("span", class_="source-id")
            title = li.find("span", class_="source-title")
            meta = li.find("span", class_="source-meta")
            link = li.find("a", class_="citation")
            items.append({
                "id": sid.get_text(strip=True) if sid else "",
                "title": title.get_text(strip=True) if title else "",
                "meta": meta.get_text(strip=True) if meta else "",
                "url": link.get("href") if link else None,
                "link_text": link.get_text(strip=True) if link else "[원문]",
            })
        return [{"kind": "source-list", "items": items}]

    if name == "ul" and "check-list" in classes:
        items = []
        for li in el.find_all("li", recursive=False):
            chk = li.find("span", class_="chk")
            num = chk.get_text(strip=True) if chk else ""
            if chk:
                chk.extract()
            items.append({"n": num, "runs": inline(li)})
        return [{"kind": "check-list", "items": items}]

    if name in ("ul", "ol"):
        # bullets / resources / big-list / 기본 목록을 전부 받는다.
        # .bullets 만 theme.css 의 그린 ▸ 마커를 쓰고, 나머지는 기본 마커다.
        return [{"kind": "bullets", "ordered": name == "ol",
                 "styled": "bullets" in classes,
                 "items": _list_items(el)}]

    if name != "div":
        txt = el.get_text(" ", strip=True)
        if txt:
            unknown.append(f"<{name}>")
            return [{"kind": "p", "classes": [], "runs": inline(el)}]
        return []

    # ---- div ----
    if "title-block" in classes:
        return [{
            "kind": "title-block",
            "eyebrow": inline(el.find("p", class_="eyebrow")) or None,
            "h1": inline(el.find("h1")),
            "subtitle": inline(el.find("p", class_="subtitle")) or None,
        }]

    if "tl" in classes:
        rows = []
        for row in el.find_all("div", class_="row", recursive=False):
            rows.append({
                "yr": inline(row.find("span", class_="yr")),
                "ev": inline(row.find("span", class_="ev")),
                "now": "now" in _cls(row),
            })
        return [{"kind": "tl", "rows": rows}]

    if "card-row" in classes:
        hero = el.find("div", class_="hero-card")
        big = hero.find("p", class_="big") if hero else None
        ul = el.find("ul", class_="bullets")
        return [{"kind": "card-row",
                 "hero": inline(big) if big else [],
                 "items": _list_items(ul) if ul else []}]

    if "dual" in classes:
        return [_dual(el)]

    if "thesis-flow" in classes:
        steps = []
        for st in el.find_all("div", recursive=False):
            if "flow-arrow" in _cls(st):
                continue
            steps.append({
                "t": inline(st.find("span", class_="fs-t")),
                "n": inline(st.find("span", class_="fs-n")),
                "now": "is-now" in _cls(st),
            })
        return [{"kind": "thesis-flow", "steps": steps}]

    if "cap-grid" in classes:
        caps = []
        for cap in el.find_all("div", class_="cap", recursive=False):
            icon = cap.find("span", class_="cap-icon")
            text = cap.find("span", class_="cap-text")
            caps.append({"icon": icon.get_text(strip=True) if icon else "",
                         "text": text.get_text(strip=True) if text else ""})
        return [{"kind": "cap-grid", "caps": caps}]

    if "ladder" in classes:
        rungs = []
        for rung in el.find_all("div", class_="rung", recursive=False):
            rn = rung.find("span", class_="rn")
            rungs.append({"n": rn.get_text(strip=True) if rn else "",
                          "runs": inline(rung.find("span", class_="rt"))})
        return [{"kind": "ladder", "rungs": rungs}]

    if "stat-row" in classes:
        stats = []
        for st in el.find_all("div", class_="stat", recursive=False):
            stats.append({"num": st.find("span", class_="num").get_text(strip=True),
                          "lab": st.find("span", class_="lab").get_text(strip=True)})
        return [{"kind": "stat-row", "stats": stats}]

    if "case-card" in classes:
        rev = el.find("span", class_="case-rev")
        return [{
            "kind": "case-card",
            "name": inline(el.find("span", class_="case-name")),
            "rev": rev.get_text(strip=True) if rev else None,
            "what": inline(el.find("p", class_="case-what")) or None,
            "lesson": inline(el.find("p", class_="case-lesson")) or None,
        }]

    if "brief-block" in classes:
        code = el.find("code")
        return [{"kind": "brief", "text": (code or el).get_text()}]

    if "tier-grid" in classes:
        return [_tier_grid(el)]

    if "chip-row" in classes:
        return [_chip_row(el)]

    if "qr-grid" in classes:
        return [_qr_grid(el)]

    if "image-slot" in classes:
        img = el.find("img")
        return [_img(img)] if img else []

    if "beat" in classes:      # concept 슬라이드 안쪽 텍스트 묶음
        return _generic(el, unknown)

    if "hero-card" in classes:
        big = el.find("p", class_="big")
        return [{"kind": "hero-card",
                 "runs": inline(big) if big else inline(el)}]

    if "guardrail-card" in classes:
        title = el.find(class_="guardrail-title")
        body = el.find(class_="guardrail-body")
        return [{"kind": "guardrail-card",
                 "title": inline(title) if title else [],
                 "body": inline(body) if body else inline(el)}]

    # grid-3 / v2-card 류: 자식 div 가 모두 strong 을 갖고 있으면 카드 격자
    kids = el.find_all("div", recursive=False)
    if len(kids) >= 2 and all(k.find("strong") for k in kids):
        return [_card_grid(el)]

    unknown.append("." + ".".join(classes) if classes else "<div>")
    return _generic(el, unknown)


def _generic(el, unknown: list) -> list:
    """모르는 컨테이너를 안쪽부터 풀어 글자를 살린다."""
    blocks = []
    buf = []

    def flush():
        if buf:
            text = " ".join(buf).strip()
            if text:
                blocks.append({"kind": "p", "classes": [],
                               "runs": [{"text": text, "style": PLAIN, "link": None}]})
            buf.clear()

    for child in el.children:
        if isinstance(child, NavigableString):
            t = re.sub(r"\s+", " ", str(child)).strip()
            if t:
                buf.append(t)
            continue
        if not isinstance(child, Tag):
            continue
        flush()
        blocks.extend(_parse_child(child, unknown))
    flush()
    return blocks


# --------------------------------------------------------------------------
# 슬라이드
# --------------------------------------------------------------------------


def _slide_kind(section) -> str:
    c = _cls(section)
    for k in ("hero-img", "concept", "divider-slide", "title-slide"):
        if k in c:
            return k
    return "body"


def parse_deck(html_path: Path, keep_notes: bool = False) -> list:
    soup = BeautifulSoup(Path(html_path).read_text(encoding="utf-8"), "lxml")
    slides = []
    for idx, section in enumerate(soup.select(".reveal > .slides > section"), start=1):
        notes = ""
        for aside in section.find_all("aside", class_="notes"):
            if keep_notes and not notes:
                notes = aside.get_text("\n", strip=True)
            aside.decompose()

        unknown, blocks = [], []
        for child in section.find_all(recursive=False):
            blocks.extend(_parse_child(child, unknown))

        slides.append({
            "index": idx,
            "kind": _slide_kind(section),
            "title_slide": "title-slide" in _cls(section),
            "background": section.get("data-background-image"),
            "background_opacity": section.get("data-background-opacity"),
            "blocks": blocks,
            "unknown": unknown,
            "notes": notes,
        })
    return slides


if __name__ == "__main__":
    import collections
    import sys

    deck = parse_deck(Path(sys.argv[1]))
    print(f"slides: {len(deck)}")
    kinds, pclasses = collections.Counter(), collections.Counter()
    for s in deck:
        for b in s["blocks"]:
            kinds[b["kind"]] += 1
            if b["kind"] == "p":
                pclasses[" ".join(b["classes"]) or "(none)"] += 1
    print("\n-- block kinds --")
    for k, v in kinds.most_common():
        print(f"{v:4d}  {k}")
    print("\n-- p variants --")
    for k, v in pclasses.most_common():
        print(f"{v:4d}  p.{k}")
    unk = collections.Counter(u for s in deck for u in s["unknown"])
    if unk:
        print("\n-- 전용 렌더러가 없어 폴백으로 처리한 요소 --")
        for k, v in unk.most_common():
            print(f"{v:4d}  {k}")
