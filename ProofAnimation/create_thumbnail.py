#!/usr/bin/env python3
"""Create an upload-ready YouTube thumbnail from the rendered proof animation."""

from __future__ import annotations

import argparse
import math
import shutil
import subprocess
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont, ImageOps

WIDTH = 1280
HEIGHT = 720
ROOT = Path(__file__).resolve().parent.parent
DEFAULT_VIDEO = ROOT / "ProofAnimation/build/navier-stokes-proof.mp4"
DEFAULT_OUTPUT = ROOT / "ProofAnimation/assets/navier-stokes-youtube-thumbnail.png"
SANS_BOLD = Path("/usr/share/fonts/truetype/noto/NotoSans-Bold.ttf")
MONO_BOLD = Path("/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf")


def font(path: Path, size: int) -> ImageFont.FreeTypeFont:
    if not path.exists():
        raise FileNotFoundError(f"required font not found: {path}")
    return ImageFont.truetype(str(path), size=size)


def extract_frame(video: Path, destination: Path, timestamp: float) -> None:
    ffmpeg = shutil.which("ffmpeg")
    if ffmpeg is None:
        raise RuntimeError("ffmpeg is required to extract the proof frame")
    subprocess.run(
        [
            ffmpeg,
            "-hide_banner",
            "-loglevel",
            "error",
            "-ss",
            str(timestamp),
            "-i",
            str(video),
            "-frames:v",
            "1",
            "-y",
            str(destination),
        ],
        check=True,
    )


def background() -> Image.Image:
    image = Image.new("RGB", (WIDTH, HEIGHT))
    pixels = image.load()
    for y in range(HEIGHT):
        for x in range(WIDTH):
            vertical = y / (HEIGHT - 1)
            glow = max(0.0, 1.0 - math.dist((x, y), (970, 350)) / 850)
            r = int(5 + 7 * vertical + 3 * glow)
            g = int(13 + 17 * vertical + 23 * glow)
            b = int(25 + 26 * vertical + 35 * glow)
            pixels[x, y] = (r, g, b)
    return image


def cubic_curve(p0, p1, p2, p3, samples: int = 100):
    points = []
    for index in range(samples + 1):
        t = index / samples
        u = 1 - t
        x = u**3 * p0[0] + 3 * u**2 * t * p1[0] + 3 * u * t**2 * p2[0] + t**3 * p3[0]
        y = u**3 * p0[1] + 3 * u**2 * t * p1[1] + 3 * u * t**2 * p2[1] + t**3 * p3[1]
        points.append((x, y))
    return points


def add_flow_lines(image: Image.Image) -> None:
    flow = Image.new("RGBA", image.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(flow)
    colors = [
        (41, 221, 255, 125),
        (26, 180, 231, 88),
        (255, 212, 55, 92),
    ]
    for index, offset in enumerate(range(-105, 136, 40)):
        points = cubic_curve(
            (-90, 570 + offset),
            (215, 380 + offset),
            (390, 760 + offset),
            (720, 565 + offset),
        )
        draw.line(points, fill=colors[index % len(colors)], width=3)
        if index % 2 == 0:
            dot_x, dot_y = points[78]
            draw.ellipse((dot_x - 5, dot_y - 5, dot_x + 5, dot_y + 5), fill=(255, 218, 56, 195))

    for radius, alpha in ((86, 80), (118, 56), (154, 36)):
        box = (1010 - radius, 560 - radius, 1010 + radius, 560 + radius)
        draw.arc(box, 195, 500, fill=(35, 215, 247, alpha), width=3)

    flow = flow.filter(ImageFilter.GaussianBlur(0.8))
    image.alpha_composite(flow)


def rounded_card(frame: Image.Image) -> Image.Image:
    crop = frame.crop((340, 225, 930, 655))
    crop = ImageEnhance.Contrast(crop).enhance(1.18)
    crop = ImageEnhance.Brightness(crop).enhance(0.92)
    crop = ImageOps.fit(crop, (520, 386), method=Image.Resampling.LANCZOS)

    card = Image.new("RGBA", (552, 430), (0, 0, 0, 0))
    card_draw = ImageDraw.Draw(card)
    card_draw.rounded_rectangle((4, 4, 547, 425), radius=27, fill=(2, 7, 14, 255), outline=(255, 218, 56, 255), width=5)

    mask = Image.new("L", crop.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, crop.width - 1, crop.height - 1), radius=20, fill=255)
    card.paste(crop, (16, 27), mask)

    tag_font = font(SANS_BOLD, 18)
    card_draw.rounded_rectangle((285, 5, 531, 43), radius=16, fill=(255, 218, 56, 255))
    card_draw.text((305, 12), "ACTUAL LEAN GOAL", font=tag_font, fill=(7, 15, 27, 255))
    return card.rotate(-2.2, resample=Image.Resampling.BICUBIC, expand=True)


def draw_thumbnail(frame: Image.Image) -> Image.Image:
    image = background().convert("RGBA")
    add_flow_lines(image)

    glow = Image.new("RGBA", image.size, (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.ellipse((690, 80, 1320, 690), fill=(24, 194, 232, 36))
    glow = glow.filter(ImageFilter.GaussianBlur(90))
    image.alpha_composite(glow)

    card = rounded_card(frame)
    shadow = Image.new("RGBA", card.size, (0, 0, 0, 0))
    shadow.paste((0, 0, 0, 185), (0, 0, card.width, card.height), card.getchannel("A"))
    shadow = shadow.filter(ImageFilter.GaussianBlur(24))
    image.alpha_composite(shadow, (684, 151))
    image.alpha_composite(card, (666, 124))

    draw = ImageDraw.Draw(image)
    badge_font = font(SANS_BOLD, 24)
    title_font = font(SANS_BOLD, 57)
    proof_font = font(SANS_BOLD, 126)
    motion_font = font(SANS_BOLD, 73)
    subtitle_font = font(SANS_BOLD, 23)
    equation_font = font(MONO_BOLD, 22)

    draw.rounded_rectangle((58, 46, 506, 94), radius=22, fill=(17, 48, 68, 235), outline=(45, 220, 250, 190), width=2)
    draw.ellipse((78, 62, 94, 78), fill=(42, 221, 250, 255))
    draw.text((108, 55), "LEAN 4  •  46 PROOF STEPS  •  ℝ³", font=badge_font, fill=(225, 245, 250, 255))

    draw.text((58, 133), "NAVIER–STOKES", font=title_font, fill=(242, 247, 250, 255), stroke_width=1, stroke_fill=(2, 8, 16, 255))
    draw.text((52, 194), "PROOF", font=proof_font, fill=(255, 218, 56, 255), stroke_width=3, stroke_fill=(5, 14, 25, 255))
    draw.text((59, 325), "IN MOTION", font=motion_font, fill=(242, 247, 250, 255), stroke_width=2, stroke_fill=(5, 14, 25, 255))
    draw.rounded_rectangle((60, 420, 570, 466), radius=17, fill=(11, 29, 44, 220))
    draw.text((80, 430), "WHOLE-SPACE BREAKDOWN ARGUMENT", font=subtitle_font, fill=(51, 219, 247, 255))

    draw.line((60, 498, 572, 498), fill=(255, 218, 56, 210), width=4)
    draw.text((60, 521), "∂ₜu + (u·∇)u − νΔu + ∇p = f", font=equation_font, fill=(203, 223, 234, 230))

    draw.rounded_rectangle((895, 624, 1218, 680), radius=22, fill=(4, 13, 24, 235), outline=(255, 218, 56, 210), width=2)
    draw.text((927, 638), "FORMALLY CHECKED", font=subtitle_font, fill=(255, 226, 82, 255))

    return image.convert("RGB")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--video", type=Path, default=DEFAULT_VIDEO)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--timestamp", type=float, default=30.0)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    if not args.video.is_file():
        raise FileNotFoundError(f"rendered proof video not found: {args.video}")
    args.output.parent.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory(prefix="navier-thumbnail-") as directory:
        frame_path = Path(directory) / "proof-frame.png"
        extract_frame(args.video, frame_path, args.timestamp)
        frame = Image.open(frame_path).convert("RGB")
        thumbnail = draw_thumbnail(frame)

    thumbnail.save(args.output, format="PNG", optimize=True)
    jpeg_output = args.output.with_suffix(".jpg")
    thumbnail.save(jpeg_output, format="JPEG", quality=94, subsampling=0, optimize=True, progressive=True)
    print(f"Wrote {args.output}")
    print(f"Wrote {jpeg_output}")


if __name__ == "__main__":
    main()
