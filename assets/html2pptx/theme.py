"""theme.css → PPTX 상수 변환.

디자인 기준은 reveal 덱과 동일한 1280x720 px 캔버스다.
96 DPI 기준으로 1 px = 1/96 in 이므로 슬라이드는 정확히 13.333 x 7.5 in 이 된다.
글자 크기는 CSS px 에 0.75 를 곱해 pt 로 옮긴다 (base 22px = 16.5pt).
"""

from pptx.util import Emu, Pt

# --------------------------------------------------------------------------
# 캔버스
# --------------------------------------------------------------------------
CANVAS_W = 1280          # px
CANVAS_H = 720
PAD_X = 60               # .reveal .slides > section { padding: 34px 60px }
PAD_Y = 34
CONTENT_W = CANVAS_W - PAD_X * 2      # 1160
CONTENT_H = CANVAS_H - PAD_Y * 2      # 652

EMU_PER_PX = 914400 // 96             # 9525


def px(v: float) -> Emu:
    """CSS px → EMU."""
    return Emu(int(round(v * EMU_PER_PX)))


def pt_of(css_px: float) -> Pt:
    """CSS px → Pt (96dpi 기준 1px = 0.75pt)."""
    return Pt(css_px * 0.75)


# --------------------------------------------------------------------------
# 색·도형 — 활성 테마에서 온다
#
# activate() 가 아래 이름들을 채운다. render.py 는 호출 시점에 T.X 로 읽으므로
# build.py 가 렌더 전에 activate() 를 부르기만 하면 된다.
# 테마 정의는 themes/ 아래에 있다.
# --------------------------------------------------------------------------
import themes as _themes

THEME_NAME = None
BG = PAPER = INK = ACCENT = ACCENT2 = FG_STRONG = MUTED = FG2 = None
CODE_BG = CODE_FG = None
A_RULE = A_RULE_STRONG = A_SURFACE_1 = A_SURFACE_2 = None
A_ACCENT_06 = A_ACCENT_25 = None
STYLE = {}
BACKGROUND = SCRIM = None


def activate(name=None, theme_css=None):
    """테마를 고르고 모듈 전역에 펼친다.

    우선순위: 명시한 name → theme_css 자동 감지 → 기본값(withgenie).
    자동 감지에 실패하면 (기본값, False) 를 돌려줘서 호출부가 알릴 수 있게 한다.
    """
    detected = True
    if not name:
        name = _themes.detect(theme_css) if theme_css else None
        if not name:
            name, detected = _themes.DEFAULT, False

    mod = _themes.get(name)
    g = globals()
    g["THEME_NAME"] = mod.NAME
    for key, val in mod.COLORS.items():
        g[key] = val
    for key, val in mod.ALPHA.items():
        g["A_" + key] = val
    g["STYLE"] = dict(mod.STYLE)
    g["BACKGROUND"] = mod.BACKGROUND
    g["SCRIM"] = mod.SCRIM
    return mod.NAME, detected


activate()   # import 만 해도 기본 테마로 동작하도록

# --------------------------------------------------------------------------
# 폰트
#
# 덱은 Pretendard / Instrument Serif / JetBrains Mono 를 쓰지만 vendor 에 든 건
# woff2 라 OS 에 설치되지 않는다. PPTX 는 설치된 폰트 이름으로만 지정할 수 있으므로
# 설치 여부를 실제로 확인해 가장 가까운 것을 고른다.
#
# 강제 지정: LECTURE_DECK_PPTX_FONTS="sans=Pretendard;mono=D2Coding"
# --------------------------------------------------------------------------
import os
import sys
from pathlib import Path


def _font_dirs():
    if sys.platform == "darwin":
        return [Path("/System/Library/Fonts"), Path("/System/Library/Fonts/Supplemental"),
                Path("/Library/Fonts"), Path.home() / "Library/Fonts"]
    if sys.platform == "win32":
        win = Path(os.environ.get("SystemRoot", r"C:\Windows")) / "Fonts"
        local = Path(os.environ.get("LOCALAPPDATA", "")) / "Microsoft/Windows/Fonts"
        return [win, local]
    return [Path("/usr/share/fonts"), Path("/usr/local/share/fonts"),
            Path.home() / ".fonts", Path.home() / ".local/share/fonts"]


_INSTALLED = None


def _installed_files() -> set:
    global _INSTALLED
    if _INSTALLED is None:
        names = set()
        for d in _font_dirs():
            try:
                for p in d.rglob("*"):
                    if p.suffix.lower() in (".ttf", ".otf", ".ttc", ".otc"):
                        names.add(p.name.lower())
            except OSError:
                continue
        _INSTALLED = names
    return _INSTALLED


def pick_font(candidates, fallback):
    """(패밀리명, 판별용 파일명들) 목록에서 실제 설치된 첫 번째를 고른다."""
    have = _installed_files()
    for family, files in candidates:
        if any(f.lower() in have for f in files):
            return family
    return fallback


_OVERRIDE = dict(
    kv.split("=", 1)
    for kv in os.environ.get("LECTURE_DECK_PPTX_FONTS", "").split(";")
    if "=" in kv
)

SANS = _OVERRIDE.get("sans") or pick_font([
    ("Pretendard Variable", ["pretendardvariable.ttf", "pretendardvariable.otf"]),
    ("Pretendard", ["pretendard-regular.otf", "pretendard-regular.ttf"]),
    ("Noto Sans KR", ["notosanskr-regular.otf", "notosanskr-regular.ttf",
                      "notosanskr[wght].ttf", "notosanskr-vf.ttf"]),
    ("Apple SD Gothic Neo", ["applesdgothicneo.ttc"]),
    ("맑은 고딕", ["malgun.ttf"]),
], "Malgun Gothic")

# 가변 폰트(VF)는 Windows 가 'Noto Sans KR Black' 같은 인스턴스를 별도 패밀리로
# 등록해준다. 이름이 없는 OS 면 PowerPoint 가 SANS 로 떨어지고, h1 은 어차피
# bold 를 함께 주므로 굵기는 유지된다.
SANS_BLACK = _OVERRIDE.get("black") or pick_font([
    ("Pretendard Black", ["pretendard-black.otf", "pretendard-black.ttf"]),
    ("Noto Sans KR Black", ["notosanskr-black.otf", "notosanskr-black.ttf",
                            "notosanskr-vf.ttf", "notosanskr[wght].ttf"]),
], SANS)

SERIF = _OVERRIDE.get("serif") or pick_font([
    ("Instrument Serif", ["instrumentserif-regular.ttf", "instrumentserif-italic.ttf"]),
    ("Georgia", ["georgia.ttf", "georgia.ttc"]),
    ("Times New Roman", ["times.ttf", "timesnewroman.ttf"]),
], "Georgia")

MONO = _OVERRIDE.get("mono") or pick_font([
    ("JetBrains Mono", ["jetbrainsmono-regular.ttf", "jetbrainsmono[wght].ttf"]),
    ("D2Coding", ["d2coding.ttf", "d2coding-ver1.3.2-20180524.ttf"]),
    ("Consolas", ["consola.ttf"]),
    ("Menlo", ["menlo.ttc"]),
], "Courier New")

EMOJI = _OVERRIDE.get("emoji") or ("Apple Color Emoji" if sys.platform == "darwin"
                                   else "Segoe UI Emoji")


def font_report() -> str:
    return (f"sans={SANS} · black={SANS_BLACK} · serif={SERIF} · "
            f"mono={MONO} · emoji={EMOJI}")

# --------------------------------------------------------------------------
# 글자 크기 (CSS px). base = 22px
# --------------------------------------------------------------------------
BASE = 22.0


def em(v: float) -> float:
    return BASE * v


FS = {
    "h1": em(4.0),
    "h1_title": em(5.0),
    "h2": em(2.1),
    "h2_compact": em(1.7),
    "h2_small": em(1.4),
    "body": em(1.0),
    "small": em(0.74),
    "eyebrow": em(0.62),
    "eyebrow_title": em(0.8),
    "subtitle": em(1.35),
    "footer_meta": em(0.6),
    "pull_quote": em(2.4),
    "hero_big": em(1.35),
    "kpi": em(1.45),
    "formula": em(1.4),
    # tl
    "tl_yr": em(0.92),
    "tl_ev": em(0.92),
    # dual
    "dd_h": em(0.78),
    "dd_li": em(0.86),
    # ladder
    "rung_n": em(0.82),
    "rung_t": em(0.94),
    # checklist
    "chk_li": em(0.95),
    "chk_n": em(0.95 * 0.72),
    # stat
    "stat_num": em(2.6),
    "stat_lab": em(0.72),
    # case-card
    "case_name": em(1.05),
    "case_rev": em(0.95),
    "case_what": em(0.88),
    "case_lesson": em(1.0),
    # thesis-flow
    "fs_t": em(0.62),
    "fs_n": em(1.0),
    # cap-grid
    "cap_icon": 26.0,
    "cap_text": em(0.76 * 0.92),
    # brief / code
    "code": em(0.82),
    # sources
    "src": em(0.72),
    # inline citation [R1]
    "citation": em(0.62),
    # divider / hero-img / concept
    "section_num": em(0.8),
    "h1_divider": em(3.6),
    "byline": em(0.8),
    "hero_sub": em(1.25),
    "beat_h2": em(2.7),
    "beat_sub": em(1.02),
    # card-grid (grid-3 / v2-card)
    "card_title": em(1.0),
    "card_body": em(0.86),
    # tier-grid
    "tier_name": em(0.7),
    "tier_price": em(1.7),
    "tier_li": em(0.8),
    # chip-row
    "chip": em(0.74),
    # qr-grid
    "qr_eyebrow": em(0.66),
    "qr_name": em(1.32),
    "qr_desc": em(0.82),
    "qr_url": em(0.74),
    # table
    "cell": em(0.88),
}

# 줄간 (CSS line-height)
LH = {
    "h1": 0.96,
    "h2": 1.10,
    "body": 1.65,
    "subtitle": 1.40,
    "pull_quote": 1.30,
    "hero_big": 1.45,
    "kpi": 1.40,
    "tl_ev": 1.50,
    "dd_li": 1.55,
    "rung_t": 1.45,
    "case_what": 1.50,
    "fs_n": 1.40,
    "cap_text": 1.30,
    "code": 1.70,
    "src": 1.45,
    "stat_lab": 1.45,
    "hero_sub": 1.45,
    "beat_sub": 1.55,
    "beat_h2": 1.08,
    "card_body": 1.50,
    "qr_desc": 1.50,
    "cell": 1.50,
}

# 새 컴포넌트 치수 (CSS px)
GRID_GAP = 14            # card-grid / tier-grid
TIER_PAD_X = 16
TIER_PAD_Y = 18
CHIP_GAP = 8
CHIP_PAD_X = 14
CHIP_PAD_Y = 6
QR_GAP = 22
QR_PAD_X = 24
QR_PAD_Y = 22
QR_SIZE = 132
QR_INNER_GAP = 22
CELL_PAD_X = 14
CELL_PAD_Y = 10
HERO_SUB_LEFT = 60
HERO_SUB_BOTTOM = 88
BEAT_LEFT = 64

# --------------------------------------------------------------------------
# 컴포넌트 치수 (CSS px)
# --------------------------------------------------------------------------
GAP_BLOCK = 14           # 슬라이드 안 블록 사이 기본 간격
RADIUS_SM = 4
RADIUS_LG = 16

CARD_PAD_X = 20
CARD_PAD_Y = 18

DUAL_GAP = 22
DUAL_PAD_X = 20
DUAL_PAD_Y = 18

FLOW_GAP = 10
FLOW_PAD_X = 16
FLOW_PAD_Y = 18

CAP_GAP = 8
CAP_PAD_X = 10
CAP_PAD_Y = 12
CAP_COLS = 4

LADDER_GAP = 8
LADDER_PAD_X = 18
LADDER_PAD_Y = 12
RUNG_DOT = 30            # .rn 지름
RUNG_ICON_GAP = 14

CHECK_GAP = 8
CHECK_PAD_X = 18
CHECK_PAD_Y = 12
CHK_H = 26

STAT_GAP = 18
STAT_PAD_X = 18
STAT_PAD_Y = 22

CASE_PAD_X = 24
CASE_PAD_Y = 20
CASE_GAP = 10
BRACKET = 16             # 코너 브래킷 길이

TL_ROW_PAD_Y = 8
TL_GAP = 6
TL_YR_W = 58
TL_COL_GAP = 18

BRIEF_PAD_X = 24
BRIEF_PAD_Y = 20

SRC_GAP = 11             # 0.7em @ 0.72em 기준 ≈ 11px
SRC_PAD_X = 13
SRC_PAD_Y = 12

BULLET_INDENT = 28       # .bullets li { padding-left: 28px }
BULLET_GAP = 13          # margin .6em

HERO_PAD = 26

# --------------------------------------------------------------------------
# 텍스트 높이 추정
# --------------------------------------------------------------------------
# PowerPoint 의 실제 조판을 흉내내기 위한 문자 폭 테이블 (em 단위).
# 한글/한자/가나는 정사각, ASCII 는 대략 절반, 좁은 글자는 더 좁다.
_NARROW = set("iljtfrI.,:;!|'\"()[]{}·`^ ")
_WIDE_ASCII = set("mwMW@%")


def char_width(ch: str) -> float:
    o = ord(ch)
    if o > 0x1100 and (
        0x1100 <= o <= 0x11FF        # 한글 자모
        or 0x2E80 <= o <= 0xA4CF     # CJK 부수 ~ 이체자
        or 0xAC00 <= o <= 0xD7A3     # 한글 음절
        or 0xF900 <= o <= 0xFAFF
        or 0xFE30 <= o <= 0xFE4F
        or 0xFF00 <= o <= 0xFF60     # 전각
        or 0x1F300 <= o <= 0x1FAFF   # 이모지
        or 0x2600 <= o <= 0x27BF
    ):
        return 1.0
    if ch in _NARROW:
        return 0.30
    if ch in _WIDE_ASCII:
        return 0.85
    if ch.isupper():
        return 0.62
    if ch.isdigit():
        return 0.55
    return 0.52


def text_width_px(text: str, font_px: float) -> float:
    return sum(char_width(c) for c in text) * font_px


def wrap_lines(text: str, font_px: float, box_w_px: float) -> int:
    """box_w_px 폭에서 text 가 차지하는 줄 수. 명시적 개행(\\n)도 센다."""
    if box_w_px <= 0:
        return 1
    total = 0
    for para in text.split("\n"):
        if not para.strip():
            total += 1
            continue
        used = 0.0
        lines = 1
        # 한국어는 어절 단위, 영어는 단어 단위로 끊긴다고 본다.
        for token in _tokenize(para):
            w = text_width_px(token, font_px)
            if used > 0 and used + w > box_w_px:
                lines += 1
                used = w if not token.startswith(" ") else 0.0
            else:
                used += w
        total += lines
    return total


def _tokenize(s: str):
    """공백 뒤에 붙는 형태로 토큰을 끊는다. 긴 CJK 덩어리는 글자 단위로 쪼갠다."""
    buf = ""
    for ch in s:
        if char_width(ch) >= 1.0:
            if buf:
                yield buf
                buf = ""
            yield ch
        elif ch == " ":
            buf += ch
            yield buf
            buf = ""
        else:
            buf += ch
    if buf:
        yield buf


def text_height_px(text: str, font_px: float, box_w_px: float, line_height: float) -> float:
    return wrap_lines(text, font_px, box_w_px) * font_px * line_height
