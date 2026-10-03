"""Coral Reef — 크림 종이 + 코랄 + 청록.

life-automation 강의용으로 잠근 타입 스케일과 색상을 담는다.
warmpaper 의 크림 종이 기반에 코랄(#E8836B)과 청록(#3D9A8B)을 강조색으로 쓴다.

타입 스케일은 24pt 본문 기준으로 설정되어 있다:
  - title: 52.5pt (70px)
  - body: 24pt (32px) — BASE
  - card body: 20.5pt (27.33px)
  - small text: 17.5pt (23.33px)

기존 warmpaper(16.5pt 본문, 22px BASE)와 다른 스케일이므로 별도 테마로 분리한다.
warmpaper 와 비교하면 전체가 32/22 ≈ 1.4545 배 커진다.
"""

NAME = "coralreef"
DETECT = "--cr-paper"

COLORS = {
    "BG":        "F3EFE7",   # 크림 종이 (warmpaper 동일)
    "PAPER":     "FFFFFF",
    "TEXT":      "3E3D39",   # 본문 글자 (warmpaper 동일)
    "SURFACE":   "FFFFFF",   # 흰 카드
    "RULE_C":    "D8D0C2",   # 따뜻한 회색 테두리
    "INK":       "2C4A4A",   # 어두운 청록 (제목용)
    "ACCENT":    "E8836B",   # 코랄 강조
    "ACCENT2":   "3D9A8B",   # 청록 보조
    "FG_STRONG": "2C4A4A",   # 어두운 청록 (강한 글자)
    "MUTED":     "7A756C",   # (warmpaper 동일)
    "FG2":       "3E3D39",   # (warmpaper 동일)
    "CODE_BG":   "2C4A4A",   # 코드 블록 배경 (어두운 청록)
    "CODE_FG":   "EFEAE0",
    "GC_FILL":   "F5C842",   # guardrail-card 노랑
}

ALPHA = {
    "RULE":        0.55,
    "RULE_STRONG": 0.75,
    "SURFACE_1":   1.00,
    "SURFACE_2":   1.00,
    "ACCENT_06":   0.10,
    "ACCENT_25":   0.45,
    "GC_FILL":     0.12,     # guardrail-card 12% 채움
}

STYLE = {
    "card":         "shadow",
    "case_card":    "left-bar",
    "dual":         "header-bar",
    "rung_number":  "filled",
    "chk":          "accent2-fill",
    "accent_run":   "bold",
    "eyebrow_prefix": "",
    "eyebrow_align":  "center",
    "h2_align":     "center",
    "case_lesson":    "bold",
    "case_rev":       "pill",
    "stat_num":     "ink",
    "source_bar":   "accent",
}

BACKGROUND = "coral"
SCRIM = "light"

BASE = 32.0

FONT_SCALE = {
    "h1": 2.1875,
    "h1_title": 2.1875,
    "h2": 2.1875,
    "h2_compact": 1.21875,
    "h2_small": 1.0,
    "body": 1.0,
    "small": 0.729,
    "eyebrow": 0.5469,
    "eyebrow_title": 0.5469,
    "subtitle": 0.9375,
    "footer_meta": 0.5469,
    "pull_quote": 1.5,
    "hero_big": 0.854,
    "kpi": 1.0,
    "formula": 1.0,
    "tl_yr": 0.729,
    "tl_ev": 0.729,
    "dd_h": 0.729,
    "dd_li": 0.854,
    "rung_n": 0.729,
    "rung_t": 0.854,
    "chk_li": 0.854,
    "chk_n": 0.525,
    "stat_num": 1.625,
    "stat_lab": 0.5469,
    "case_name": 0.854,
    "case_rev": 0.729,
    "case_what": 0.854,
    "case_lesson": 0.854,
    "fs_t": 0.5469,
    "fs_n": 0.854,
    "cap_icon": 0.8125,
    "cap_text": 0.5469,
    "code": 0.729,
    "src": 0.5469,
    "citation": 0.5469,
    "section_num": 0.5469,
    "h1_divider": 2.1875,
    "byline": 0.5469,
    "hero_sub": 0.854,
    "beat_h2": 1.6875,
    "beat_sub": 0.854,
    "card_title": 0.854,
    "card_body": 0.854,
    "tier_name": 0.5469,
    "tier_price": 1.0,
    "tier_li": 0.5469,
    "chip": 0.5469,
    "qr_eyebrow": 0.5469,
    "qr_name": 0.854,
    "qr_desc": 0.854,
    "qr_url": 0.5469,
    "cell": 0.729,
}
