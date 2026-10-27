#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Recreate the screen crops and emblem masks used by film.py / covers.py."""
import os, cairosvg
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'work', 'assets')
os.makedirs(A, exist_ok=True)
S = os.path.join(ROOT, 'docs', 'screenshots')

crops = {
    'picker': ('language-picker-zh.png', (322, 76, 1120, 738)),
    'picker_ar': ('language-picker-ar-rtl.png', (322, 76, 1120, 738)),
    'settings': ('settings-un-zh.png', (320, 16, 1120, 808)),
    'home': ('home-light-zh.png', (0, 0, 1440, 814)),
    'home_dark': ('home-dark-zh.png', (0, 0, 1440, 814)),
}
for name, (f, box) in crops.items():
    im = Image.open(os.path.join(S, f)).convert('RGB').crop(box)
    im.save(os.path.join(A, name + '.png'))
    print(name, im.size)

cairosvg.svg2png(url=os.path.join(ROOT, 'assets', 'emblem-mono.svg'),
                 write_to=os.path.join(A, 'emblem_mono_raw.png'),
                 output_width=1600, output_height=1600, background_color='transparent')
im = Image.open(os.path.join(A, 'emblem_mono_raw.png')).convert('RGBA')
alpha = im.getchannel('A')
for name, col in [('emblem_white', (255,255,255,255)), ('emblem_blue', (0,158,219,255))]:
    out = Image.new('RGBA', im.size, col); out.putalpha(alpha)
    out.save(os.path.join(A, name + '.png'))
cairosvg.svg2png(url=os.path.join(ROOT, 'assets', 'emblem-badge.svg'),
                 write_to=os.path.join(A, 'emblem_badge.png'),
                 output_width=1024, output_height=1024, background_color='transparent')
print('assets ready')
