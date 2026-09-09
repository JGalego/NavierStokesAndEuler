#!/usr/bin/env python3
"""Create an upload-ready YouTube thumbnail from the rendered proof animation."""

from __future__ import annotations

import argparse
import math
import shutil
import subprocess
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont

WIDTH = 1280
HEIGHT = 720
ROOT = Path(__file__).resolve().parent.parent
DEFAULT_VIDEO = ROOT / "ProofAnimation/build/navier-stokes-proof.mp4"
DEFAULT_OUTPUT = ROOT / "ProofAnimation/assets/navier-stokes-youtube-thumbnail.png"
DEFAULT_TIMESTAMP = 8.4
SANS_BOLD = Path("/usr/share/fonts/truetype/noto/NotoSans-Bold.ttf")


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
            horizontal = x / (WIDTH - 1)
            vertical = y / (HEIGHT - 1)
            glow = max(0.0, 1.0 - math.dist((x, y), (1000, 355)) / 720)
            r = int(4 + 5 * vertical + 4 * glow)
            g = int(10 + 10 * vertical + 20 * horizontal + 9 * glow)
            b = int(19 + 13 * vertical + 28 * horizontal + 17 * glow)
            pixels[x, y] = (r, g, b)
    return image


def proof_panel(frame: Image.Image) -> Image.Image:
    """Crop exactly to the goal box in the source frame."""
    panel = frame.crop((280, 261, 1001, 661))
    panel = ImageEnhance.Contrast(panel).enhance(1.08)
    panel = ImageEnhance.Brightness(panel).enhance(0.94)
    return panel.resize((580, 320), Image.Resampling.LANCZOS).convert("RGBA")


def draw_thumbnail(frame: Image.Image) -> Image.Image:
    image = background().convert("RGBA")

    panel = proof_panel(frame)
    shadow = Image.new("RGBA", (620, 360), (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rectangle((20, 20, 600, 340), fill=(0, 0, 0, 185))
    shadow = shadow.filter(ImageFilter.GaussianBlur(20))
    image.alpha_composite(shadow, (630, 183))
    image.alpha_composite(panel, (650, 203))

    draw = ImageDraw.Draw(image)
    label_font = font(SANS_BOLD, 27)
    title_font = font(SANS_BOLD, 54)
    proof_font = font(SANS_BOLD, 96)
    motion_font = font(SANS_BOLD, 105)

    draw.text((62, 133), "LEAN 4  ·  ℝ³", font=label_font, fill=(91, 207, 229, 255))
    draw.rectangle((62, 184, 121, 190), fill=(231, 211, 71, 255))
    draw.text((59, 217), "NAVIER–STOKES", font=title_font, fill=(232, 239, 243, 255))
    draw.text((53, 289), "PROOF IN", font=proof_font, fill=(232, 239, 243, 255))
    draw.text((53, 395), "MOTION", font=motion_font, fill=(231, 211, 71, 255))

    return image.convert("RGB")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--video", type=Path, default=DEFAULT_VIDEO)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--timestamp", type=float, default=DEFAULT_TIMESTAMP)
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
