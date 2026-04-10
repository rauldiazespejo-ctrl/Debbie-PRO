#!/usr/bin/env python3
"""Genera PNG e ICO de marca (fondo oscuro + anillo cian) para Debbie PRO."""
from __future__ import annotations

import math
import struct
import zlib
from pathlib import Path


def _png_chunk(chunk_type: bytes, data: bytes) -> bytes:
    crc = zlib.crc32(chunk_type + data) & 0xFFFFFFFF
    return struct.pack(">I", len(data)) + chunk_type + data + struct.pack(">I", crc)


def ring_png(size: int) -> bytes:
    bg = (10, 10, 15)
    ring = (0, 240, 255)
    cx = cy = (size - 1) / 2.0
    outer_r = size * 0.47
    stroke = max(size * 0.035, 2.0)
    raw = bytearray()
    for y in range(size):
        raw.append(0)
        for x in range(size):
            rr = math.hypot(x - cx, y - cy)
            if outer_r - stroke <= rr <= outer_r:
                raw.extend((*ring, 255))
            else:
                raw.extend((*bg, 255))
    compressed = zlib.compress(bytes(raw), 9)
    sig = b"\x89PNG\r\n\x1a\n"
    ihdr = struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0)
    return sig + _png_chunk(b"IHDR", ihdr) + _png_chunk(b"IDAT", compressed) + _png_chunk(b"IEND", b"")


def ico_embed_png(png: bytes) -> bytes:
    w = png[16:20]
    h = png[20:24]
    iw = struct.unpack(">I", w)[0]
    ih = struct.unpack(">I", h)[0]
    bw = iw if iw < 256 else 0
    bh = ih if ih < 256 else 0
    out = bytearray()
    out.extend(struct.pack("<HHH", 0, 1, 1))
    out.extend(
        struct.pack(
            "<BBBBHHII",
            bw,
            bh,
            0,
            0,
            0,
            0,
            len(png),
            6 + 16,
        )
    )
    out.extend(png)
    return bytes(out)


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    icons = root / "public" / "icons"
    icons.mkdir(parents=True, exist_ok=True)

    png192 = ring_png(192)
    png512 = ring_png(512)
    png32 = ring_png(32)

    (icons / "icon-192.png").write_bytes(png192)
    (icons / "icon-512.png").write_bytes(png512)
    (icons / "favicon-32.png").write_bytes(png32)

    (root / "public" / "favicon.ico").write_bytes(ico_embed_png(png32))
    print("OK:", icons / "icon-192.png", icons / "icon-512.png", icons / "favicon-32.png")
    print("OK:", root / "public" / "favicon.ico")


if __name__ == "__main__":
    main()
