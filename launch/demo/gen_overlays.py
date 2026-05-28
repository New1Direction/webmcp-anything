"""Generate watermark + title + end overlays as PNGs, for ffmpeg overlay use.

Produces:
  out/_overlay-watermark.png  — transparent, 'wmcp.sh' badge bottom-right
  out/_overlay-title.png      — solid 1280x720 title card
  out/_overlay-end.png        — solid 1280x720 end-of-video CTA card
"""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from pathlib import Path

OUT = Path(__file__).parent / "out"
OUT.mkdir(exist_ok=True)

# Try a few common font paths; fall back to default
def load_font(size, weight="regular"):
    candidates = [
        "/System/Library/Fonts/HelveticaNeue.ttc",
        "/System/Library/Fonts/Helvetica.ttc",
        "/Library/Fonts/Arial.ttf",
    ]
    for p in candidates:
        if Path(p).exists():
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                continue
    return ImageFont.load_default()


def mono_font(size):
    for p in ["/System/Library/Fonts/Menlo.ttc", "/System/Library/Fonts/Monaco.ttf"]:
        if Path(p).exists():
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                continue
    return ImageFont.load_default()


# ─── 1. Watermark badge (transparent PNG) ──────────────────────────
def make_watermark():
    W, H = 130, 38  # small pill, bottom-right corner placement done in ffmpeg
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    # Rounded-rect background
    draw.rounded_rectangle(
        [(0, 0), (W - 1, H - 1)],
        radius=10,
        fill=(0, 0, 0, 140),
        outline=(255, 255, 255, 30),
        width=1,
    )
    font = load_font(18)
    text = "wmcp.sh"
    bbox = draw.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.text(
        ((W - tw) // 2 - bbox[0], (H - th) // 2 - bbox[1]),
        text,
        fill=(236, 236, 245, 230),
        font=font,
    )
    out = OUT / "_overlay-watermark.png"
    img.save(out)
    print(f"  ✓ {out}  ({W}x{H})")


# ─── 2. Title card ─────────────────────────────────────────────────
def _subtle_glow(img, color):
    """Paint one subtle radial gradient — barely visible, just adds depth."""
    W, H = img.size
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ov = ImageDraw.Draw(overlay)
    # Single soft ellipse at low alpha, large radius
    for r in range(0, 500, 30):
        alpha = max(0, 10 - r // 60)
        ov.ellipse(
            [(W // 2 - 500 - r, H // 2 - 280 - r),
             (W // 2 + 500 + r, H // 2 + 280 + r)],
            fill=(*color, alpha),
        )
    overlay = overlay.filter(ImageFilter.GaussianBlur(40))
    return Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")


def make_title_card():
    W, H = 1280, 720
    img = Image.new("RGB", (W, H), (7, 7, 13))
    # Subtle purple glow only — minimal saturation
    img = _subtle_glow(img, (124, 92, 255))
    draw = ImageDraw.Draw(img)

    # "wmcp.sh" — large, white
    font_h1 = load_font(140)
    text_h1 = "wmcp.sh"
    bbox = draw.textbbox((0, 0), text_h1, font=font_h1)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.text(((W - tw) // 2 - bbox[0], H // 2 - th - 30), text_h1,
              fill=(255, 255, 255), font=font_h1)

    # tagline
    font_sub = load_font(34)
    sub = "Turn any URL into MCP tools your agent can call."
    bbox = draw.textbbox((0, 0), sub, font=font_sub)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.text(((W - tw) // 2 - bbox[0], H // 2 + 30 - bbox[1]), sub,
              fill=(160, 160, 184), font=font_sub)

    # watermark (consistent with the small badge)
    wm = Image.open(OUT / "_overlay-watermark.png")
    img.paste(wm, (W - wm.width - 28, H - wm.height - 22), wm)

    out = OUT / "_overlay-title.png"
    img.save(out)
    print(f"  ✓ {out}  (1280x720)")


# ─── 3. End card ───────────────────────────────────────────────────
def make_end_card():
    W, H = 1280, 720
    img = Image.new("RGB", (W, H), (7, 7, 13))
    img = _subtle_glow(img, (0, 229, 255))  # cyan tint, very subtle
    draw = ImageDraw.Draw(img)

    # CTA headline
    font_h1 = load_font(54)
    h = "Drop a URL. Get MCP tools. Free."
    bbox = draw.textbbox((0, 0), h, font=font_h1)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.text(((W - tw) // 2 - bbox[0], H // 2 - th - 30), h,
              fill=(255, 255, 255), font=font_h1)

    # URL
    font_url = mono_font(46)
    url = "https://wmcp.sh"
    bbox = draw.textbbox((0, 0), url, font=font_url)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.text(((W - tw) // 2 - bbox[0], H // 2 + 30 - bbox[1]), url,
              fill=(0, 229, 255), font=font_url)

    # watermark
    wm = Image.open(OUT / "_overlay-watermark.png")
    img.paste(wm, (W - wm.width - 28, H - wm.height - 22), wm)

    out = OUT / "_overlay-end.png"
    img.save(out)
    print(f"  ✓ {out}  (1280x720)")


if __name__ == "__main__":
    make_watermark()
    make_title_card()
    make_end_card()
