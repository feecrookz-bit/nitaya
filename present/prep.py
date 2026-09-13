#!/usr/bin/env python3
"""Turn the raw screenshots in present/shots into web-sized JPEGs in
present/shots/web: desktop frames at 1100 px wide (full page, capped at a
height that still reads as a page), phone frames at 520 px wide."""
import os
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'shots'); OUT = os.path.join(SRC, 'web'); os.makedirs(OUT, exist_ok=True)
for f in sorted(os.listdir(SRC)):
    if not f.endswith('.png'): continue
    im = Image.open(os.path.join(SRC, f)).convert('RGB')
    phone = '-m-' in f
    w = 520 if phone else 1100
    cap = 1900 if phone else 2600
    r = w / im.width; im = im.resize((w, int(im.height * r)), Image.LANCZOS)
    if im.height > cap: im = im.crop((0, 0, w, cap))
    im.save(os.path.join(OUT, f[:-4] + '.jpg'), quality=68, optimize=True, progressive=True)
print('web frames:', len([f for f in os.listdir(OUT) if f.endswith('.jpg')]))
