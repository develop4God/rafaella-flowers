#!/usr/bin/env python3
"""Convert a source product photo to WebP for images/.

Usage: python3 scripts/add-product-image.py <source-image> <product-key>
Example: python3 scripts/add-product-image.py ~/Downloads/A007.jpg A007

After running, add an entry to products.json with:
  "img": "images/<product-key>.webp"
  "objectPosition": "50% 50%"  <- tune by eye against the .product-card grid (see catalogo.html)
"""
import os
import sys

from PIL import Image

MAX_WIDTH = 1400
QUALITY = 85


def main():
    if len(sys.argv) != 3:
        print(__doc__)
        sys.exit(1)

    src_path, key = sys.argv[1], sys.argv[2]
    if not os.path.isfile(src_path):
        print(f"Source file not found: {src_path}")
        sys.exit(1)

    dst_path = os.path.join(os.path.dirname(__file__), "..", "images", f"{key}.webp")

    im = Image.open(src_path).convert("RGB")
    w, h = im.size
    if w > MAX_WIDTH:
        scale = MAX_WIDTH / w
        im = im.resize((MAX_WIDTH, round(h * scale)), Image.LANCZOS)

    im.save(dst_path, "WEBP", quality=QUALITY)
    print(f"Wrote {dst_path} ({im.size[0]}x{im.size[1]})")
    print(f'Add to products.json: "img": "images/{key}.webp", "objectPosition": "50% 50%"')
    print("Tune objectPosition by eye in catalogo.html — flowers should stay visible, base should show where possible.")


if __name__ == "__main__":
    main()
