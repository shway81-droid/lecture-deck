"""덱의 시그니처 배경을 PNG 한 장으로 굽는다.

theme.css 의 .reveal-viewport::before / ::after 를 그대로 옮긴 것:
  ::before  radial-gradient(circle at 0% 0%,    rgba(0,224,84,.12),  transparent 50%)
            radial-gradient(circle at 100% 100%, rgba(183,148,246,.10), transparent 55%)
  ::after   84x84 격자에 찍힌 그린 점, opacity .22, drop-shadow(0 0 4px green)

PPTX 도형으로는 재현이 안 되는 층이라 이미지로 굽되, 배경에만 쓰므로
그 위의 본문은 전부 편집 가능한 텍스트로 남는다.
"""

from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

from theme import CANVAS_H, CANVAS_W

SCALE = 2  # 2560 x 1440


def _radial(w, h, cx, cy, radius, rgb, peak_alpha):
    """중심에서 radius 까지 알파가 선형으로 0 이 되는 원형 글로우 (RGBA float)."""
    ys, xs = np.mgrid[0:h, 0:w]
    dist = np.hypot(xs - cx, ys - cy)
    a = np.clip(1.0 - dist / radius, 0.0, 1.0) * peak_alpha
    layer = np.zeros((h, w, 4), dtype=np.float32)
    layer[..., 0] = rgb[0]
    layer[..., 1] = rgb[1]
    layer[..., 2] = rgb[2]
    layer[..., 3] = a
    return layer


def _over(base_rgb, layer):
    """straight-alpha source-over 합성."""
    a = layer[..., 3:4]
    return base_rgb * (1 - a) + layer[..., :3] * a


def build(out_path: Path) -> Path:
    w, h = CANVAS_W * SCALE, CANVAS_H * SCALE

    # farthest-corner: 두 글로우 모두 대각선 길이를 기준으로 한다
    diag = float(np.hypot(w, h))

    base = np.zeros((h, w, 3), dtype=np.float32)
    base[...] = np.array([0x0A, 0x0A, 0x0A], dtype=np.float32)

    base = _over(base, _radial(w, h, 0, 0, diag * 0.50, (0, 224, 84), 0.12))
    base = _over(base, _radial(w, h, w, h, diag * 0.55, (183, 148, 246), 0.10))

    img = Image.fromarray(np.clip(base, 0, 255).astype(np.uint8), "RGB")

    # ---- 점 격자 -----------------------------------------------------------
    step = 84 * SCALE
    off_x, off_y = 12 * SCALE, 18 * SCALE
    r = 1.4 * SCALE  # transparent 가 되는 반경

    dots = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(dots)
    y = off_y
    while y < h + step:
        x = off_x
        while x < w + step:
            d.ellipse([x - r, y - r, x + r, y + r], fill=255)
            x += step
        y += step

    # drop-shadow(0 0 4px green) 흉내
    glow = dots.filter(ImageFilter.GaussianBlur(4 * SCALE))

    green = Image.new("RGB", (w, h), (0x00, 0xE0, 0x54))
    img = Image.composite(green, img, glow.point(lambda v: int(v * 0.22 * 0.6)))
    img = Image.composite(green, img, dots.point(lambda v: int(v * 0.22)))

    out_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(out_path, "PNG", optimize=True)
    return out_path


def build_warm(out_path: Path) -> Path:
    """Warm Paper 배경 — 크림 종이에 왼쪽 위에서 빛이 드는 느낌.

    lectures/claude-cowork-.../theme.css 의 .reveal-viewport::before 와 같은 구성:
      radial(115% 90% at 8% -10%, #FBF9F4)  +  radial(90% 70% at 100% 108%, terra .07)
    """
    w, h = CANVAS_W * SCALE, CANVAS_H * SCALE

    base = np.zeros((h, w, 3), dtype=np.float32)
    base[...] = np.array([0xF3, 0xEF, 0xE7], dtype=np.float32)   # --wp-paper

    # 왼쪽 위 하이라이트 (타원형)
    ys, xs = np.mgrid[0:h, 0:w]
    d1 = np.hypot((xs - 0.08 * w) / (1.15 * w), (ys + 0.10 * h) / (0.90 * h))
    a1 = np.clip(1.0 - d1 / 0.62, 0.0, 1.0)[..., None]
    base = base * (1 - a1) + np.array([0xFB, 0xF9, 0xF4], dtype=np.float32) * a1

    # 오른쪽 아래 옅은 테라코타
    d2 = np.hypot((xs - w) / (0.90 * w), (ys - 1.08 * h) / (0.70 * h))
    a2 = (np.clip(1.0 - d2 / 0.60, 0.0, 1.0) * 0.07)[..., None]
    base = base * (1 - a2) + np.array([0xB0, 0x74, 0x5C], dtype=np.float32) * a2

    img = Image.fromarray(np.clip(base, 0, 255).astype(np.uint8), "RGB")
    out_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(out_path, "PNG", optimize=True)
    return out_path


def build_slate(out_path: Path) -> Path:
    """Slate Paper 배경 — 차가운 회백 종이, 왼쪽 위 흰 하이라이트, 오른쪽 아래 옅은 회청.

    themes/slatepaper.py 팔레트와 맞춘다: paper #F4F8F9, 하이라이트 #FFFFFF, 회청 #7F94A6.
    """
    w, h = CANVAS_W * SCALE, CANVAS_H * SCALE

    base = np.zeros((h, w, 3), dtype=np.float32)
    base[...] = np.array([0xF4, 0xF8, 0xF9], dtype=np.float32)   # --sp-paper

    ys, xs = np.mgrid[0:h, 0:w]
    d1 = np.hypot((xs - 0.08 * w) / (1.15 * w), (ys + 0.10 * h) / (0.90 * h))
    a1 = np.clip(1.0 - d1 / 0.62, 0.0, 1.0)[..., None]
    base = base * (1 - a1) + np.array([0xFF, 0xFF, 0xFF], dtype=np.float32) * a1

    d2 = np.hypot((xs - w) / (0.90 * w), (ys - 1.08 * h) / (0.70 * h))
    a2 = (np.clip(1.0 - d2 / 0.60, 0.0, 1.0) * 0.08)[..., None]
    base = base * (1 - a2) + np.array([0x7F, 0x94, 0xA6], dtype=np.float32) * a2

    img = Image.fromarray(np.clip(base, 0, 255).astype(np.uint8), "RGB")
    out_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(out_path, "PNG", optimize=True)
    return out_path


def build_grid(out_path: Path) -> Path:
    """Grid Paper 배경 — 흰 종이에 옅은 청회색 모눈.

    themes/gridpaper.py 팔레트와 맞춘다: paper #FFFFFF, 모눈 #D9E1EA 를 아주 옅게.
    """
    w, h = CANVAS_W * SCALE, CANVAS_H * SCALE

    base = np.zeros((h, w, 3), dtype=np.float32)
    base[...] = np.array([0xFF, 0xFF, 0xFF], dtype=np.float32)

    # 모눈: 48px 간격, 알파 0.22
    step = 48 * SCALE
    line = np.array([0xD9, 0xE1, 0xEA], dtype=np.float32)
    a = 0.22
    base[::step, :, :] = base[::step, :, :] * (1 - a) + line * a
    base[:, ::step, :] = base[:, ::step, :] * (1 - a) + line * a

    # 오른쪽 아래 아주 옅은 파랑
    ys, xs = np.mgrid[0:h, 0:w]
    d2 = np.hypot((xs - w) / (0.92 * w), (ys - 1.06 * h) / (0.72 * h))
    a2 = (np.clip(1.0 - d2 / 0.60, 0.0, 1.0) * 0.05)[..., None]
    base = base * (1 - a2) + np.array([0x32, 0x75, 0xC3], dtype=np.float32) * a2

    img = Image.fromarray(np.clip(base, 0, 255).astype(np.uint8), "RGB")
    out_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(out_path, "PNG", optimize=True)
    return out_path


def build_scrim(out_path: Path) -> Path:
    """concept 슬라이드의 왼→오 어둠 스크림 (theme.css .concept::before).

    linear-gradient(90deg, rgba(10,10,10,.94) 0%, .86 26%, .55 46%, 0 64%)
    도형 몇 장으로 근사하면 띠 경계가 보이므로 PNG 로 부드럽게 굽는다.
    """
    w, h = CANVAS_W, CANVAS_H
    stops = [(0.00, 0.94), (0.26, 0.86), (0.46, 0.55), (0.64, 0.0), (1.0, 0.0)]
    xs = np.linspace(0.0, 1.0, w)
    alpha = np.interp(xs, [s[0] for s in stops], [s[1] for s in stops])

    rgba = np.zeros((h, w, 4), dtype=np.uint8)
    rgba[..., 0] = 0x0A
    rgba[..., 1] = 0x0A
    rgba[..., 2] = 0x0A
    rgba[..., 3] = (alpha * 255).astype(np.uint8)[None, :]

    out_path.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(rgba, "RGBA").save(out_path, "PNG", optimize=True)
    return out_path


if __name__ == "__main__":
    import sys

    target = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("pptx-bg.png")
    p = build(target)
    print(f"wrote {p} ({p.stat().st_size / 1024:.0f} KB)")
    s = build_scrim(target.with_name("pptx-scrim.png"))
    print(f"wrote {s} ({s.stat().st_size / 1024:.0f} KB)")
