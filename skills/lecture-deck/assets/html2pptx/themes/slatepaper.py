"""Slate Paper — 차가운 회백 종이 + 슬레이트 네이비 + 코랄.

NotebookLM 이 체험학습 덱(46장)을 같은 노트북 안에서 생성한 v2 디자인본의
첫 덩어리(C1) 팔레트를 실측해 옮긴 것이다. 실측값:
  표지·구분 배경 #2B4053 / #36485C, 종이 #F4F8F9, 본문 #3E4550,
  코랄 헤더 #B17059 (wash #F3E8E3), 회청 보조 #808C9A (wash #E9ECF1), 테두리 #E3E7EA.
lectures/체험학습-.../theme-slatepaper.css 의 --sp-* 값과 1:1 로 맞춘다.
한쪽을 바꾸면 다른 쪽도 바꾼다.
"""

NAME = "slatepaper"
DETECT = "--sp-paper"

COLORS = {
    "BG":        "F4F8F9",   # --sp-paper   차가운 회백 종이
    "PAPER":     "FFFFFF",   # (하위호환)
    "TEXT":      "3E4550",   # --sp-body    본문 글자
    "SURFACE":   "FFFFFF",   # --sp-card    흰 카드
    "RULE_C":    "D4DBD9",   # --sp-rule    회청 테두리
    "INK":       "2B4053",   # --sp-ink     슬레이트 네이비
    "ACCENT":    "B17059",   # --sp-coral
    "ACCENT2":   "7F94A6",   # --sp-slate   회청 보조
    "FG_STRONG": "2B4053",   # 밝은 배경의 '강한 글자'는 잉크
    "MUTED":     "808C9A",   # --sp-muted
    "FG2":       "3E4550",   # --sp-body
    "CODE_BG":   "2B4053",   # 지시문·코드 블록은 네이비 판
    "CODE_FG":   "EEF3F5",
}

# 밝은 배경에서는 헤어라인이 거의 안 보인다. 테두리를 진하게, 면은 불투명하게.
ALPHA = {
    "RULE":        0.60,
    "RULE_STRONG": 0.80,
    "SURFACE_1":   1.00,     # 흰 카드
    "SURFACE_2":   1.00,
    "ACCENT_06":   0.10,
    "ACCENT_25":   0.45,
}

STYLE = {
    "card":         "shadow",        # 흰 면 + 부드러운 그림자 (v2 카드와 같은 인상)
    "case_card":    "left-bar",
    "dual":         "header-bar",    # 상단 채움 헤더 (네이비 / 회청)
    "rung_number":  "filled",        # 네이비 채움 원 + 흰 숫자
    "chk":          "accent2-fill",  # 회청 채움 + 흰 숫자
    "accent_run":   "bold",          # 코랄 볼드, 이탤릭 없음
    "eyebrow_prefix": "",
    "eyebrow_align":  "left",
    "h2_align":     "left",
    "case_lesson":    "bold",
    "case_rev":       "pill",
    "stat_num":     "ink",
    "source_bar":   "accent",
}

BACKGROUND = "slate"         # background.build_slate()
SCRIM = "light"
