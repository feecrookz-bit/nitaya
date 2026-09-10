#!/usr/bin/env python3
"""
Fetch Nitya Stones' own photography from the live WordPress media library and
grade it into a consistent set for the site.

    python3 scripts/photos.py fetch     # originals -> scripts/originals/ (gitignored)
    python3 scripts/photos.py grade     # originals -> src/assets/*.jpg
    python3 scripts/photos.py sheet     # before/after contact sheet -> scripts/before-after.jpg

The pass is the same for every image so the cards read as one shoot:
  1. grey-world white balance, applied at 60% so warm evening shots stay warm
  2. auto-levels on the 0.5 / 99.5 percentiles of luminance
  3. a gentle S-curve for contrast
  4. +6% saturation, unsharp mask
  5. crop to the target aspect. Product shots of a single tile on a plain
     ground are first cropped to the tile itself (`mode: auto`), which is what
     turns a phone snap on the yard floor into something that reads as a
     product shot.
Overrides per image live in photos.json (trim_bottom removes a baked-in
caption; grade:false skips the tonal work for texture maps).
"""
import json, os, sys, urllib.request
from PIL import Image, ImageFilter, ImageEnhance, ImageOps, ImageStat, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
MANIFEST = json.load(open(os.path.join(HERE, 'photos.json')))
ORIG = os.path.join(HERE, 'originals')
OUT = os.path.join(ROOT, 'src', 'assets')
UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124 Safari/537.36'


def fetch():
    os.makedirs(ORIG, exist_ok=True)
    for name, spec in MANIFEST.items():
        dst = os.path.join(ORIG, name + os.path.splitext(spec['src'])[1].lower())
        if os.path.exists(dst) and os.path.getsize(dst) > 1000:
            continue
        req = urllib.request.Request(spec['src'], headers={'User-Agent': UA})
        with urllib.request.urlopen(req, timeout=60) as r, open(dst, 'wb') as f:
            f.write(r.read())
        print('fetched', name)


def original_path(name):
    for ext in ('.jpeg', '.jpg', '.png', '.webp'):
        p = os.path.join(ORIG, name + ext)
        if os.path.exists(p):
            return p
    raise FileNotFoundError(name)


def white_balance(im, strength=0.5, clamp=0.07):
    # Grey-world, damped and clamped: enough to pull a cold phone cast, not
    # enough for a lawn to push the tile magenta.
    r, g, b = ImageStat.Stat(im).mean
    grey = (r + g + b) / 3
    gains = [max(1 - clamp, min(1 + clamp, 1 + strength * (grey / c - 1))) for c in (r, g, b)]
    return Image.merge('RGB', [ch.point(lambda v, k=k: min(255, int(v * k))) for ch, k in zip(im.split(), gains)])


def auto_levels(im, lo_pct=0.5, hi_pct=99.5):
    hist = im.convert('L').histogram()
    total = sum(hist)
    lo = hi = 0
    acc = 0
    for i, n in enumerate(hist):
        acc += n
        if acc >= total * lo_pct / 100:
            lo = i
            break
    acc = 0
    for i in range(255, -1, -1):
        acc += hist[i]
        if acc >= total * (100 - hi_pct) / 100:
            hi = i
            break
    if hi - lo < 90:  # a flat, single-colour tile: stretching it only amplifies noise
        return im
    return im.point(lambda v: max(0, min(255, int((v - lo) * 255 / (hi - lo)))))


def s_curve(im, amount=0.12):
    lut = []
    for i in range(256):
        x = i / 255
        y = x + amount * (x - 0.5) * (1 - abs(2 * x - 1))  # bumps mids, protects ends
        lut.append(max(0, min(255, int(y * 255))))
    return im.point(lut * 3)


def content_box(im, tol=28):
    """Bounding box of anything that differs from the border colour."""
    w, h = im.size
    edge = Image.new('RGB', (w, h))
    border = im.crop((0, 0, w, max(2, h // 40)))
    r, g, b = ImageStat.Stat(border).median
    diff = ImageOps.grayscale(Image.eval(im, lambda v: v)).point(lambda v: v)  # placeholder to keep type
    px = im.load()
    mask = Image.new('L', (w, h), 0)
    mp = mask.load()
    step = 2
    for y in range(0, h, step):
        for x in range(0, w, step):
            pr, pg, pb = px[x, y]
            if abs(pr - r) + abs(pg - g) + abs(pb - b) > tol * 3:
                mp[x, y] = 255
    return mask.getbbox()


def is_plain_ground(im):
    """A single tile photographed on a plain floor: bright, low-variance border."""
    w, h = im.size
    strip = im.crop((0, 0, w, h // 12))
    st = ImageStat.Stat(strip)
    return sum(st.mean) / 3 > 170 and max(st.stddev) < 28


def crop_aspect(im, aspect):
    aw, ah = (int(v) for v in aspect.split(':'))
    w, h = im.size
    target = aw / ah
    if w / h > target:
        nw = int(h * target)
        x = (w - nw) // 2
        return im.crop((x, 0, x + nw, h))
    nh = int(w / target)
    y = (h - nh) // 2
    return im.crop((0, y, w, y + nh))


def grade_one(name, spec):
    im = Image.open(original_path(name)).convert('RGB')
    im = ImageOps.exif_transpose(im)
    if spec.get('trim_bottom'):
        im = im.crop((0, 0, im.width, int(im.height * (1 - spec['trim_bottom']))))
    if spec.get('grade', True):
        plain = name.startswith('p-') and is_plain_ground(im)
        if plain:
            box = content_box(im)
            if box:
                pad = int(0.06 * max(im.size))
                box = (max(0, box[0] - pad), max(0, box[1] - pad), min(im.width, box[2] + pad), min(im.height, box[3] + pad))
                im = im.crop(box)
        im = white_balance(im)
        if not plain:  # a tile on a plain floor keeps its own tone; only scenes get the curve
            im = auto_levels(im)
            im = s_curve(im)
            im = ImageEnhance.Color(im).enhance(1.06)
    im = crop_aspect(im, spec['aspect'])
    if im.width > spec['width']:
        im = im.resize((spec['width'], int(im.height * spec['width'] / im.width)), Image.LANCZOS)
    if spec.get('grade', True):
        im = im.filter(ImageFilter.UnsharpMask(radius=1.2, percent=60, threshold=3))
    out = os.path.join(OUT, name + '.jpg')
    im.save(out, quality=74, optimize=True, progressive=True)
    return out


def grade():
    os.makedirs(OUT, exist_ok=True)
    for name, spec in MANIFEST.items():
        print('graded', os.path.basename(grade_one(name, spec)))


def sheet():
    names = [n for n in MANIFEST if n.startswith('p-')][:18] + ['hero', 'scene-autumn', 'scene-bodo', 'yard']
    tw, th = 260, 195
    rows = len(names)
    out = Image.new('RGB', (tw * 2 + 30, rows * (th + 8) + 30), 'white')
    d = ImageDraw.Draw(out)
    d.text((10, 8), 'ORIGINAL', fill='black')
    d.text((tw + 30, 8), 'GRADED', fill='black')
    for i, n in enumerate(names):
        y = 30 + i * (th + 8)
        a = ImageOps.exif_transpose(Image.open(original_path(n)).convert('RGB'))
        a = crop_aspect(a, '4:3').resize((tw, th))
        b = Image.open(os.path.join(OUT, n + '.jpg')).convert('RGB')
        b = crop_aspect(b, '4:3').resize((tw, th))
        out.paste(a, (10, y))
        out.paste(b, (tw + 30, y))
        d.text((12, y + th - 14), n[:34], fill='white')
    p = os.path.join(HERE, 'before-after.jpg')
    out.save(p, quality=80)
    print(p)


if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'grade'
    {'fetch': fetch, 'grade': grade, 'sheet': sheet}[cmd]()
