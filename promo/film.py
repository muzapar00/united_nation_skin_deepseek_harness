#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
United Nations skin for DeepSeek Harness — 9:16 promo film.
Rendered frame by frame with Pillow and piped to ffmpeg.
"""
import math, os, sys, json, subprocess
from functools import lru_cache
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageChops

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WORK = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'work')
ASSETS = os.path.join(WORK, 'assets')
W, H = 1080, 1920
FPS = 30
DUR = 47.0

# ---------- palette ----------
NAVY   = (5, 13, 24)
NAVY2  = (8, 30, 50)
INK    = (10, 37, 64)
BLUE   = (0, 158, 219)
BLUE_D = (0, 108, 156)
CYAN   = (127, 224, 255)
PAPER  = (246, 244, 239)
PAPER2 = (238, 235, 228)
WHITE  = (249, 251, 252)
MUT_D  = (141, 167, 184)
MUT_L  = (91, 107, 122)
LINE_D = (34, 61, 82)
LINE_L = (213, 216, 214)
GOLD   = (198, 167, 106)

# ---------- fonts ----------
FONT = {
    'sg':    '/usr/share/fonts/truetype/space-grotesk/SpaceGrotesk-Regular.ttf',
    'sg_l':  '/usr/share/fonts/truetype/space-grotesk/SpaceGrotesk-Light.ttf',
    'sg_m':  '/usr/share/fonts/truetype/space-grotesk/SpaceGrotesk-Medium.ttf',
    'sg_b':  '/usr/share/fonts/truetype/space-grotesk/SpaceGrotesk-Bold.ttf',
    'inter': '/usr/share/fonts/opentype/inter/Inter-Regular.otf',
    'inter_l':'/usr/share/fonts/opentype/inter/Inter-Light.otf',
    'inter_m':'/usr/share/fonts/opentype/inter/Inter-Medium.otf',
    'inter_sb':'/usr/share/fonts/opentype/inter/Inter-SemiBold.otf',
    'mono':  '/usr/share/fonts/truetype/ibm-plex/IBMPlexMono-Regular.ttf',
    'mono_l':'/usr/share/fonts/truetype/ibm-plex/IBMPlexMono-Light.ttf',
    'serif': ('/usr/share/fonts/opentype/noto/NotoSerifCJK-Regular.ttc', 2),
    'serif_b':('/usr/share/fonts/opentype/noto/NotoSerifCJK-Bold.ttc', 2),
    'sans':  ('/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc', 2),
    'sans_b':('/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc', 2),
    'serif_latin':'/usr/share/fonts/truetype/noto/NotoSerif-Regular.ttf',
    'serif_latin_i':'/usr/share/fonts/truetype/noto/NotoSerif-Italic.ttf',
}

@lru_cache(maxsize=512)
def F(key, size):
    spec = FONT[key]
    if isinstance(spec, tuple):
        return ImageFont.truetype(spec[0], size, index=spec[1])
    return ImageFont.truetype(spec, size)

@lru_cache(maxsize=512)
def F_script(script, size):
    """Font for a BCP-ish script tag, for the small language specimens."""
    m = {
        'Arab': '/usr/share/fonts/truetype/noto/NotoSansArabic-Regular.ttf',
        'Deva': '/usr/share/fonts/truetype/noto/NotoSansDevanagari-Regular.ttf',
        'Beng': '/usr/share/fonts/truetype/noto/NotoSansBengali-Regular.ttf',
        'Taml': '/usr/share/fonts/truetype/noto/NotoSansTamil-Regular.ttf',
        'Telu': '/usr/share/fonts/truetype/noto/NotoSansTelugu-Regular.ttf',
        'Knda': '/usr/share/fonts/truetype/noto/NotoSansKannada-Regular.ttf',
        'Mlym': '/usr/share/fonts/truetype/noto/NotoSansMalayalam-Regular.ttf',
        'Guru': '/usr/share/fonts/truetype/noto/NotoSansGurmukhi-Regular.ttf',
        'Gujr': '/usr/share/fonts/truetype/noto/NotoSansGujarati-Regular.ttf',
        'Orya': '/usr/share/fonts/truetype/noto/NotoSansOriya-Regular.ttf',
        'Sinh': '/usr/share/fonts/truetype/noto/NotoSansSinhala-Regular.ttf',
        'Thai': '/usr/share/fonts/truetype/noto/NotoSansThai-Regular.ttf',
        'Laoo': '/usr/share/fonts/truetype/noto/NotoSansLao-Regular.ttf',
        'Khmr': '/usr/share/fonts/truetype/noto/NotoSansKhmer-Regular.ttf',
        'Mymr': '/usr/share/fonts/truetype/noto/NotoSansMyanmar-Regular.ttf',
        'Hebr': '/usr/share/fonts/truetype/noto/NotoSansHebrew-Regular.ttf',
        'Ethi': '/usr/share/fonts/truetype/noto/NotoSansEthiopic-Regular.ttf',
        'Tibt': '/usr/share/fonts/truetype/noto/NotoSerifTibetan-Regular.ttf',
        'Grek': '/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf',
        'Cyrl': '/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf',
        'Latn': '/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf',
        'Hans': ('/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc', 2),
        'Hant': ('/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc', 3),
        'Jpan': ('/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc', 0),
        'Kore': ('/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc', 1),
    }
    spec = m.get(script, m['Latn'])
    if isinstance(spec, tuple):
        return ImageFont.truetype(spec[0], size, index=spec[1])
    return ImageFont.truetype(spec, size)

# ---------- easing / timing ----------
def clamp(x, a=0.0, b=1.0): return max(a, min(b, x))
def seg(t, a, b): return clamp((t-a)/(b-a)) if b > a else (1.0 if t >= b else 0.0)
def ease_out_cubic(x): return 1-(1-x)**3
def ease_in_cubic(x): return x**3
def ease_in_out_cubic(x): return 4*x**3 if x < .5 else 1-(-2*x+2)**3/2
def ease_out_expo(x): return 1 if x >= 1 else 1-2**(-10*x)
def ease_out_quint(x): return 1-(1-x)**5
def smoothstep(x): return x*x*(3-2*x)

def fade(t, a, b, c=None, d=None):
    """Fade in over [a,b], hold, fade out over [c,d]."""
    v = seg(t, a, b) if b > a else (1.0 if t >= a else 0.0)
    if c is not None and d is not None and t > c:
        v *= 1-seg(t, c, d)
    return v

def rgba(color, a=255): return (color[0], color[1], color[2], int(a))

# ---------- text ----------
def text_width(text, font, tracking=0.0, direction=None):
    if direction:
        return font.getlength(text, direction=direction)
    return sum(font.getlength(ch) for ch in text) + tracking*max(0, len(text)-1)

def draw_line(draw, xy, text, font, fill, tracking=0.0, direction=None, anchor='la'):
    """Draw one line. anchor: l/m/r for x, a for ascender."""
    if not text:
        return 0
    if direction:
        w = font.getlength(text, direction=direction)
        x, y = xy
        if anchor[0] == 'm': x -= w/2
        elif anchor[0] == 'r': x -= w
        draw.text((x, y), text, font=font, fill=fill, direction=direction, anchor='la')
        return w
    widths = [font.getlength(ch) for ch in text]
    total = sum(widths) + tracking*max(0, len(text)-1)
    x, y = xy
    if anchor[0] == 'm': x -= total/2
    elif anchor[0] == 'r': x -= total
    for ch, w in zip(text, widths):
        draw.text((x, y), ch, font=font, fill=fill, anchor='la')
        x += w + tracking
    return total

class Block:
    """A pre-rendered multi-line text sprite with reveal helpers."""
    def __init__(self, lines, key, size, color, tracking=0.0, line_height=1.32,
                 align='center', direction=None, pad=6):
        if isinstance(lines, str): lines = [lines]
        self.lines = lines
        self.key, self.size, self.color = key, size, color
        self.tracking, self.line_height = tracking, line_height
        self.align, self.direction, self.pad = align, direction, pad
        f = F(key, size) if not isinstance(key, tuple) else F_script(key[0], size)
        self.font = f
        ascent, descent = f.getmetrics()
        self.ascent, self.descent = ascent, descent
        self.line_h = int(round(size*line_height))
        widths = [text_width(l, f, tracking, direction) for l in lines]
        self.width = int(math.ceil(max(widths) if widths else 1))
        self.height = int(math.ceil(ascent+descent+self.line_h*(len(lines)-1)))
        self.sprite = Image.new('RGBA', (self.width+pad*2, self.height+pad*2), (0,0,0,0))
        d = ImageDraw.Draw(self.sprite)
        for i, line in enumerate(lines):
            w = widths[i]
            x = pad
            if align == 'center': x = pad + (self.width-w)/2
            elif align == 'right': x = pad + self.width-w
            y = pad + i*self.line_h
            draw_line(d, (x, y), line, f, color+(255,), tracking, direction, 'la')

    def draw(self, frame, x, y, alpha=1.0, dy=0.0, reveal=None, clip=None):
        if alpha <= 0.002: return
        s = self.sprite
        if clip is not None:
            cx0, cy0, cw, ch = clip
            cw = int(round(max(0, min(cw, s.width-cx0))))
            ch = int(round(max(0, min(ch, s.height-cy0))))
            if cw <= 0 or ch <= 0: return
            s = s.crop((int(cx0), int(cy0), int(cx0+cw), int(cy0+ch)))
            x += cx0; y += cy0
        if reveal is not None:
            r = clamp(reveal)
            if r <= 0: return
            if r < 1:
                s = s.crop((0, 0, max(1,int(s.width*r)), s.height))
        if alpha < 0.998:
            lut = ALPHA_LUT.get(int(alpha*255), None)
            if lut is None:
                lut = [int(i*alpha) for i in range(256)]
                ALPHA_LUT[int(alpha*255)] = lut
            a = s.getchannel('A').point(lut)
            s = s.copy(); s.putalpha(a)
        if self.align == 'center': x -= (self.width)/2
        elif self.align == 'right': x -= self.width
        frame.alpha_composite(s, (int(round(x-self.pad)), int(round(y-self.pad+dy))))
        return s

ALPHA_LUT = {}

@lru_cache(maxsize=768)
def _blk(lines, key, size, color, tracking=0.0, line_height=1.32, align='center', direction=None):
    return Block(list(lines), key, size, color, tracking, line_height, align, direction)

def blk(lines, *args, **kwargs):
    if isinstance(lines, list): lines = tuple(lines)
    if isinstance(lines, str): lines = (lines,)
    return _blk(lines, *args, **kwargs)

def text_layer(lines, key, size, color, tracking=0.0, line_height=1.32, align='center',
               direction=None):
    return blk(lines, key, size, color, tracking, line_height, align, direction)

# ---------- image helpers ----------
@lru_cache(maxsize=128)
def rounded_mask(size, radius):
    w, h = size
    m = Image.new('L', (w, h), 0)
    d = ImageDraw.Draw(m)
    d.rounded_rectangle([0,0,w-1,h-1], radius=radius, fill=255)
    return m

def with_shadow(im, radius=18, blur=26, dy=18, opacity=90, border=False, inset=40):
    """Return a card with a soft shadow and transparent margin of `inset`."""
    w, h = im.size
    canvas = Image.new('RGBA', (w+inset*2, h+inset*2), (0,0,0,0))
    mask = rounded_mask((w,h), radius)
    card = im.convert('RGBA').copy()
    card.putalpha(mask)
    if border:
        d = ImageDraw.Draw(card)
        d.rounded_rectangle([0,0,w-1,h-1], radius=radius, outline=(255,255,255,60), width=1)
    # shadow
    sh = Image.new('RGBA', (w+inset*2, h+inset*2), (0,0,0,0))
    sh.paste(Image.new('RGBA', (w,h), (0,0,0,opacity)), (inset, inset+dy), mask)
    sh = sh.filter(ImageFilter.GaussianBlur(blur))
    canvas.alpha_composite(sh)
    canvas.alpha_composite(card, (inset,inset))
    return canvas, inset

@lru_cache(maxsize=64)
def card(path, width, radius=18, sharpen=1.0, border=False):
    im = Image.open(path).convert('RGB')
    scale = width/im.width
    im = im.resize((int(round(width)), int(round(im.height*scale))), Image.LANCZOS)
    if sharpen:
        im = im.filter(ImageFilter.UnsharpMask(radius=1.4, percent=int(45*sharpen), threshold=2))
    return with_shadow(im, radius=radius, border=border)

# ---------- emblem ----------
@lru_cache(maxsize=64)
def emblem(size, color='white', glow=False):
    src = Image.open(os.path.join(ASSETS, 'emblem_white.png')).convert('RGBA')
    src = src.crop(src.getbbox())
    w = size; h = int(round(src.height*size/src.width))
    src = src.resize((w,h), Image.LANCZOS)
    mask = src.getchannel('A')
    col = {'white': WHITE, 'blue': BLUE, 'ink': INK, 'muted': (120,150,170)}[color]
    out = Image.new('RGBA', (w,h), col+(0,))
    out.putalpha(mask)
    return out

@lru_cache(maxsize=32)
def glow_emblem(size, color=CYAN, radius=26, strength=90):
    e = emblem(size, 'white')
    g = Image.new('RGBA', (e.width+radius*4, e.height+radius*4), (0,0,0,0))
    tint = Image.new('RGBA', e.size, color+(strength,))
    tint.putalpha(e.getchannel('A').point(lambda v:int(v*strength/255)))
    g.alpha_composite(tint, (radius*2, radius*2))
    return g.filter(ImageFilter.GaussianBlur(radius))

# ---------- backgrounds ----------
def _base_gradient(top, bottom, glow_color, glow_strength=0.55, cy=0.34):
    y = np.linspace(0,1,H)[:,None]
    x = np.linspace(0,1,W)[None,:]
    base = np.zeros((H,W,3), np.float32)
    for i in range(3):
        base[:,:,i] = top[i] + (bottom[i]-top[i])*(y**0.9)
    r = np.sqrt((x-0.5)**2 + ((y-cy)*0.62)**2)
    glow = np.clip(1-r/0.46,0,1)**2.0
    base += glow[...,None]*np.array(glow_color,np.float32)*glow_strength
    return base

def _dot_grid(base, step=28, alpha=4, color=(255,255,255)):
    ys = np.arange(step//2, H, step); xs = np.arange(step//2, W, step)
    base[ys[:,None], xs[None,:], :] = base[ys[:,None], xs[None,:], :]*(1-alpha/255) + np.array(color,np.float32)*(alpha/255)
    return base

@lru_cache(maxsize=8)
def background(kind='dark'):
    if kind == 'dark':
        base = _base_gradient(NAVY, (3,8,14), (0,80,125), 0.62, 0.30)
        base = _dot_grid(base, 30, 4, (120,190,220))
    elif kind == 'deep':
        base = _base_gradient((2,6,11), (1,4,8), (0,55,88), 0.45, 0.45)
        base = _dot_grid(base, 30, 3, (120,190,220))
    elif kind == 'paper':
        base = _base_gradient(PAPER, (236,233,225), (190,225,238), 0.30, 0.18)
        base = _dot_grid(base, 30, 3, (90,110,125))
    elif kind == 'paper_cool':
        base = _base_gradient((242,245,246), (226,232,235), (170,220,235), 0.35, 0.22)
        base = _dot_grid(base, 30, 3, (90,110,125))
    return Image.fromarray(np.clip(base,0,255).astype(np.uint8)).convert('RGBA')

# vignette and grain
def _vignette_mask(strength=0.55, power=1.7):
    y = np.linspace(-1,1,H)[:,None]; x = np.linspace(-1,1,W)[None,:]
    r = np.sqrt(x*x*0.62 + y*y*0.62)
    v = np.clip(1-strength*np.clip((r-0.30)/0.85,0,1)**power,0,1)
    return v.astype(np.float32)

VIG_DARK = _vignette_mask(0.58)
VIG_LIGHT = _vignette_mask(0.14, 1.4)

_rng = np.random.default_rng(12)
GRAIN = []
for i in range(5):
    n = _rng.normal(0,1,(H//4, W//4)).astype(np.float32)
    n = np.array(Image.fromarray(((n-n.min())/(n.max()-n.min())*255).astype(np.uint8)).resize((W,H), Image.BILINEAR)).astype(np.float32)
    GRAIN.append((n-127.5)/127.5)

def finish(im, t, dark=True, grain_amt=4.0):
    a = np.array(im.convert('RGB')).astype(np.float32)
    g = GRAIN[int(t*FPS) % len(GRAIN)]
    a += g[...,None]*grain_amt
    v = VIG_DARK if dark else VIG_LIGHT
    a *= v[...,None]
    return Image.fromarray(np.clip(a,0,255).astype(np.uint8)).convert('RGBA')

def push_in(im, z, cx=W/2, cy=H/2):
    if z <= 1.0005: return im
    nw, nh = int(W*z), int(H*z)
    im2 = im.resize((nw,nh), Image.LANCZOS)
    left = int(round(cx*z - W/2)); top = int(round(cy*z - H/2))
    return im2.crop((left, top, left+W, top+H))

def particles(frame, t, dark=True, n=70, alpha=0.35):
    d = ImageDraw.Draw(frame)
    for i in range(n):
        # deterministic drift
        seed = i*37.17
        bx = (seed*97.3) % W
        by = (seed*53.7) % H
        sp = 4 + (i%7)*2.2
        y = (by - t*sp) % H
        x = bx + math.sin(t*0.12 + i*1.7)*12
        r = 0.8 + (i%5)*0.45
        a = alpha*(0.35+0.65*(0.5+0.5*math.sin(t*0.5+i*2.1)))
        col = (160,225,250,int(255*a)) if dark else (30,95,130,int(255*a*0.5))
        d.ellipse([x-r,y-r,x+r,y+r], fill=col)
    return frame

# ---------- globe ----------
N_LANG = 7030
def _fib_sphere(n):
    i = np.arange(n)+0.5
    phi = np.arccos(1-2*i/n)
    theta = np.pi*(1+5**0.5)*i
    x = np.sin(phi)*np.cos(theta)
    y = np.cos(phi)
    z = np.sin(phi)*np.sin(theta)
    return np.stack([x,y,z],1).astype(np.float32)
SPHERE = _fib_sphere(N_LANG)

def draw_globe(frame, cx, cy, r, t, alpha=1.0, points=True, rings=True, glow=True):
    if alpha <= 0: return
    if glow:
        # atmosphere
        gl = Image.new('RGBA', (int(r*2.6), int(r*2.6)), (0,0,0,0))
        gd = ImageDraw.Draw(gl)
        for k in range(14,0,-1):
            rr = r*(1.02 + k*0.035)
            a = max(0, 9-k)*2.2*alpha
            gd.ellipse([gl.width/2-rr, gl.height/2-rr, gl.width/2+rr, gl.height/2+rr],
                       fill=(0,120,175,int(a)))
        gl = gl.filter(ImageFilter.GaussianBlur(r*0.06))
        frame.alpha_composite(gl, (int(cx-gl.width/2), int(cy-gl.height/2)))
    if rings:
        d = ImageDraw.Draw(frame)
        d.ellipse([cx-r,cy-r,cx+r,cy+r], outline=(0,158,219,int(55*alpha)), width=1)
        d.ellipse([cx-r*0.995,cy-r*0.995,cx+r*0.995,cy+r*0.995], outline=(120,220,255,int(18*alpha)), width=1)

    if points:
        # rotate around Y, then a small tilt around X
        ang = 0.10*t + 0.8
        ca, sa = math.cos(ang), math.sin(ang)
        x = SPHERE[:,0]*ca + SPHERE[:,2]*sa
        z = -SPHERE[:,0]*sa + SPHERE[:,2]*ca
        y = SPHERE[:,1]
        tilt = 0.20
        ct, st = math.cos(tilt), math.sin(tilt)
        y2 = y*ct - z*st
        z2 = y*st + z*ct
        sx = cx + x*r
        sy = cy - y2*r
        depth = z2
        # full-resolution accumulation
        bw, bh = W, H
        bx = sx.astype(np.int32)
        by = sy.astype(np.int32)
        ok = (bx>=1)&(bx<bw-1)&(by>=1)&(by<bh-1)
        bx, by, depth = bx[ok], by[ok], depth[ok]
        tw = 0.68+0.32*np.sin(t*2.1 + np.arange(len(bx))*0.73)
        inten = ((0.38 + 1.55*np.clip(depth,0,1)**1.2)*tw).astype(np.float32)
        buf = np.zeros((bh,bw),np.float32)
        np.add.at(buf, (by,bx), inten)
        np.add.at(buf, (by+1,bx), inten*0.42)
        np.add.at(buf, (by-1,bx), inten*0.30)
        np.add.at(buf, (by,bx+1), inten*0.42)
        np.add.at(buf, (by,bx-1), inten*0.30)
        np.add.at(buf, (by+1,bx+1), inten*0.16)
        np.add.at(buf, (by-1,bx-1), inten*0.12)
        buf = np.clip(buf,0,2.9)
        # colour by depth: deep blue back, pale cyan front
        deep = np.array([4,38,62],np.float32); pale = np.array([190,242,255],np.float32)
        col = deep[None,None,:] + (pale-deep)[None,None,:]*np.clip(buf[...,None]/1.35,0,1)
        rgb = (col).astype(np.uint8)
        alp = (np.clip(buf,0,1)*255*alpha).astype(np.uint8)
        layer = Image.fromarray(np.dstack([rgb, alp]), 'RGBA')
        frame.alpha_composite(layer)
        # bloom
        small = Image.fromarray(np.dstack([rgb, (np.clip(buf,0,1)*175*alpha).astype(np.uint8)]), 'RGBA').resize((270,480), Image.BILINEAR)
        small = small.filter(ImageFilter.GaussianBlur(7))
        bloom = small.resize((W,H), Image.BILINEAR)
        frame.alpha_composite(bloom)
    return frame

# ---------- shared bits ----------
def hud(frame, t, dark=True, chapter=''):
    col = WHITE if dark else INK
    mut = MUT_D if dark else MUT_L
    d = ImageDraw.Draw(frame)
    a = fade(t, 0.2, 1.0, 46.2, 46.8)
    if a <= 0: return
    # top left
    d.rectangle([78,86,92,94], fill=rgba(BLUE, 255*a))
    text_layer(['UNITED NATIONS'], 'inter_m', 16, col, 3.2, 1.0, 'left').draw(frame, 105, 78, a)
    text_layer(['A THEME FOR DEEPSEEK HARNESS'], 'inter', 11, mut, 2.0, 1.0, 'left').draw(frame, 105, 102, a)
    # top right chapter
    if chapter:
        text_layer([chapter], 'inter_m', 11, mut, 2.4, 1.0, 'right').draw(frame, W-78, 82, a*0.9)
        d.ellipse([W-88, 103, W-84, 107], fill=rgba(BLUE, 255*a*0.9))
    # bottom tiny
    text_layer(['WE THE PEOPLES · 1945—2025'], 'inter', 10, mut, 2.2, 1.0, 'left').draw(frame, 78, H-56, a*0.65)

def chapter(title, num, dark=True, t=0, alpha=1.0, x=78, y=None):
    # helper for a large in-scene chapter marker (unused for now)
    pass

def label_caps(text, color, size=12, tracking=2.6, dark=True):
    return blk([text], 'inter_m', size, color, tracking, 1.0, 'left')

# ---------- scenes ----------
def scene_prologue(t):
    frame = background('dark').copy()
    frame = particles(frame, t, True, 80, 0.4)
    # faint emblem watermark in the dust
    ga = fade(t, 0.6, 2.0, 4.6, 6.0)
    if ga > 0:
        wm = emblem(760, 'white').copy()
        a = wm.getchannel('A').point([int(i*0.030*ga) for i in range(256)])
        wm.putalpha(a)
        frame.alpha_composite(wm, (int(W/2-wm.width/2), int(1180-wm.height/2)))
    # 1945 + san francisco
    a = fade(t, 0.9, 1.7, 2.8, 3.7)
    if a > 0:
        b = blk(['1945'], 'sg_l', 250, WHITE, 12, 1.0, 'center')
        b.draw(frame, W/2, 690, a, dy=(1-ease_out_cubic(seg(t,0.9,2.0)))*22)
        b2 = blk(['SAN FRANCISCO'], 'inter_m', 15, CYAN, 5.4, 1.0, 'center')
        b2.draw(frame, W/2, 980, a*0.85)
        b3 = blk(['37.7749° N · 122.4194° W'], 'mono', 11, MUT_D, 1.4, 1.0, 'center')
        b3.draw(frame, W/2, 1014, a*0.55)
    # ring + emblem
    ra = fade(t, 3.3, 5.0)
    if ra > 0:
        d = ImageDraw.Draw(frame)
        cy = 500
        rr = 250
        sweep = ease_in_out_cubic(seg(t,3.3,5.8))
        d.arc([W/2-rr,cy-rr,W/2+rr,cy+rr], -90, -90+360*sweep, fill=rgba(BLUE, int(140*ra)), width=2)
        d.arc([W/2-rr*0.86,cy-rr*0.86,W/2+rr*0.86,cy+rr*0.86], -90, -90+360*min(1,sweep*1.25), fill=rgba(BLUE, int(45*ra)), width=1)
        ea = fade(t, 5.6, 6.7)
        if ea > 0:
            e = emblem(330, 'white')
            ex, ey = W/2-e.width/2, cy-e.height/2
            g = glow_emblem(330, CYAN, 24, 70)
            frame.alpha_composite(g, (int(ex-24), int(ey-24)))
            frame.alpha_composite(e, (int(ex), int(ey)))
    # source line
    a = fade(t, 4.3, 5.3)
    if a > 0:
        b = blk(['《联合国宪章》序言'], 'sans', 20, (176,202,218), 3.4, 1.0, 'center')
        b.draw(frame, W/2, 800, a*0.9)
    # big line
    a = fade(t, 6.05, 6.80)
    if a > 0:
        b = blk(['我联合国人民'], 'serif', 116, WHITE, 7, 1.05, 'center')
        b.draw(frame, W/2, 905, a, dy=(1-ease_out_cubic(seg(t,6.25,7.45)))*24)
    a2 = fade(t, 6.95, 7.55)
    if a2 > 0:
        b = blk(['同兹决心'], 'serif', 58, (212,224,232), 10, 1.0, 'center')
        b.draw(frame, W/2, 1068, a2, dy=(1-ease_out_cubic(seg(t,7.0,8.0)))*18)
    a3 = fade(t, 7.55, 8.15)
    if a3 > 0:
        b = blk(['WE THE PEOPLES OF THE UNITED NATIONS'], 'inter_m', 16, BLUE, 4.2, 1.0, 'center')
        b.draw(frame, W/2, 1205, a3)
    # footer source
    a = fade(t, 5.2, 6.2, 8.4, 8.8)
    if a > 0:
        b = blk(['序言 · 旧金山 · 1945'], 'sans', 13, MUT_D, 2.6, 1.0, 'center')
        b.draw(frame, W/2, 1310, a*0.7)
    hud(frame, t, True, '00 / PROLOGUE')
    frame = push_in(frame, 1+0.016*ease_in_out_cubic(seg(t,0.6,8.8)))
    out = finish(frame, t, True, 5.2)
    if t < 0.7:
        out = Image.blend(Image.new('RGBA',(W,H),(0,0,0,255)), out, ease_out_cubic(seg(t,0,0.7)))
    return out

def scene_number(t):
    frame = background('deep').copy()
    frame = particles(frame, t, True, 90, 0.32)
    # eyebrow
    a = fade(t, 9.0, 9.8)
    if a > 0:
        b = blk(['今天，世界上有'], 'sans', 24, (168,196,213), 4.0, 1.0, 'center')
        b.draw(frame, W/2, 350, a*0.9)
        b2 = blk(['TODAY, ON EARTH'], 'inter_m', 11, BLUE, 4.4, 1.0, 'center')
        b2.draw(frame, W/2, 318, a*0.85)
    # counter
    ca = fade(t, 9.2, 9.8)
    if ca > 0:
        p = ease_out_expo(seg(t, 9.3, 11.8))
        n = int(round(7030*p))
        txt = f'{n:,}'
        b = blk([txt], 'sg_l', 196, WHITE, 2, 1.0, 'center')
        b.draw(frame, W/2, 430, ca)
    # caption
    a = fade(t, 10.2, 11.2)
    if a > 0:
        b = blk(['种活着的语言'], 'serif', 40, WHITE, 5, 1.0, 'center')
        b.draw(frame, W/2, 668, a)
        b2 = blk(['LIVING LANGUAGES'], 'inter_m', 11, BLUE, 4.4, 1.0, 'center')
        b2.draw(frame, W/2, 736, a*0.9)
    # one dot one language
    a = fade(t, 13.3, 14.1)
    if a > 0:
        b = blk(['一个点，一门语言。'], 'serif', 34, (205,222,232), 6, 1.0, 'center')
        b.draw(frame, W/2, 805, a*0.95)
    # globe
    ga = fade(t, 10.9, 12.2)
    if ga > 0:
        gr = 36 + 350*ease_out_cubic(seg(t,10.9,13.9))
        draw_globe(frame, W/2, 1300, gr, t, ga)
    # floating specimens
    specs = [
        ('中文', 'Hans', 74, 1040, 'left', 164, 1108, 260, 1136),
        ('العربية', 'Arab', 1006, 1018, 'right', 916, 1082, 830, 1114),
        ('Kiswahili', 'Latn', 74, 1368, 'left', 172, 1416, 280, 1392),
        ('Español', 'Latn', 1006, 1424, 'right', 908, 1462, 800, 1428),
    ]
    for i,(txt,scr,x,y,al,lx,ly,ex,ey) in enumerate(specs):
        aa = fade(t, 13.75+i*0.18, 14.55+i*0.18)*0.9
        if aa > 0:
            f = F_script(scr, 28)
            d = ImageDraw.Draw(frame)
            w = f.getlength(txt)
            tx = x if al=='left' else x-w
            d.text((tx,y), txt, font=f, fill=rgba((172,230,252), int(255*aa)), direction=('rtl' if scr=='Arab' else None))
            d.line([lx,ly,ex,ey], fill=rgba(BLUE, int(65*aa)), width=1)
            d.ellipse([ex-2.5,ey-2.5,ex+2.5,ey+2.5], fill=rgba(CYAN, int(210*aa)))
    hud(frame, t, True, '01 / LANGUAGE')
    out = finish(frame, t, True, 5.0)
    return out

def scene_contrast(t):
    frame = background('deep').copy()
    # headline
    a = fade(t, 14.9, 15.7, 17.8, 18.0)
    if a > 0:
        b = blk(['大多数 AI 界面，'], 'serif', 38, (170,192,205), 4, 1.0, 'center')
        b.draw(frame, W/2, 300, a*0.9)
        b2 = blk(['只列出十几种。'], 'serif', 58, WHITE, 4, 1.0, 'center')
        b2.draw(frame, W/2, 380, a)
        b3 = blk(['A DOZEN, AT BEST.'], 'inter_m', 11, BLUE, 4.2, 1.0, 'center')
        b3.draw(frame, W/2, 490, a*0.8)
    # left globe, small
    ga = fade(t, 15.0, 16.0, 17.8, 18.0)
    if ga > 0:
        draw_globe(frame, 270, 865, 200, t+4, ga, points=True, rings=True)
        b = blk(['7,030'], 'sg_l', 62, WHITE, 1, 1.0, 'center')
        b.draw(frame, 270, 1135, ga)
        b2 = blk(['LANGUAGES'], 'inter_m', 10, CYAN, 3.6, 1.0, 'center')
        b2.draw(frame, 270, 1205, ga*0.8)
    # dropdown card
    da = fade(t, 15.2, 16.1, 17.8, 18.0)
    if da > 0:
        cw, ch = 430, 640
        cx, cy = 550, 640
        cardim = Image.new('RGBA', (cw,ch), (255,255,255,255))
        d = ImageDraw.Draw(cardim)
        d.rounded_rectangle([0,0,cw-1,ch-1], radius=20, fill=(255,255,255,255))
        d.text((30,26), 'Language', font=F('sans',18), fill=(30,50,66,255))
        d.text((30,52), '语言', font=F('sans',12), fill=(140,155,165,255))
        # chevron
        d.line([cw-48,38,cw-38,48,cw-28,38], fill=(120,140,155,255), width=2)
        d.line([30,82,cw-30,82], fill=(232,236,239,255), width=1)
        langs = [
            ('English','Latn'),('中文','Hans'),('日本語','Jpan'),('Español','Latn'),
            ('Français','Latn'),('Deutsch','Latn'),('Português','Latn'),('Русский','Cyrl'),
            ('한국어','Kore'),('Italiano','Latn'),('العربية','Arab'),('हिन्दी','Deva'),
        ]
        for i,(txt,scr) in enumerate(langs):
            yy = 94 + i*40
            if i % 2 == 0:
                d.rectangle([12,yy-4,cw-12,yy+36], fill=(248,250,251,255))
            f = F_script(scr, 19)
            d.text((30,yy+4), txt, font=f, fill=(35,55,70,255), direction=('rtl' if scr=='Arab' else None))
            if i == 0:
                d.ellipse([cw-44,yy+8,cw-36,yy+16], fill=(0,158,219,255))
        d.rounded_rectangle([0,0,cw-1,ch-1], radius=20, outline=(225,231,235,255), width=1)
        cardim, inset = with_shadow(cardim, radius=20, blur=30, dy=18, opacity=80, inset=45)
        frame.alpha_composite(cardim, (cx-inset, cy-inset))
        b12 = blk(['12'], 'sg_l', 70, WHITE, 1, 1.0, 'center')
        b12.draw(frame, cx+cw/2, cy+ch+40, da)
        b13 = blk(['LANGUAGES LISTED'], 'inter_m', 10, MUT_D, 3.2, 1.0, 'center')
        b13.draw(frame, cx+cw/2, cy+ch+132, da*0.9)
        # dim with alpha if needed
    # pivot line
    pa = fade(t, 18.05, 18.6, 19.05, 19.35)
    if pa > 0:
        # scrim
        scrim = Image.new('RGBA', (W,H), (2,7,12,int(170*pa)))
        frame.alpha_composite(scrim)
        gh = blk(['CHOICE'], 'sg_l', 360, (180,220,240), 12, 1.0, 'center')
        gh.draw(frame, W/2, 790, 0.028*pa)
        d = ImageDraw.Draw(frame)
        d.line([W/2-60, 760, W/2+60, 760], fill=rgba(BLUE, int(200*pa)), width=2)
        b = blk(['这不是技术问题。'], 'serif', 50, WHITE, 5, 1.0, 'center')
        b.draw(frame, W/2, 820, pa)
        b2 = blk(['是选择。'], 'serif', 76, WHITE, 8, 1.0, 'center')
        b2.draw(frame, W/2, 915, pa)
        b3 = blk(['IT IS A CHOICE.'], 'inter_m', 13, BLUE, 4.4, 1.0, 'center')
        b3.draw(frame, W/2, 1055, pa*0.95)
    hud(frame, t, True, '01 / LANGUAGE')
    out = finish(frame, t, True, 5.0)
    return out


# ---------- card/utility scenes ----------
def put_card(frame, ct, x, y, alpha=1.0):
    im, inset = ct
    if alpha <= 0.002: return
    if alpha < 0.998:
        lut = [int(i*alpha) for i in range(256)]
        im = im.copy(); im.putalpha(im.getchannel('A').point(lut))
    frame.alpha_composite(im, (int(round(x-inset)), int(round(y-inset))))

@lru_cache(maxsize=16)
def blank_card(w, h, radius=20, fill=(255,255,255,255), border=None, shadow=True):
    im = Image.new('RGBA', (w,h), (0,0,0,0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([0,0,w-1,h-1], radius=radius, fill=fill)
    if border: d.rounded_rectangle([0,0,w-1,h-1], radius=radius, outline=border, width=1)
    if shadow:
        return with_shadow(im, radius=radius, blur=26, dy=16, opacity=65, inset=40)
    return im, 0

def globe_icon(size, color=BLUE, width=3):
    im = Image.new('RGBA', (size,size), (0,0,0,0))
    d = ImageDraw.Draw(im)
    m = size*0.10
    d.ellipse([m,m,size-m,size-m], outline=color+(255,), width=width)
    d.ellipse([size*0.34,m,size*0.66,size-m], outline=color+(255,), width=width)
    d.line([m,size/2,size-m,size/2], fill=color+(255,), width=width)
    # latitudes
    d.arc([m,size*0.30,size-m,size*0.70], 200, 340, fill=color+(255,), width=width)
    d.arc([m,size*0.30,size-m,size*0.70], 20, 160, fill=color+(255,), width=width)
    return im

def gear_icon(size, color=(90,110,125)):
    im = Image.new('RGBA', (size,size), (0,0,0,0))
    d = ImageDraw.Draw(im)
    c = size/2
    d.ellipse([c-size*0.23,c-size*0.23,c+size*0.23,c+size*0.23], outline=color+(255,), width=max(2,int(size*0.055)))
    d.ellipse([c-size*0.07,c-size*0.07,c+size*0.07,c+size*0.07], outline=color+(255,), width=max(2,int(size*0.045)))
    for i in range(8):
        a = i*math.pi/4
        x0 = c + math.cos(a)*size*0.25; y0 = c + math.sin(a)*size*0.25
        x1 = c + math.cos(a)*size*0.34; y1 = c + math.sin(a)*size*0.34
        d.line([x0,y0,x1,y1], fill=color+(255,), width=max(2,int(size*0.06)))
    return im

def keycap(label, font_key='inter_m', size=15, padx=12, h=34):
    f = F(font_key,size)
    w = int(f.getlength(label)+padx*2)
    im = Image.new('RGBA',(w,h),(0,0,0,0)); d=ImageDraw.Draw(im)
    d.rounded_rectangle([0,0,w-1,h-1], radius=7, fill=(255,255,255,255), outline=(206,212,216,255), width=1)
    bb = f.getbbox(label); tw = f.getlength(label)
    d.text(((w-tw)/2, (h-(bb[3]-bb[1]))/2-bb[1]), label, font=f, fill=(55,72,86,255))
    return im

# ---------- photo assets ----------
PHOTO_META = {
    'benin':   ('Kassim Traoré (VOA) · Public domain · BENIN', 'Blue helmets from Benin, Bamako, 2018'),
    'shamrock':('Irish Defence Forces · CC BY 2.0 · LEBANON', '42nd Infantry Group, Shamrock Parade, Lebanon'),
    'mali':    ('MONUSCO Photos · CC BY-SA 4.0 · MALI', 'Bangladeshi peacekeepers, Northern Mali'),
    'nile':    ('Besserwisser123 · CC BY-SA 4.0 · SOUTH SUDAN', 'UNMISS trucks collect drinking water from the Nile'),
}

@lru_cache(maxsize=8)
def photo_parts(name):
    im = Image.open(os.path.join(ROOT,'assets/bg',name+'.webp')).convert('RGB')
    # grade
    a = np.asarray(im).astype(np.float32)/255.0
    lum = (a[:,:,0]*0.299+a[:,:,1]*0.587+a[:,:,2]*0.114)[...,None]
    a = a*0.87 + lum*0.13
    a = np.clip((a-0.5)*1.06+0.5,0,1)
    sh = (1-lum)**2
    a = a + sh*np.array([0.002,0.010,0.024],np.float32)
    hi = lum**2
    a = a + hi*np.array([0.018,0.010,0.000],np.float32)
    a = np.clip(a,0,1)
    graded = Image.fromarray((a*255).astype(np.uint8))
    # background fill 1080x1920, blurred and dark
    bg = graded.resize((W,int(graded.height*W/graded.width)), Image.LANCZOS)
    if bg.height < H:
        bg = bg.resize((int(bg.width*H/bg.height), H), Image.LANCZOS)
    left = (bg.width-W)//2; top=(bg.height-H)//2
    bg = bg.crop((left,top,left+W,top+H)).filter(ImageFilter.GaussianBlur(38))
    ba = np.asarray(bg).astype(np.float32)*0.42
    ba[:,:,2] += 10; ba[:,:,0] *= 0.86
    bg = Image.fromarray(np.clip(ba,0,255).astype(np.uint8)).convert('RGBA')
    # band 1150x766 (ken burns source)
    bw, bh = 1150, 766
    band = graded.resize((int(graded.width*bh/graded.height), bh), Image.LANCZOS)
    if band.width < bw:
        band = band.resize((bw, int(band.height*bw/band.width)), Image.LANCZOS)
    left=(band.width-bw)//2; top=(band.height-bh)//2
    band = band.crop((left,top,left+bw,top+bh))
    # gentle contrast/vignette on band
    ar = np.asarray(band).astype(np.float32)
    yy=np.linspace(-1,1,bh)[:,None]; xx=np.linspace(-1,1,bw)[None,:]
    v=np.clip(1-0.30*np.clip((np.sqrt(xx*xx*0.5+yy*yy*0.5)-0.35)/0.7,0,1)**1.6,0,1)
    ar*=v[...,None]
    band=Image.fromarray(np.clip(ar,0,255).astype(np.uint8)).convert('RGBA')
    return bg, band

def photo_frame(name, t, local_t, offset=0.0, zoom=1.0):
    bg, band = photo_parts(name)
    frame = bg.copy()
    # ken burns crop
    k = ease_in_out_cubic(seg(local_t,0,3.0))
    maxdx = band.width-1080; maxdy=band.height-720
    dx = int(maxdx*(0.15+0.7*k))
    dy = int(maxdy*(0.5+0.2*math.sin(t*0.3)))
    if zoom != 1.0:
        nw, nh = int(1080*zoom), int(720*zoom)
        band2 = band.resize((nw,nh), Image.LANCZOS)
        dx = (nw-1080)//2; dy=(nh-720)//2
        crop = band2.crop((dx,dy,dx+1080,dy+720))
    else:
        crop = band.crop((dx,dy,dx+1080,dy+720))
    frame.alpha_composite(crop, (0,600))
    # thin frame lines
    d=ImageDraw.Draw(frame)
    d.line([0,599,W,599], fill=(255,255,255,28), width=1)
    d.line([0,1320,W,1320], fill=(255,255,255,28), width=1)
    return frame

def scene_ui(t):
    frame = background('paper').copy()
    # faint emblem watermark
    wm = emblem(640,'blue').copy()
    wm.putalpha(wm.getchannel('A').point(lambda v:int(v*0.030)))
    frame.alpha_composite(wm, (int(W-300), int(-160)))
    # ---------- answer part ----------
    if t < 25.5:
        a = fade(t, 19.42, 19.70, 25.0, 25.4)
        if a > 0:
            b1 = blk(['我们把每一种语言，'], 'serif', 40, INK, 4, 1.0, 'center')
            b1.draw(frame, W/2, 285, a*0.92, dy=(1-ease_out_cubic(seg(t,19.42,19.95)))*18)
            b2 = blk(['都放进了界面。'], 'serif', 56, INK, 6, 1.0, 'center')
            b2.draw(frame, W/2, 350, a, dy=(1-ease_out_cubic(seg(t,19.5,20.05)))*18)
            b3 = blk(['SO WE PUT EVERY LANGUAGE IN THE INTERFACE'], 'inter_m', 11, BLUE, 3.4, 1.0, 'center')
            b3.draw(frame, W/2, 455, a*0.9)
        ca = fade(t, 19.68, 20.20, 25.0, 25.4)
        if ca > 0:
            ct_zh = card(os.path.join(ASSETS,'picker.png'), 900, radius=18, sharpen=1.0)
            ct_ar = card(os.path.join(ASSETS,'picker_ar.png'), 900, radius=18, sharpen=1.0)
            # RTL crossfade 22.2-22.8 and back 23.6-24.2
            rtl = seg(t,22.2,22.8)*(1-seg(t,23.6,24.2))
            put_card(frame, ct_zh, 90, 540+ (1-ease_out_cubic(seg(t,19.68,20.45)))*40, ca*(1-rtl))
            if rtl > 0:
                put_card(frame, ct_ar, 90, 540, ca*rtl)
            # rtl tag
            if rtl > 0.02:
                b = blk(['RTL · العربية'], 'inter_m', 12, BLUE, 2.6, 1.0, 'right')
                b.draw(frame, 992, 508, ca*rtl*0.95)
            # stats
            st = fade(t, 21.0, 21.5, 25.0, 25.4)
            if st > 0:
                stats = [('7,030','种语言'),('127','种完整翻译'),('193','个会员国')]
                xs=[270,540,810]
                for i,(num,lab) in enumerate(stats):
                    b = blk([num], 'sg_m', 34, INK, 1, 1.0, 'center')
                    b.draw(frame, xs[i], 1400, st)
                    b2 = blk([lab], 'sans', 12, MUT_L, 2.4, 1.0, 'center')
                    b2.draw(frame, xs[i], 1448, st*0.9)
                    if i>0:
                        ImageDraw.Draw(frame).line([xs[i]-150,1405,xs[i]-150,1478], fill=rgba(LINE_L, int(255*st)), width=1)
                b3 = blk(['覆盖度诚实可见 · 缺失回退英文'], 'sans', 13, MUT_L, 2.2, 1.0, 'center')
                b3.draw(frame, W/2, 1525, st*0.75)
    # ---------- look part ----------
    lc = fade(t, 25.35, 26.15, 31.1, 31.4)
    if lc > 0:
        # headline A
        ha = lc*(1-seg(t,28.85,29.15))
        if ha > 0:
            b1 = blk(['白色，联合国蓝，'], 'serif', 42, INK, 4, 1.0, 'center')
            b1.draw(frame, W/2, 268, ha)
            b2 = blk(['维和的影像，宪章的字句。'], 'serif', 42, INK, 4, 1.0, 'center')
            b2.draw(frame, W/2, 332, ha)
            b3 = blk(['WHITE · UN BLUE · PEACEKEEPING · THE CHARTER'], 'inter_m', 10, BLUE, 3.2, 1.0, 'center')
            b3.draw(frame, W/2, 424, ha*0.9)
        # headline B
        hb = lc*seg(t,28.95,29.5)
        if hb > 0:
            b1 = blk(['它看起来像联合国。'], 'serif', 44, INK, 4, 1.0, 'center')
            b1.draw(frame, W/2, 268, hb)
            b2 = blk(['它工作起来，还是 DSH。'], 'serif', 44, INK, 4, 1.0, 'center')
            b2.draw(frame, W/2, 332, hb)
            b3 = blk(['IT LOOKS LIKE THE UN. IT WORKS LIKE DSH.'], 'inter_m', 10, BLUE, 3.0, 1.0, 'center')
            b3.draw(frame, W/2, 424, hb*0.9)
        # home cards: daylight then blue hour, crossfade
        rise = (1-ease_out_cubic(seg(t,25.35,26.2)))*45
        cy = 520 + rise
        ct_light = card(os.path.join(ASSETS,'home.png'), 1020, radius=20, sharpen=0.75)
        ct_dark  = card(os.path.join(ASSETS,'home_dark.png'), 1020, radius=20, sharpen=0.75)
        home_alpha = lc*(1-seg(t,28.55,29.05))
        dk = seg(t,27.55,28.25)*(1-seg(t,28.45,28.95))
        if home_alpha > 0:
            put_card(frame, ct_light, 30, cy, home_alpha*(1-dk))
            if dk>0: put_card(frame, ct_dark, 30, cy, home_alpha*dk)
            cap = 'DAYLIGHT' if dk < 0.5 else 'BLUE HOUR'
            b = blk([f'HOME · {cap}'], 'inter_m', 11, MUT_L, 3.0, 1.0, 'left')
            b.draw(frame, 52, cy-36, home_alpha*0.9)
        # bottom spec strip under home
        spec_a = lc*fade(t,25.8,26.4,28.5,28.9)
        if spec_a > 0:
            items = [('两套色板','DAYLIGHT · BLUE HOUR'),('六张影像','PEACEKEEPING'),('两条丝带','CHARTER · FACTS')]
            xs=[210,540,870]
            for i,(zh,en) in enumerate(items):
                b1 = blk([zh], 'sans', 18, INK, 2.0, 1.0, 'center')
                b1.draw(frame, xs[i], 1215, spec_a*0.9)
                b2 = blk([en], 'inter_m', 10, MUT_L, 2.6, 1.0, 'center')
                b2.draw(frame, xs[i], 1252, spec_a*0.75)
                if i>0:
                    ImageDraw.Draw(frame).line([xs[i]-150,1218,xs[i]-150,1268], fill=rgba(LINE_L, int(255*spec_a*0.9)), width=1)
        # settings card, crossfade in after blue hour
        sa = lc*seg(t,28.75,29.45)
        if sa > 0:
            ct_set = card(os.path.join(ASSETS,'settings.png'), 680, radius=18, sharpen=0.9)
            put_card(frame, ct_set, 200, 540, sa)
            b = blk(['SETTINGS → UNITED NATIONS'], 'inter_m', 10, BLUE, 3.0, 1.0, 'left')
            b.draw(frame, 222, 506, sa)
            # small annotation
            b2 = blk(['语言 · 外观 · 背景 · 丝带 · 动态'], 'sans', 13, MUT_L, 2.2, 1.0, 'center')
            b2.draw(frame, W/2, 1265, sa*0.8)
    hud(frame, t, False, '02 / LANGUAGE' if t < 25.4 else '03 / DESIGN')
    return finish(frame, t, False, 3.2)

def scene_memory(t):
    frame = background('deep').copy()
    # photos 31.4-34.6
    pa = fade(t, 31.25, 31.8, 34.35, 34.7)
    if pa > 0:
        A = photo_frame('benin', t, t-31.4)
        B = photo_frame('shamrock', t, t-31.4)
        cross = seg(t,32.7,33.3)
        if cross <= 0: ph = A
        elif cross >= 1: ph = B
        else: ph = Image.blend(A,B,cross)
        # inset frame onto dark bg via alpha
        if pa < 1:
            ph = Image.blend(frame, ph, pa)
        frame = ph
        d = ImageDraw.Draw(frame)
        # headline
        a = fade(t, 31.6, 32.3, 34.2, 34.6)
        if a > 0:
            b1 = blk(['六张维和影像，'], 'serif', 44, WHITE, 4, 1.0, 'center')
            b1.draw(frame, W/2, 300, a)
            b2 = blk(['缓慢轮播。'], 'serif', 44, WHITE, 4, 1.0, 'center')
            b2.draw(frame, W/2, 365, a)
            b3 = blk(['SIX PEACEKEEPING PHOTOGRAPHS'], 'inter_m', 10, CYAN, 3.2, 1.0, 'center')
            b3.draw(frame, W/2, 455, a*0.85)
        # credits
        a = fade(t, 31.9, 32.5, 34.2, 34.6)
        if a > 0:
            name = 'benin' if t < 33.2 else 'shamrock'
            credit,title = PHOTO_META[name]
            b = blk(['每一张，都标注拍摄者、授权与出兵国。'], 'sans', 20, (196,212,222), 2.6, 1.0, 'left')
            b.draw(frame, 70, 1390, a*0.9)
            b2 = blk([credit], 'inter', 13, (141,167,184), 1.0, 1.0, 'left')
            b2.draw(frame, 70, 1442, a*0.8)
    # quote 34.6-37.6
    qa = fade(t, 34.55, 35.15, 37.15, 37.5)
    if qa > 0:
        qb = background('deep').copy()
        bg, band = photo_parts('shamrock')
        ghost = bg.copy(); ghost.putalpha(ghost.getchannel('A').point(lambda v:int(v*0.35)))
        qb.alpha_composite(ghost)
        d = ImageDraw.Draw(qb)
        d.line([W/2-70, 700, W/2+70, 700], fill=rgba(BLUE, int(200*qa)), width=2)
        b = blk(['The United Nations thanks you'], 'serif_latin', 32, WHITE, 0.5, 1.0, 'center')
        b.draw(qb, W/2, 800, qa)
        b = blk(['for your service and sacrifice.'], 'serif_latin', 32, WHITE, 0.5, 1.0, 'center')
        b.draw(qb, W/2, 852, qa)
        b2 = blk(['联合国感谢您的服务与牺牲。'], 'serif', 38, WHITE, 4, 1.0, 'center')
        b2.draw(qb, W/2, 960, qa*0.98)
        b3 = blk(['UNITED NATIONS PEACEKEEPING'], 'inter_m', 10, BLUE, 4.0, 1.0, 'center')
        b3.draw(qb, W/2, 1045, qa*0.9)
        if qa < 1:
            qb = Image.blend(frame, qb, qa)
        frame = qb
    hud(frame, t, True, '03 / MEMORY')
    return finish(frame, t, True, 4.8)

def scene_restraint(t):
    frame = background('paper').copy()
    a = fade(t, 37.64, 37.92, 41.55, 41.85)
    if a > 0:
        b1 = blk(['它只增加一个按钮。'], 'serif', 50, INK, 5, 1.0, 'center')
        b1.draw(frame, W/2, 300, a, dy=(1-ease_out_cubic(seg(t,37.64,38.15)))*18)
        b2 = blk(['原有操作，保持原样。'], 'sans', 26, MUT_L, 3.0, 1.0, 'center')
        b2.draw(frame, W/2, 400, a*0.9)
        b3 = blk(['EVERY EXISTING CONTROL, UNTOUCHED'], 'inter_m', 10, BLUE, 3.2, 1.0, 'center')
        b3.draw(frame, W/2, 468, a*0.8)
    # settings row card
    ca = fade(t, 37.78, 38.18, 41.55, 41.85)
    if ca > 0:
        cw, ch = 760, 210
        cim = Image.new('RGBA',(cw,ch),(0,0,0,0)); d=ImageDraw.Draw(cim)
        d.rounded_rectangle([0,0,cw-1,ch-1], radius=22, fill=(255,255,255,255), outline=(215,220,224,255), width=1)
        gi = gear_icon(44); cim.alpha_composite(gi,(40,82))
        d.text((100,80), '设置', font=F('sans',28), fill=INK+(255,))
        d.text((100,122), 'Settings', font=F('inter',13), fill=(130,145,155,255))
        d.line([40,52,cw-40,52], fill=(236,239,241,255), width=1)
        # globe button
        gx, gy = cw-150, ch/2
        # single halo + ring
        ph = (t*0.55) % 1.0
        rr = 44 + ph*14
        d.ellipse([gx-rr,gy-rr,gx+rr,gy+rr], outline=(0,158,219,int(45*(1-ph)*ca)), width=2)
        d.rounded_rectangle([gx-34,gy-34,gx+34,gy+34], radius=16, fill=(247,251,253,255), outline=(0,158,219,255), width=2)
        gi2 = globe_icon(44, BLUE, 2); cim.alpha_composite(gi2,(int(gx-22),int(gy-22)))
        d.text((gx-30,gy+44), '语言', font=F('sans',11), fill=(0,130,180,255))
        cim2, inset = with_shadow(cim, radius=22, blur=28, dy=18, opacity=55, inset=45)
        if ca < 1:
            lut=[int(i*ca) for i in range(256)]; cim2=cim2.copy(); cim2.putalpha(cim2.getchannel('A').point(lut))
        frame.alpha_composite(cim2, (int(W/2-cw/2-inset), int(760-inset)))
        # shortcut
        b = blk(['Ctrl / Cmd + Shift + L'], 'mono', 17, (70,90,106), 1.2, 1.0, 'center')
        b.draw(frame, W/2, 1080, ca*0.9)
        b2 = blk(['设置 → 联合国'], 'sans', 13, MUT_L, 2.4, 1.0, 'center')
        b2.draw(frame, W/2, 1130, ca*0.8)
        b3 = blk(['没有新的操作流程。'], 'serif', 22, MUT_L, 3.0, 1.0, 'center')
        b3.draw(frame, W/2, 1400, ca*0.9)
        b4 = blk(['NO NEW FLOWS.'], 'inter_m', 10, BLUE, 3.4, 1.0, 'center')
        b4.draw(frame, W/2, 1452, ca*0.8)
    hud(frame, t, False, '04 / RESTRAINT')
    return finish(frame, t, False, 3.2)

def scene_closing(t):
    frame = background('paper').copy()
    a = fade(t, 41.84, 42.18, 46.55, 46.95)
    if a > 0:
        e = emblem(150, 'blue')
        frame.alpha_composite(e, (int(W/2-e.width/2), 270))
        b = blk(['UNITED NATIONS'], 'sg_m', 40, INK, 8, 1.0, 'center')
        b.draw(frame, W/2, 470, a)
        b2 = blk(['a theme for DeepSeek Harness'], 'inter', 22, MUT_L, 0.6, 1.0, 'center')
        b2.draw(frame, W/2, 535, a*0.95)
        d = ImageDraw.Draw(frame)
        d.line([W/2-45, 610, W/2+45, 610], fill=rgba(BLUE, int(210*a)), width=2)
        b3 = blk(['为每一门语言，留一个位置。'], 'serif', 44, INK, 4, 1.0, 'center')
        b3.draw(frame, W/2, 690, a)
        b4 = blk(['A PLACE FOR EVERY LANGUAGE.'], 'inter_m', 12, BLUE, 3.8, 1.0, 'center')
        b4.draw(frame, W/2, 790, a*0.9)
        b5 = blk(['github.com/muzapar00/united_nation_skin_deepseek_harness'], 'inter', 17, INK, 0.2, 1.0, 'center')
        b5.draw(frame, W/2, 1040, a*0.9)
        b6 = blk(['v0.1.0 · MIT · Web / Desktop · Windows / macOS / Linux'], 'inter', 12, MUT_L, 1.0, 1.0, 'center')
        b6.draw(frame, W/2, 1090, a*0.75)
        b6b = blk(['如果你愿意，帮我们校正一门语言。'], 'serif', 24, INK, 3.0, 1.0, 'center')
        b6b.draw(frame, W/2, 1230, a*0.9)
        b6c = blk(['HELP REVIEW A LANGUAGE · LOCALES/<CODE>.JSON'], 'inter_m', 10, BLUE, 3.0, 1.0, 'center')
        b6c.draw(frame, W/2, 1280, a*0.8)
        b7 = blk(['A community project. Not an official United Nations product.'], 'inter', 14, (96,112,126), 0.3, 1.0, 'center')
        b7.draw(frame, W/2, 1560, a*0.9)
        b8 = blk(['非联合国官方产品，未获联合国背书。'], 'sans', 14, (96,112,126), 1.8, 1.0, 'center')
        b8.draw(frame, W/2, 1592, a*0.85)
        b9 = blk(['WE THE PEOPLES · 1945—2025'], 'inter_m', 11, GOLD, 3.6, 1.0, 'center')
        b9.draw(frame, W/2, 1700, a*0.95)
    # no HUD on the end card
    frame = push_in(frame, 1+0.014*ease_in_out_cubic(seg(t,42.0,47.0)))
    return finish(frame, t, False, 2.8)

SCENES = [
    (0.0, 8.8, scene_prologue, True),
    (8.8, 14.8, scene_number, True),
    (14.8, 19.4, scene_contrast, True),
    (19.4, 25.4, scene_ui, False),
    (25.4, 31.4, scene_ui, False),
    (31.4, 37.6, scene_memory, True),
    (37.6, 41.8, scene_restraint, False),
    (41.8, 47.0, scene_closing, False),
]

TRANSITIONS = [
    (8.8, 0.32, scene_prologue, scene_number),
    (14.8, 0.30, scene_number, scene_contrast),
    (41.8, 0.38, scene_restraint, scene_closing),
]
IRIS = [
    (31.4, 0.72, scene_ui, scene_memory),
]
FLASH = [
    (19.4, 0.20, scene_ui),
    (37.6, 0.20, scene_restraint),
]

def iris_frame(t, b, d, fn0, fn1):
    p = ease_in_out_cubic(seg(t, b, b+d))
    im0 = fn0(t); im1 = fn1(t)
    r = 220 + p * 900
    mask = Image.new('L', (W,H), 0)
    md = ImageDraw.Draw(mask)
    md.ellipse([W/2-r, 930-r, W/2+r, 930+r], fill=255)
    if 0 < r < 1119:
        mask = mask.filter(ImageFilter.GaussianBlur(1.2))
    out = im0.copy()
    out.paste(im1, (0,0), mask)
    dd = ImageDraw.Draw(out)
    ring_a = int(150*math.sin(math.pi*clamp(p)))
    if ring_a > 0 and r < 1115:
        dd.ellipse([W/2-r, 930-r, W/2+r, 930+r], outline=(0,158,219,ring_a), width=2)
        dd.ellipse([W/2-r+3, 930-r+3, W/2+r-3, 930+r-3], outline=(255,255,255,int(ring_a*0.35)), width=1)
    return out

def scene_for(t):
    for a,b,fn,dark in SCENES:
        if a <= t < b:
            return fn
    return scene_closing if t >= SCENES[-1][0] else scene_prologue

def render_frame(t):
    for b, d, fn1 in FLASH:
        if b <= t < b+d:
            im = fn1(t)
            al = (1-ease_out_cubic(seg(t,b,b+d)))*0.38
            veil = Image.new('RGBA', (W,H), (247,245,239,int(255*al)))
            return Image.alpha_composite(im, veil).convert('RGB')
    for b, d, fn0, fn1 in IRIS:
        if b <= t < b+d:
            return iris_frame(t, b, d, fn0, fn1).convert('RGB')
    for b, d, fn0, fn1 in TRANSITIONS:
        if abs(t-b) < d/2:
            p = smoothstep(seg(t, b-d/2, b+d/2))
            im0 = fn0(t); im1 = fn1(t)
            return Image.blend(im0, im1, p).convert('RGB')
    fn = scene_for(t)
    im = fn(t)
    if t > DUR-0.45:
        im = Image.blend(Image.new('RGBA',(W,H),(0,0,0,255)), im, 1-seg(t,DUR-0.45,DUR))
    return im.convert('RGB')

if __name__ == '__main__':
    times = [float(x) for x in sys.argv[1:]] or [2.0, 6.8, 10.6, 13.9, 16.4, 18.2]
    for tt in times:
        im = render_frame(tt)
        out = os.path.join(WORK, f'still_{tt:05.2f}.png')
        im.save(out)
        print('saved', out)
