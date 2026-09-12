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
caption; grade:false skips the tonal work for texture maps; watermark:false
leaves an image unstamped — product cards default to unstamped, scene and
yard photography defaults to stamped so it can't be lifted anonymously).
"""
import json, os, sys, urllib.request
from PIL import Image, ImageFilter, ImageEnhance, ImageOps, ImageStat, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
MANIFEST = json.load(open(os.path.join(HERE, 'photos.json')))
ORIG = os.path.join(HERE, 'originals')
OUT = os.path.join(ROOT, 'src', 'assets')
FONT = os.path.join(HERE, 'fonts', 'Cinzel-600.ttf')
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
    # The manifest's extension wins, so changing a product's src in
    # photos.json can't be shadowed by a stale cached original.
    ext = os.path.splitext(MANIFEST[name]['src'])[1].lower()
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


def watermark(im, opacity=0.68):
    """Modernised mark — monogram under an arch, NITYA STONES in Cinzel —
    drawn bottom-right at ~16% of the image width, white with a soft shadow."""
    from PIL import ImageFont
    W, H = im.size
    scale = max(120, int(W * 0.16)) / 100  # design unit: 100 = mark width
    font = ImageFont.truetype(FONT, int(11 * scale))
    text = 'NITYA STONES'
    tw = int(font.getlength(text) + 0.16 * 11 * scale * (len(text) - 1))
    mono = int(22 * scale)
    mw = mono + int(6 * scale) + tw
    mh = mono
    layer = Image.new('RGBA', (mw + 8, mh + 8), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    lw = max(1, int(1.1 * scale))
    x0, y0 = 4, 4
    # arch with tails
    d.arc((x0, y0, x0 + mono, y0 + mono * 1.35), 195, 345, fill=(255, 255, 255, 255), width=lw)
    d.line((x0, y0 + mono * 0.62, x0 - lw * 1.5, y0 + mono * 0.75), fill=(255, 255, 255, 255), width=lw)
    d.line((x0 + mono, y0 + mono * 0.62, x0 + mono + lw * 1.5, y0 + mono * 0.75), fill=(255, 255, 255, 255), width=lw)
    # N
    nx = x0 + mono * 0.3; ny = y0 + mono * 0.3; nh = mono * 0.65; nw = mono * 0.4
    d.line((nx, ny + nh, nx, ny, nx + nw, ny + nh, nx + nw, ny), fill=(255, 255, 255, 255), width=lw, joint='curve')
    # wordmark, letter-spaced
    tx = x0 + mono + int(6 * scale)
    ty = y0 + (mono - font.size) // 2 - int(1 * scale)
    sp = 0.16 * 11 * scale
    for ch in text:
        d.text((tx, ty), ch, font=font, fill=(255, 255, 255, 255))
        tx += font.getlength(ch) + sp
    shadow = layer.split()[3].filter(ImageFilter.GaussianBlur(max(1, int(1.5 * scale))))
    shadow_img = Image.new('RGBA', layer.size, (0, 0, 0, 0))
    shadow_img.putalpha(shadow.point(lambda a: int(a * 0.55)))
    out = im.convert('RGBA')
    margin = int(W * 0.025)
    pos = (W - layer.width - margin, H - layer.height - margin)
    out.alpha_composite(shadow_img, (pos[0] + int(1 * scale), pos[1] + int(1 * scale)))
    stamped = layer.copy()
    stamped.putalpha(layer.split()[3].point(lambda a: int(a * opacity)))
    out.alpha_composite(stamped, pos)
    return out.convert('RGB')


# ---------- studio render ----------

STUDIO_TOP = (247, 247, 249)   # Apple-grey studio sweep
STUDIO_BOTTOM = (228, 228, 231)


def face_texture(im, spec):
    """The slab face to map: the whole image for a clean top-down texture,
    or the inner 70% of the tile for a phone shot of a tile on the ground."""
    if spec.get('face_box'):
        l, t, r, b = spec['face_box']
        return im.crop((int(l * im.width), int(t * im.height), int(r * im.width), int(b * im.height)))
    if spec.get('face') == 'full':
        return im
    box = content_box(im) if is_plain_ground(im) else (0, 0, im.width, im.height)
    if not box:
        box = (0, 0, im.width, im.height)
    w, h = box[2] - box[0], box[3] - box[1]
    inset = 0.15
    return im.crop((int(box[0] + w * inset), int(box[1] + h * inset), int(box[2] - w * inset), int(box[3] - h * inset)))


def perspective_coeffs(src_pts, dst_pts):
    """Coefficients for Image.transform(PERSPECTIVE) mapping dst → src."""
    import numpy as np
    A = []
    for (x, y), (u, v) in zip(dst_pts, src_pts):
        A.append([x, y, 1, 0, 0, 0, -u * x, -u * y])
        A.append([0, 0, 0, x, y, 1, -v * x, -v * y])
    B = np.array([c for p in src_pts for c in p], dtype=float)
    return tuple(np.linalg.solve(np.array(A, dtype=float), B))


def studio_render(texture, slab_mm, thick_mm, out_w=1200, out_h=900):
    """One slab, lit from the top-left, viewed from ~28° above the front edge,
    on a studio sweep. Everything is proportional to the real dimensions so a
    600×1200 indoor tile and a 600×150 cladding strip read at true scale
    against each other."""
    from PIL import ImageChops
    sw, sd = slab_mm                     # width, depth in mm
    # each product fills the frame; a long thin strip still reads at its shape
    W = int(out_w * 0.78)
    D = int(W * (sd / sw) * 0.58)        # foreshortened depth
    D = max(D, int(out_h * 0.10))
    px_per_mm = W / sw
    T = max(4, int(thick_mm * px_per_mm * 0.75))
    skew = int(W * 0.055)

    tex = texture.convert('RGB')
    tex = crop_aspect(tex, f'{sw}:{sd}')
    face_w, face_h = W + 2 * skew, D
    tex = tex.resize((face_w, face_h), Image.LANCZOS)
    # true trapezoid: top edge narrower than the bottom edge
    dst = [(skew, 0), (face_w - skew, 0), (face_w, face_h), (0, face_h)]
    src = [(0, 0), (face_w, 0), (face_w, face_h), (0, face_h)]
    coeffs = perspective_coeffs(src, dst)
    face = tex.transform((face_w, face_h), Image.PERSPECTIVE, coeffs, Image.BICUBIC)
    mask = Image.new('L', (face_w, face_h), 0)
    ImageDraw.Draw(mask).polygon(dst, fill=255)

    # ground
    bg = Image.new('RGB', (out_w, out_h), STUDIO_TOP)
    grad = Image.linear_gradient('L').resize((out_w, out_h))
    bg = Image.composite(Image.new('RGB', (out_w, out_h), STUDIO_BOTTOM), bg, grad)

    # place: centred, sitting on the lower third
    x0 = (out_w - face_w) // 2
    y0 = int(out_h * 0.54 - face_h / 2)

    # contact shadow, soft and offset down-right
    sh = Image.new('L', (out_w, out_h), 0)
    sd_ = ImageDraw.Draw(sh)
    sd_.polygon([(x0 + skew + 6, y0 + 10), (x0 + face_w - skew + 14, y0 + 10), (x0 + face_w + 22, y0 + face_h + T + 12), (x0 + 2, y0 + face_h + T + 12)], fill=150)
    sh = sh.filter(ImageFilter.GaussianBlur(max(6, out_w // 60)))
    bg = Image.composite(Image.new('RGB', (out_w, out_h), (150, 150, 156)), bg, sh)

    # front edge: darker slice of the same texture
    edge_tex = tex.crop((0, face_h - max(2, T), face_w, face_h)).resize((face_w, T))
    edge = ImageEnhance.Brightness(edge_tex).enhance(0.62)
    bg.paste(edge, (x0, y0 + face_h), None)
    # right edge: thin darker sliver
    side = Image.new('RGB', (max(2, skew // 5 + 2), face_h), (0, 0, 0))
    side_mask = Image.new('L', side.size, 90)
    bg.paste(side, (x0 + face_w - skew, y0), side_mask)

    # face with a soft light fall-off from the top edge — one axis, no seams
    hl = Image.linear_gradient('L').resize((face_w, face_h)).transpose(Image.FLIP_TOP_BOTTOM).point(lambda v: int(v * 0.07))
    face = ImageChops.add(face, Image.merge('RGB', (hl, hl, hl)))
    bg.paste(face, (x0, y0), mask)
    return bg


def cinematic(im):
    """Film look for scene photography: firmer S-curve, slightly muted
    greens, cool shadows / warm highlights, a soft vignette and fine grain.
    Subtle enough that the garden still looks like the garden."""
    import random
    im = s_curve(im, 0.20)
    im = ImageEnhance.Color(im).enhance(0.92)
    r, g, b = im.split()
    # split tone: lift blue in shadows, lift red in highlights
    b = b.point(lambda v: min(255, int(v + (255 - v) * 0.06)))
    r = r.point(lambda v: min(255, int(v + v * 0.04)))
    im = Image.merge('RGB', (r, g, b))
    w, h = im.size
    vig = Image.new('L', (w, h), 0)
    ImageDraw.Draw(vig).ellipse((-int(w * .15), -int(h * .25), int(w * 1.15), int(h * 1.25)), fill=255)
    vig = vig.filter(ImageFilter.GaussianBlur(max(w, h) // 5))
    dark = ImageEnhance.Brightness(im).enhance(0.72)
    im = Image.composite(im, dark, vig)
    rnd = random.Random(7)
    grain = Image.effect_noise((w, h), 14).convert('L')
    grain = Image.merge('RGB', (grain, grain, grain))
    im = Image.blend(im, ImageChops_overlay(im, grain), 0.10)
    return im


def ImageChops_overlay(base, top):
    from PIL import ImageChops
    return ImageChops.overlay(base, top)


def grade_one(name, spec):
    im = Image.open(original_path(name)).convert('RGB')
    im = ImageOps.exif_transpose(im)
    if spec.get('trim_bottom'):
        im = im.crop((0, 0, im.width, int(im.height * (1 - spec['trim_bottom']))))
    if spec.get('mode') == 'studio':
        tex = white_balance(face_texture(im, spec))
        im = studio_render(tex, spec['slab'], spec['thick'])
        im = im.resize((spec['width'], int(spec['width'] * 3 / 4)), Image.LANCZOS)
        im = im.filter(ImageFilter.UnsharpMask(radius=1.0, percent=40, threshold=3))
        out = os.path.join(OUT, name + '.jpg')
        im.save(out, quality=78, optimize=True, progressive=True)
        return out
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
        if spec.get('cine', name.startswith('scene-') or name in ('hero', 'yard', 'pallets')):
            im = cinematic(im)
    im = crop_aspect(im, spec['aspect'])
    if im.width > spec['width']:
        im = im.resize((spec['width'], int(im.height * spec['width'] / im.width)), Image.LANCZOS)
    if spec.get('grade', True):
        im = im.filter(ImageFilter.UnsharpMask(radius=1.2, percent=60, threshold=3))
    default_stamp = not name.startswith('p-') and spec.get('grade', True)
    if spec.get('watermark', default_stamp):
        im = watermark(im)
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
