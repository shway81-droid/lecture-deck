"""PPTX 테마 레지스트리.

테마 모듈 하나가 팔레트·도형 선택·배경 생성기를 함께 선언한다.
덱 폴더의 theme.css 에서 각 테마의 DETECT 문자열을 찾아 자동으로 고른다.
"""

from . import dotpaper, gridpaper, slatepaper, warmpaper, withgenie

REGISTRY = {m.NAME: m for m in (withgenie, warmpaper, slatepaper, gridpaper, dotpaper)}
DEFAULT = withgenie.NAME


def get(name):
    if name not in REGISTRY:
        raise SystemExit(
            f"모르는 테마: {name}\n사용 가능: {', '.join(sorted(REGISTRY))}"
        )
    return REGISTRY[name]


def detect(theme_css_path):
    """theme.css 를 읽어 테마 이름을 돌려준다. 못 찾으면 None."""
    try:
        css = theme_css_path.read_text(encoding="utf-8")
    except OSError:
        return None
    # 여러 테마의 표식이 함께 있을 수 있다. 기본 테마 위에 오버라이드 층을 덧붙인
    # theme.css 가 그렇다. CSS 캐스케이드와 같게 **뒤에 오는 쪽**을 고른다.
    hits = [(css.rfind(mod.DETECT), name)
            for name, mod in REGISTRY.items()
            if mod.DETECT and mod.DETECT in css]
    if not hits:
        return None
    return max(hits)[1]
