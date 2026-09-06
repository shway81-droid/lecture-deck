"""Grid Paper — 흰 종이 + 슬레이트 잉크 + 파랑 강조, 초록·코랄 보조.

NotebookLM 이 「소스 한 벌로 수업자료 다섯 벌」 덱(34장)으로 생성한 디자인본에서
색을 실측해 옮긴 것이다. 실측값:
  종이 #FFFFFF, 잉크 #293541, 파랑 #3275C3, 초록 #4BB074, 코랄 #C25C5A,
  파랑 wash #EAF1F7, 초록 wash #F3F9F5, 코랄 wash #F7F1F1

warmpaper·slatepaper 와 달리 **긍정/부정을 초록·코랄로 나눠 쓰는** 것이 특징이다.
lectures/notebooklm-실전-수업자료-다섯벌/theme.css 의 --gp-* 값과 1:1 로 맞춘다.
한쪽을 바꾸면 다른 쪽도 바꾼다.
"""

NAME = "gridpaper"
DETECT = "--gp-paper"

COLORS = {
    "BG":        "FFFFFF",   # --gp-paper   흰 종이
    "PAPER":     "FFFFFF",   # (하위호환)
    "TEXT":      "3A4552",   # --gp-body    본문 글자
    "SURFACE":   "FFFFFF",   # --gp-card    흰 카드
    "RULE_C":    "D9E1EA",   # --gp-rule    옅은 청회색 테두리
    "INK":       "293541",   # --gp-ink     슬레이트 잉크
    "ACCENT":    "3275C3",   # --gp-blue    파랑 강조
    "ACCENT2":   "4BB074",   # --gp-green   초록 보조
    "FG_STRONG": "293541",   # 밝은 배경의 '강한 글자'는 잉크
    "MUTED":     "7B8794",   # --gp-muted
    "FG2":       "3A4552",   # --gp-body
    "CODE_BG":   "293541",   # 지시문·코드 블록은 잉크 판
    "CODE_FG":   "EDF2F7",
}

# 흰 배경에서는 헤어라인이 거의 안 보인다. 테두리를 진하게, 면은 불투명하게.
ALPHA = {
    "RULE":        0.65,
    "RULE_STRONG": 0.85,
    "SURFACE_1":   1.00,
    "SURFACE_2":   1.00,
    "ACCENT_06":   0.10,
    "ACCENT_25":   0.45,
}

STYLE = {
    "card":         "shadow",        # 흰 면 + 옅은 그림자
    "case_card":    "left-bar",
    "dual":         "header-bar",    # 상단 채움 헤더 (초록 / 코랄)
    "rung_number":  "filled",        # 잉크 채움 원 + 흰 숫자
    "chk":          "accent2-fill",  # 초록 채움 + 흰 숫자
    "accent_run":   "bold",          # 파랑 볼드, 이탤릭 없음
    "eyebrow_prefix": "",
    "eyebrow_align":  "left",
    "h2_align":     "left",
    "case_lesson":    "bold",
    "case_rev":       "pill",
    "stat_num":     "ink",
    "source_bar":   "accent",
}

BACKGROUND = "grid"          # background.build_grid()
SCRIM = "light"
