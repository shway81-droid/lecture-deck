"""Warm Paper — 크림 종이 + 딥네이비 + 테라코타.

NotebookLM 이 같은 원고로 생성한 참고 덱에서 뽑은 팔레트다.
lectures/claude-cowork-.../theme.css 의 --wp-* 값과 1:1 로 맞춘다.
한쪽을 바꾸면 다른 쪽도 바꾼다.
"""

NAME = "warmpaper"
DETECT = "--wp-paper"

COLORS = {
    "BG":        "F3EFE7",   # --wp-paper   크림 종이
    "PAPER":     "FFFFFF",   # (하위호환)
    "TEXT":      "3E3D39",   # --wp-body   본문 글자
    "SURFACE":   "FFFFFF",   # --wp-card   흰 카드
    "RULE_C":    "D8D0C2",   # --wp-rule   따뜻한 회색 테두리
    "INK":       "21334A",   # --wp-ink     딥네이비
    "ACCENT":    "B0745C",   # --wp-terra
    "ACCENT2":   "909666",   # --wp-sage
    "FG_STRONG": "21334A",   # 밝은 배경에서 '강한 글자'는 흰색이 아니라 잉크다
    "MUTED":     "7A756C",   # --wp-muted
    "FG2":       "3E3D39",   # --wp-body
    "CODE_BG":   "21334A",   # 지시문·코드 블록은 네이비 판
    "CODE_FG":   "EFEAE0",
}

# 밝은 배경에서는 헤어라인이 거의 안 보인다. 테두리를 진하게, 면은 불투명하게.
ALPHA = {
    "RULE":        0.55,     # --wp-rule-soft 근처로 보이게
    "RULE_STRONG": 0.75,
    "SURFACE_1":   1.00,     # 흰 카드
    "SURFACE_2":   1.00,
    "ACCENT_06":   0.10,
    "ACCENT_25":   0.45,
}

STYLE = {
    "card":         "shadow",        # 흰 면 + 부드러운 그림자
    "case_card":    "left-bar",      # 좌측 테라코타 바
    "dual":         "header-bar",    # 상단 채움 헤더 (네이비 / 세이지)
    "rung_number":  "filled",        # 네이비 채움 원 + 흰 숫자
    "chk":          "accent2-fill",  # 세이지 채움 + 흰 숫자
    "accent_run":   "bold",          # 테라코타 볼드, 이탤릭 없음
    "eyebrow_prefix": "",
    "eyebrow_align":  "center",
    "h2_align":     "center",
    "case_lesson":    "bold",
    "case_rev":       "pill",
    "stat_num":     "ink",
    "source_bar":   "accent",
}

BACKGROUND = "warm"          # background.build_warm()
SCRIM = "light"
