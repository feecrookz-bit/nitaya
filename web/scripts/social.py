#!/usr/bin/env python3
"""
Social templates in the site's design system, built from the same graded and
rendered assets as the store:

    python3 scripts/social.py          # writes social/*.png and social/sheet.jpg

  post-<product>.png     1080×1080  studio render, name, price, family colour
  story-<scene>.png      1080×1920  customer garden, caption, CTA
  guide-<slug>.png       1080×1350  one tip from a guide on deep green
  season.png             1080×1080  this season's four stones

Fonts: Cinzel (wordmark, headings) and Geist (everything else), both OFL and
vendored in scripts/fonts. Colours mirror src/index.css and FAMILY_COLOUR.
"""
import os, re, json
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
ASSETS = os.path.join(ROOT, 'src', 'assets')
OUT = os.path.join(ROOT, 'social')
os.makedirs(OUT, exist_ok=True)

CANVAS = (245, 243, 240); INK = (26, 26, 26); INK2 = (90, 90, 90); INK3 = (136, 136, 136)
SAND = (212, 165, 116); SAND2 = (192, 143, 92); GREEN_DEEP = (31, 58, 44); WHITE = (255, 255, 255)
FAMILY = {'sandstone': (63, 107, 79), 'limestone': (78, 97, 114), 'outdoor': (181, 85, 46), 'indoor': (138, 109, 59), 'cladding': (107, 94, 82)}
TINT = {'sandstone': (234, 240, 235), 'limestone': (233, 237, 241), 'outdoor': (246, 234, 226), 'indoor': (243, 237, 225), 'cladding': (239, 234, 228)}

def font(name, size):
    return ImageFont.truetype(os.path.join(HERE, 'fonts', name), size)
CINZEL = lambda s: font('Cinzel-600.ttf', s)
GEIST = lambda s: font('Geist-500.ttf', s)
GEIST_B = lambda s: font('Geist-700.ttf', s)

def asset(prefix):
    for f in sorted(os.listdir(ASSETS)):
        if f.startswith(prefix): return Image.open(os.path.join(ASSETS, f)).convert('RGB')
    raise FileNotFoundError(prefix)

def cover(im, w, h):
    r = max(w / im.width, h / im.height)
    im = im.resize((int(im.width * r) + 1, int(im.height * r) + 1), Image.LANCZOS)
    x = (im.width - w) // 2; y = (im.height - h) // 2
    return im.crop((x, y, x + w, y + h))

def spaced(d, xy, text, f, fill, spacing):
    x, y = xy
    for ch in text:
        d.text((x, y), ch, font=f, fill=fill); x += f.getlength(ch) + spacing
    return x

def wordmark(d, x, y, colour=INK, size=30, gold=SAND):
    # monogram: arch + N, single stroke, then NITYA STONES in Cinzel
    s = size; lw = max(2, s // 12)
    d.arc((x, y - s * 0.05, x + s, y + s * 1.25), 195, 345, fill=gold, width=lw)
    d.line((x + s * 0.3, y + s * 0.95, x + s * 0.3, y + s * 0.3, x + s * 0.7, y + s * 0.95, x + s * 0.7, y + s * 0.3), fill=gold, width=lw, joint='curve')
    return spaced(d, (x + s + s * 0.45, y + s * 0.18), 'NITYA STONES', CINZEL(int(s * 0.78)), colour, s * 0.16)

def wrap(d, text, f, width):
    words, lines, cur = text.split(), [], ''
    for w in words:
        t = (cur + ' ' + w).strip()
        if f.getlength(t) <= width: cur = t
        else: lines.append(cur); cur = w
    if cur: lines.append(cur)
    return lines

def money(n): return '£' + f'{n:,.2f}'

# ---------------- product post ----------------
def post(p):
    W = H = 1080
    im = Image.new('RGB', (W, H), TINT[p['cat']])
    d = ImageDraw.Draw(im)
    d.rectangle((0, 0, W, 14), fill=FAMILY[p['cat']])
    render = cover(asset('p-' + p['slug']), 960, 640)
    im.paste(render, (60, 150))
    d.rounded_rectangle((60, 150, 1020, 790), 18, outline=(224, 221, 216), width=2)
    spaced(d, (60, 70), p['fam'].upper(), GEIST_B(24), FAMILY[p['cat']], 5)
    d.text((60, 830), p['name'], font=CINZEL(64), fill=INK)
    d.text((60, 915), f"{p['size']} · {p['thick']}", font=GEIST(28), fill=INK2)
    price = money(p['price']); pf = GEIST_B(44)
    d.text((60, 965), price, font=pf, fill=INK)
    d.text((60 + pf.getlength(price) + 14, 980), f"{p['unit']} + VAT", font=GEIST(24), fill=INK3)
    wordmark(d, 700, 985, size=34)
    d.text((W - 60 - GEIST(22).getlength('£5 sample · nityastones.co.uk'), 78), '£5 sample · nityastones.co.uk', font=GEIST(22), fill=INK3)
    im.save(os.path.join(OUT, f"post-{p['id']}.png"))

# ---------------- dark post (matches the black-and-gold the feed already uses) ----------------
GOLD = (201, 165, 75); BLACK = (17, 17, 17)

def post_dark(p, scene):
    """The feed's existing black-and-gold identity, without the sale badges:
    one garden photo, one line, the price, the mark."""
    W = H = 1080
    im = cover(asset(scene), W, H)
    grad = Image.new('L', (1, H))
    for y in range(H):
        grad.putpixel((0, y), int(255 * min(1, max(0, (y - H * 0.35) / (H * 0.45)))))
    im = Image.composite(Image.new('RGB', (W, H), BLACK), im, grad.resize((W, H)).point(lambda v: int(v * 0.92)))
    d = ImageDraw.Draw(im)
    wordmark(d, 70, 70, colour=GOLD, size=40, gold=GOLD)
    render = cover(asset('p-' + p['slug']), 300, 225)
    im.paste(render, (710, 620))
    d.rounded_rectangle((710, 620, 1010, 845), 12, outline=GOLD, width=2)
    spaced(d, (70, 640), p['fam'].upper(), GEIST_B(24), GOLD, 5)
    y = 690
    for line in wrap(d, p['name'], CINZEL(72), 600):
        d.text((70, y), line, font=CINZEL(72), fill=WHITE); y += 84
    d.text((70, y + 6), f"{p['size']} · {p['thick']}", font=GEIST(28), fill=(190, 186, 178))
    pf = GEIST_B(44); d.text((70, y + 58), money(p['price']), font=pf, fill=GOLD)
    d.text((70 + pf.getlength(money(p['price'])) + 14, y + 73), f"{p['unit']} + VAT", font=GEIST(24), fill=(190, 186, 178))
    d.text((70, H - 90), '34 Mark Road, Hemel Hempstead · 0330 236 9227 · nityastones.co.uk', font=GEIST(24), fill=(160, 156, 148))
    im.save(os.path.join(OUT, f"dark-{p['id']}.png"))

# ---------------- story ----------------
def story(scene, caption, sub, cta='Build your patio'):
    W, H = 1080, 1920
    im = cover(asset(scene), W, H)
    grad = Image.new('L', (1, H))
    for y in range(H):
        a = 0 if y < H * 0.45 else int(255 * min(1, (y - H * 0.45) / (H * 0.4)))
        grad.putpixel((0, y), a)
    grad = grad.resize((W, H))
    im = Image.composite(Image.new('RGB', (W, H), (14, 16, 14)), im, grad.point(lambda v: int(v * 0.85)))
    d = ImageDraw.Draw(im)
    wordmark(d, 80, 110, colour=WHITE, size=40)
    y = 1330
    for line in wrap(d, caption, CINZEL(72), W - 160):
        d.text((80, y), line, font=CINZEL(72), fill=WHITE); y += 86
    y += 14
    for line in wrap(d, sub, GEIST(34), W - 160):
        d.text((80, y), line, font=GEIST(34), fill=(200, 196, 188)); y += 44
    y += 30
    bf = GEIST_B(34); tw = bf.getlength(cta) + 80
    d.rounded_rectangle((80, y, 80 + tw, y + 84), 42, fill=SAND)
    d.text((120, y + 22), cta, font=bf, fill=INK)
    d.text((80 + tw + 30, y + 26), 'nityastones.co.uk', font=GEIST(28), fill=(200, 196, 188))
    name = re.sub(r'[^a-z0-9]+', '-', scene.replace('scene-', ''))
    im.save(os.path.join(OUT, f'story-{name}.png'))

# ---------------- guide tip ----------------
def guide(slug, fam, kicker, tip, attribution):
    W, H = 1080, 1350
    im = Image.new('RGB', (W, H), GREEN_DEEP)
    d = ImageDraw.Draw(im)
    d.rectangle((0, 0, W, 14), fill=FAMILY[fam])
    wordmark(d, 80, 100, colour=WHITE, size=36)
    spaced(d, (80, 330), kicker.upper(), GEIST_B(26), SAND, 6)
    y = 400
    for line in wrap(d, tip, CINZEL(62), W - 160):
        d.text((80, y), line, font=CINZEL(62), fill=WHITE); y += 78
    y += 30
    for line in wrap(d, attribution, GEIST(32), W - 160):
        d.text((80, y), line, font=GEIST(32), fill=(191, 208, 196)); y += 42
    d.text((80, H - 120), 'Read the guide · nityastones.co.uk/guides', font=GEIST(28), fill=(191, 208, 196))
    im.save(os.path.join(OUT, f'guide-{slug}.png'))

# ---------------- season ----------------
def season(title, prods):
    W = H = 1080
    im = Image.new('RGB', (W, H), CANVAS)
    d = ImageDraw.Draw(im)
    spaced(d, (60, 70), 'THIS SEASON', GEIST_B(24), SAND2, 5)
    d.text((60, 110), title, font=CINZEL(64), fill=INK)
    cells = [(60, 220), (555, 220), (60, 615), (555, 615)]
    for (x, y), p in zip(cells, prods):
        r = cover(asset('p-' + p['slug']), 465, 300)
        im.paste(r, (x, y))
        d.rounded_rectangle((x, y, x + 465, y + 300), 14, outline=(224, 221, 216), width=2)
        d.text((x, y + 314), p['name'], font=GEIST_B(28), fill=INK)
        d.text((x, y + 350), f"{money(p['price'])} {p['unit']} + VAT", font=GEIST(24), fill=INK3)
    wordmark(d, 700, 1010, size=32)
    d.text((60, 1018), 'Shop the palette · nityastones.co.uk', font=GEIST(24), fill=INK3)
    im.save(os.path.join(OUT, 'season.png'))

if __name__ == '__main__':
    P = lambda id, slug, name, cat, fam, size, thick, price, unit='per m²': dict(id=id, slug=slug, name=name, cat=cat, fam=fam, size=size, thick=thick, price=price, unit=unit)
    products = [
        P('raj-green', 'raj-green', 'Raj Green', 'sandstone', 'Indian sandstone', 'Mixed patio pack', '22 mm riven', 19.5),
        P('bodo-white', 'bodo-white', 'Bodo White', 'outdoor', 'Outdoor porcelain', '600 × 900 mm', '20 mm R11', 19.5),
        P('black-limestone', 'black-limestone', 'Black Limestone', 'limestone', 'Limestone', '600 × 600 mm', '20 mm honed', 19.5),
        P('calacatta-blanco', 'calacatta-blanco', 'Calacatta Blanco', 'indoor', 'Indoor porcelain', '600 × 1200 mm', '8 mm rectified', 22.8),
    ]
    for p in products: post(p)
    post_dark(products[1], 'scene-bodo'); post_dark(products[0], 'scene-raj-wet')
    story('scene-bodo', 'Bodo White, laid.', 'A customer’s extension in Hemel Hempstead. 600×900 porcelain, half bond, straight out from the bifolds.')
    story('scene-autumn', 'Autumn Brown, wet.', 'Riven Indian sandstone photographed after rain — which is how it looks most of the year, and why people choose it.', 'Order a £5 sample')
    guide('sealing', 'sandstone', 'Sealing sandstone', 'Not straight after laying. Wait four to six weeks of dry weather.', 'Sealing damp stone traps moisture and the sealer fails. From our guide to sealing sandstone.')
    guide('cleaning', 'limestone', 'Cleaning a patio', 'Never put acid on limestone. Not brick acid, not vinegar, not most patio cleaners.', 'It etches the surface and leaves a pale mark — Black Limestone shows it worst. From our guide to cleaning a patio.')
    season('Autumn palette', [
        P('autumn-brown', 'autumn-brown', 'Autumn Brown', 'sandstone', '', '', '', 19.5),
        P('raj-green', 'raj-green', 'Raj Green', 'sandstone', '', '', '', 19.5),
        P('copper-slate', 'copper-slate', 'Copper Slate', 'outdoor', '', '', '', 19.5),
        P('black-limestone', 'black-limestone', 'Black Limestone', 'limestone', '', '', '', 19.5)])
    # contact sheet
    files = sorted(f for f in os.listdir(OUT) if f.endswith('.png'))
    thumbs = []
    for f in files:
        im = Image.open(os.path.join(OUT, f)); im.thumbnail((360, 640)); thumbs.append((f, im))
    W = sum(t.width for _, t in thumbs) + 20 * (len(thumbs) + 1); H = max(t.height for _, t in thumbs) + 60
    sheet = Image.new('RGB', (W, H), (60, 60, 60)); d = ImageDraw.Draw(sheet); x = 20
    for f, t in thumbs:
        sheet.paste(t, (x, 20)); d.text((x, t.height + 30), f, fill='white', font=GEIST(16)); x += t.width + 20
    sheet.save(os.path.join(OUT, 'sheet.jpg'), quality=82)
    print('\n'.join(files))
