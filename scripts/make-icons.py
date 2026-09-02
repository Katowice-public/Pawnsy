#!/usr/bin/env python3
"""Generate Pawnsy PNG icons: a brass pawn on an ink-dark tile."""

from __future__ import annotations

import math
import os
import struct
import zlib

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "extension", "icons")


def png_rgba(width: int, height: int, pixels: list[int]) -> bytes:
    raw = bytearray()
    for y in range(height):
        raw.append(0)
        start = y * width * 4
        raw.extend(pixels[start : start + width * 4])

    def chunk(tag: bytes, data: bytes) -> bytes:
        return (
            struct.pack(">I", len(data))
            + tag
            + data
            + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
        )

    return b"".join(
        [
            b"\x89PNG\r\n\x1a\n",
            chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)),
            chunk(b"IDAT", zlib.compress(bytes(raw), 9)),
            chunk(b"IEND", b""),
        ]
    )


def blend(dst: list[int], width: int, x: int, y: int, r: int, g: int, b: int, a: float) -> None:
    if a <= 0 or x < 0 or y < 0 or x >= width:
        return
    h = len(dst) // (width * 4)
    if y >= h:
        return
    i = (y * width + x) * 4
    da = dst[i + 3] / 255.0
    out_a = a + da * (1 - a)
    if out_a <= 0:
        return
    dst[i] = round((r * a + dst[i] * da * (1 - a)) / out_a)
    dst[i + 1] = round((g * a + dst[i + 1] * da * (1 - a)) / out_a)
    dst[i + 2] = round((b * a + dst[i + 2] * da * (1 - a)) / out_a)
    dst[i + 3] = round(out_a * 255)


def fill_rect(
    dst: list[int],
    width: int,
    x0: float,
    y0: float,
    x1: float,
    y1: float,
    color: tuple[int, int, int],
    radius: float = 0,
) -> None:
    height = len(dst) // (width * 4)
    r, g, b = color
    for y in range(height):
        for x in range(width):
            px, py = x + 0.5, y + 0.5
            if radius <= 0:
                if x0 <= px <= x1 and y0 <= py <= y1:
                    blend(dst, width, x, y, r, g, b, 1)
                continue
            dx = 0.0
            dy = 0.0
            if px < x0 + radius:
                dx = x0 + radius - px
            elif px > x1 - radius:
                dx = px - (x1 - radius)
            if py < y0 + radius:
                dy = y0 + radius - py
            elif py > y1 - radius:
                dy = py - (y1 - radius)
            inside = x0 <= px <= x1 and y0 <= py <= y1
            if not inside:
                continue
            if dx == 0 or dy == 0:
                blend(dst, width, x, y, r, g, b, 1)
                continue
            dist = math.hypot(dx, dy)
            if dist <= radius - 0.5:
                blend(dst, width, x, y, r, g, b, 1)
            elif dist < radius + 0.5:
                blend(dst, width, x, y, r, g, b, max(0.0, radius + 0.5 - dist))


def fill_circle(
    dst: list[int], width: int, cx: float, cy: float, radius: float, color: tuple[int, int, int]
) -> None:
    height = len(dst) // (width * 4)
    r, g, b = color
    y0 = max(0, int(cy - radius - 1))
    y1 = min(height - 1, int(cy + radius + 1))
    x0 = max(0, int(cx - radius - 1))
    x1 = min(width - 1, int(cx + radius + 1))
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            d = math.hypot(x + 0.5 - cx, y + 0.5 - cy)
            if d <= radius - 0.5:
                blend(dst, width, x, y, r, g, b, 1)
            elif d < radius + 0.5:
                blend(dst, width, x, y, r, g, b, max(0.0, radius + 0.5 - d))


def fill_ellipse(
    dst: list[int],
    width: int,
    cx: float,
    cy: float,
    rx: float,
    ry: float,
    color: tuple[int, int, int],
) -> None:
    height = len(dst) // (width * 4)
    r, g, b = color
    for y in range(height):
        for x in range(width):
            nx = (x + 0.5 - cx) / rx
            ny = (y + 0.5 - cy) / ry
            d = math.hypot(nx, ny)
            if d <= 0.96:
                blend(dst, width, x, y, r, g, b, 1)
            elif d < 1.04:
                blend(dst, width, x, y, r, g, b, max(0.0, (1.04 - d) / 0.08))


def fill_poly(dst: list[int], width: int, pts: list[tuple[float, float]], color: tuple[int, int, int]) -> None:
    height = len(dst) // (width * 4)
    r, g, b = color
    min_y = max(0, int(min(p[1] for p in pts) - 1))
    max_y = min(height - 1, int(max(p[1] for p in pts) + 1))
    n = len(pts)
    for y in range(min_y, max_y + 1):
        ys = y + 0.5
        xs: list[float] = []
        for i in range(n):
            x1, y1 = pts[i]
            x2, y2 = pts[(i + 1) % n]
            if (y1 <= ys < y2) or (y2 <= ys < y1):
                t = (ys - y1) / (y2 - y1) if y2 != y1 else 0
                xs.append(x1 + t * (x2 - x1))
        xs.sort()
        for i in range(0, len(xs) - 1, 2):
            xa, xb = xs[i], xs[i + 1]
            for x in range(int(xa), int(xb) + 1):
                blend(dst, width, x, y, r, g, b, 1)


def downscale(src: list[int], sw: int, sh: int, dw: int, dh: int) -> list[int]:
    out = [0] * (dw * dh * 4)
    for y in range(dh):
        for x in range(dw):
            x0 = int(x * sw / dw)
            x1 = int((x + 1) * sw / dw)
            y0 = int(y * sh / dh)
            y1 = int((y + 1) * sh / dh)
            tot = [0, 0, 0, 0]
            count = 0
            for sy in range(y0, max(y0 + 1, y1)):
                for sx in range(x0, max(x0 + 1, x1)):
                    i = (sy * sw + sx) * 4
                    tot[0] += src[i]
                    tot[1] += src[i + 1]
                    tot[2] += src[i + 2]
                    tot[3] += src[i + 3]
                    count += 1
            o = (y * dw + x) * 4
            out[o] = tot[0] // count
            out[o + 1] = tot[1] // count
            out[o + 2] = tot[2] // count
            out[o + 3] = tot[3] // count
    return out


def render_master(size: int = 128) -> list[int]:
    img = [0] * (size * size * 4)
    ink = (28, 22, 16)
    ink2 = (42, 32, 22)
    brass = (214, 168, 72)
    brass_dark = (120, 84, 28)
    gold = (232, 196, 92)
    gold_hi = (250, 230, 160)

    fill_rect(img, size, 4, 4, size - 4, size - 4, ink, radius=size * 0.22)
    fill_rect(img, size, 10, 10, size - 10, size - 10, ink2, radius=size * 0.18)

    s = size / 128.0
    cx = 64 * s

    fill_poly(
        img,
        size,
        [
            (34 * s, 112 * s),
            (94 * s, 112 * s),
            (88 * s, 100 * s),
            (40 * s, 100 * s),
        ],
        brass_dark,
    )
    fill_poly(
        img,
        size,
        [
            (38 * s, 110 * s),
            (90 * s, 110 * s),
            (84 * s, 101 * s),
            (44 * s, 101 * s),
        ],
        gold,
    )
    fill_poly(
        img,
        size,
        [
            (46 * s, 101 * s),
            (82 * s, 101 * s),
            (78 * s, 90 * s),
            (50 * s, 90 * s),
        ],
        brass,
    )
    fill_poly(
        img,
        size,
        [
            (52 * s, 90 * s),
            (76 * s, 90 * s),
            (72 * s, 58 * s),
            (56 * s, 58 * s),
        ],
        gold,
    )
    fill_ellipse(img, size, cx, 56 * s, 13 * s, 8 * s, brass)
    fill_circle(img, size, cx, 42 * s, 16 * s, gold)
    fill_circle(img, size, cx, 28 * s, 8.5 * s, gold_hi)
    fill_circle(img, size, cx - 4 * s, 38 * s, 3.2 * s, gold_hi)

    return img


def main() -> None:
    os.makedirs(OUT_DIR, exist_ok=True)
    master = render_master(128)
    sizes = {128: master, 48: downscale(master, 128, 128, 48, 48), 32: downscale(master, 128, 128, 32, 32), 16: downscale(master, 128, 128, 16, 16)}
    for size, pixels in sizes.items():
        path = os.path.join(OUT_DIR, f"icon-{size}.png")
        with open(path, "wb") as handle:
            handle.write(png_rgba(size, size, pixels))
        print("wrote", path)


if __name__ == "__main__":
    main()
