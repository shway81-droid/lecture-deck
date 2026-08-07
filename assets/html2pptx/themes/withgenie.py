"""WithGenie — 검정 배경 + 지니그린. 스킬 기본 테마.

assets/template/theme.css 의 :root 값을 그대로 옮긴 것이다.
알파를 쓸 수 없는 자리(글자색)는 검정 배경 위에서 합성한 근사값을 쓴다.
"""

NAME = "withgenie"
DETECT = "--wg-bg"          # template/theme.css 에 있는 변수

COLORS = {
    "BG":        "0A0A0A",   # --wg-bg
    "PAPER":     "F4F4EE",   # --wg-paper (하위호환)
    "TEXT":      "F4F4EE",   # 본문 글자
    "SURFACE":   "F4F4EE",   # 카드 면 (알파 3% 로 깔린다)
    "RULE_C":    "F4F4EE",   # 테두리·구분선 (알파 12%)
    "INK":       "0E0E0E",   # --wg-ink    (그린 위 글자)
    "ACCENT":    "00E054",   # --wg-green
    "ACCENT2":   "00E054",   # 보조 강조가 따로 없다
    "FG_STRONG": "FFFFFF",
    "MUTED":     "8B8B87",   # paper 55% over bg
    "FG2":       "C1C1BC",   # paper 78% over bg
    "CODE_BG":   None,       # None = 카드 면(surface)을 그대로 쓴다
    "CODE_FG":   "F4F4EE",
}

ALPHA = {
    "RULE":        0.12,
    "RULE_STRONG": 0.20,
    "SURFACE_1":   0.03,
    "SURFACE_2":   0.06,
    "ACCENT_06":   0.06,
    "ACCENT_25":   0.25,
}

STYLE = {
    "card":         "hairline",      # 투명 면 + 헤어라인 테두리
    "case_card":    "brackets",      # 그린 코너 브래킷
    "dual":         "left-bar",      # 좌측 2px 바
    "rung_number":  "outline",       # 그린 외곽선 원 + 그린 숫자
    "chk":          "accent-fill",   # 그린 채움 + 잉크 숫자
    "accent_run":   "serif-italic",  # 세리프 이탤릭 그린
    "eyebrow_prefix": "— ",
    "eyebrow_align":  "left",
    "h2_align":     "left",
    "case_lesson":    "serif",
    "case_rev":       "plain",
    "stat_num":     "accent",
    "source_bar":   "accent",
}

BACKGROUND = "signature"     # background.build()
SCRIM = "dark"
