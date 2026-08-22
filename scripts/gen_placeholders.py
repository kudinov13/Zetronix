"""Generate placeholder media assets for the studio site.

Creates WebP placeholders:
- hero-poster.webp (1920x1080) - dark grid-of-cards poster matching the video concept
- media/templates/*.webp (800x600) - template preview placeholders
- media/team/*.webp (600x800) - team portrait placeholders

Replace with real assets before production.
"""
import math
import os
import random

from PIL import Image, ImageDraw

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public")
BG = (16, 18, 22)
SURFACE = (21, 24, 29)
BORDER = (38, 42, 50)
ACCENT = (232, 163, 61)
MUTED = (90, 96, 106)


def save(img: Image.Image, rel: str) -> None:
    path = os.path.join(ROOT, rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    img.save(path, "WEBP", quality=82)
    print("wrote", rel)


def rounded(draw: ImageDraw.ImageDraw, box, radius, fill=None, outline=None, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def template_preview(slug: str, title: str, accent_shift: int) -> None:
    w, h = 800, 600
    img = Image.new("RGB", (w, h), BG)
    d = ImageDraw.Draw(img)
    accent = ACCENT if accent_shift % 2 == 0 else (232, 163, 61)
    # faux browser chrome
    rounded(d, (24, 24, w - 24, h - 24), 16, fill=SURFACE, outline=BORDER, width=2)
    d.ellipse((48, 46, 60, 58), fill=BORDER)
    d.ellipse((68, 46, 80, 58), fill=BORDER)
    d.ellipse((88, 46, 100, 58), fill=BORDER)
    rounded(d, (120, 42, w - 48, 62), 10, fill=BG, outline=BORDER)
    # faux hero block
    rounded(d, (48, 92, w - 48, 260), 12, fill=(26, 29, 35), outline=BORDER)
    rounded(d, (72, 130, 360, 158), 8, fill=accent)
    rounded(d, (72, 172, 300, 188), 6, fill=MUTED)
    rounded(d, (72, 200, 240, 214), 6, fill=BORDER)
    # faux cards row
    for i in range(3):
        x0 = 48 + i * ((w - 96 - 32) // 3 + 16)
        x1 = x0 + (w - 96 - 32) // 3
        rounded(d, (x0, 292, x1, 420), 12, fill=BG, outline=BORDER)
        rounded(d, (x0 + 20, 316, x0 + 90, 332), 6, fill=MUTED)
        rounded(d, (x0 + 20, 348, x1 - 20, 362), 6, fill=BORDER)
        rounded(d, (x0 + 20, 372, x1 - 60, 386), 6, fill=BORDER)
    # faux footer strip
    rounded(d, (48, 452, w - 48, 500), 12, fill=(26, 29, 35), outline=BORDER)
    save(img, os.path.join("media", "templates", f"{slug}.webp"))


def team_photo(pid: str, seed: int) -> None:
    w, h = 600, 800
    rng = random.Random(seed)
    img = Image.new("RGB", (w, h), BG)
    d = ImageDraw.Draw(img)
    # subtle diagonal texture
    for i in range(-h, w, 46):
        shade = 20 + rng.randint(0, 8)
        d.line((i, 0, i + h, h), fill=(shade, shade + 2, shade + 5), width=1)
    # abstract portrait silhouette placeholder
    cx = w // 2
    d.ellipse((cx - 110, 180, cx + 110, 400), fill=(38, 42, 50))
    d.ellipse((cx - 190, 400, cx + 190, 760), fill=(38, 42, 50))
    d.ellipse((cx - 110, 180, cx + 110, 400), outline=ACCENT, width=3)
    d.arc((cx - 190, 400, cx + 190, 760), start=180, end=360, fill=ACCENT, width=3)
    save(img, os.path.join("media", "team", f"{pid}.webp"))


def hero_poster() -> None:
    w, h = 1920, 1080
    img = Image.new("RGB", (w, h), (10, 11, 13))
    d = ImageDraw.Draw(img)
    rng = random.Random(7)
    # perspective-ish grid of glowing cards ("living grid" first frame)
    cols, rows = 8, 5
    cw, ch = 220, 140
    gap = 36
    ox, oy = (w - cols * (cw + gap)) // 2, (h - rows * (ch + gap)) // 2
    cx, cy = w * 0.62, h * 0.35
    for r in range(rows):
        for c in range(cols):
            x0 = ox + c * (cw + gap)
            y0 = oy + r * (ch + gap)
            dist = math.hypot(x0 + cw / 2 - cx, y0 + ch / 2 - cy)
            glow = max(0.0, 1.0 - dist / 900)
            base = 20 + int(14 * glow)
            fill = (base, base + 3, base + 7)
            rounded(d, (x0, y0, x0 + cw, y0 + ch), 12, fill=fill)
            if glow > 0.55:
                a = int(120 * glow)
                d.rounded_rectangle(
                    (x0, y0, x0 + cw, y0 + ch),
                    radius=12,
                    outline=(ACCENT[0], ACCENT[1], ACCENT[2]),
                    width=2,
                )
                inner = (min(255, base + a // 4),) * 3
                rounded(d, (x0 + 14, y0 + 16, x0 + 90, y0 + 28), 6, fill=(base + 30, base + 28, base + 20))
            else:
                rounded(d, (x0 + 14, y0 + 16, x0 + 90, y0 + 28), 6, fill=(base + 12, base + 14, base + 18))
            rounded(d, (x0 + 14, y0 + 40, x0 + cw - 40, y0 + 50), 5, fill=(base + 8, base + 10, base + 14))
            rounded(d, (x0 + 14, y0 + 60, x0 + cw - 80, y0 + 68), 5, fill=(base + 6, base + 8, base + 12))
    # vignette
    for i in range(60):
        alpha = i / 60
        shade = int(10 + 6 * (1 - alpha))
        d.rectangle((0, h - i * 4, w, h), outline=None)
    save(img, os.path.join("media", "hero-poster.webp"))


def main() -> None:
    templates = [
        "kofeinya", "salon-aura", "avtoservis-pro", "stroymontazh",
        "fitnes-atlant", "shop-domashniy", "portfolio-foto", "klinika-zdorovie",
    ]
    for i, slug in enumerate(templates):
        template_preview(slug, slug, i)
    for i, pid in enumerate(["artem", "maria", "ilya", "dasha"]):
        team_photo(pid, seed=100 + i)
    hero_poster()
    print("done")


if __name__ == "__main__":
    main()
