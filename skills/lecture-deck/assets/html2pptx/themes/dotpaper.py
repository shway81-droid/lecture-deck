"""Dot Paper — 크림 종이 + 점 그리드 + 청록 강조, 초록·코랄 보조.

NotebookLM 이 「L1 · 말로 시켜서 수업 자료 한 장」 덱(33장)으로 생성한 디자인본에서
색을 실측해 옮긴 것이다. 실측값:
  종이 #F7F7EF, 잉크 #12130F, 청록 #00A0C7, 진청록 #025D78,
  초록 #499856, 코랄 #EB7C68, 민트 wash #DAEBE3, 코랄 wash #FCEAE6,
  코드판 #E3E9F5, 형광펜 #FCF914

gridpaper 와 갈리는 점은 셋이다:
  ① 흰 종이가 아니라 **크림**이고 모눈이 아니라 **점 그리드**다.
  ② 코드·지시문 판이 어두운 잉크가 아니라 **밝은 연청색**이다.
  ③ 사다리 번호가 원이 아니라 **꽉 찬 사각 블록**이다.

lectures/L1-말로-시켜서-수업자료-한-장/theme.css 의 --dp-* 값과 1:1 로 맞춘다.
한쪽을 바꾸면 다른 쪽도 바꾼다.
"""

NAME = "dotpaper"
DETECT = "--dp-paper"

COLORS = {
    "BG":        "F7F7EF",   # --dp-paper     크림 종이
    "PAPER":     "F7F7EF",   # (하위호환)
    "TEXT":      "33362E",   # --dp-ink-2     본문 글자
    "SURFACE":   "FFFFFF",   # 흰 카드
    "RULE_C":    "C3CEE6",   # --dp-code-line 옅은 청회색 테두리
    "INK":       "12130F",   # --dp-ink       거의 검정
    "ACCENT":    "00A0C7",   # --dp-teal      청록 강조
    "ACCENT2":   "499856",   # --dp-green     초록 보조
    "ACCENT3":   "EB7C68",   # --dp-coral     코랄 (하지 말 것)
    "FG_STRONG": "12130F",   # 밝은 배경의 '강한 글자'는 잉크
    "MUTED":     "6B6E63",   # --dp-muted
    "FG2":       "33362E",   # --dp-ink-2
    "CODE_BG":   "E3E9F5",   # --dp-code-bg   밝은 연청색 판
    "CODE_FG":   "12130F",   # 그 위의 글자는 잉크
}

# 크림 배경에서도 헤어라인은 잘 안 보인다. 테두리를 진하게, 면은 불투명하게.
ALPHA = {
    "RULE":        0.70,
    "RULE_STRONG": 0.90,
    "SURFACE_1":   1.00,
    "SURFACE_2":   1.00,
    "ACCENT_06":   0.10,
    "ACCENT_25":   0.45,
}

STYLE = {
    "card":         "flat",          # 그림자 없는 평면 패널
    "case_card":    "left-bar",
    "dual":         "left-bar",      # 왼쪽 굵은 색 바 (초록 / 코랄)
    "rung_number":  "block",         # 청록 사각 블록 + 흰 숫자
    "chk":          "accent2-glyph",  # 채움 배지 없이 초록 체크 글자만
    "accent_run":   "bold",          # 청록 볼드, 이탤릭 없음
    "eyebrow_prefix": "",
    "eyebrow_align":  "left",
    "h2_align":     "left",
    "case_lesson":    "bold",
    "case_rev":       "pill",
    "stat_num":     "ink",
    "source_bar":   "accent",
}

BACKGROUND = "dot"           # background.build_dot()
SCRIM = "light"
