#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Silent social cut (9:16) of the United Nations skin promo.
Retimes the 47s master edit into a ~39.6s silent film with a kinetic
language-title sequence. No audio: add your own track.
"""
import os, sys, math, subprocess, time
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageChops
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import film as F

W, H = F.W, F.H
FPS = 30
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'out')
WORK = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'work')
os.makedirs(OUT, exist_ok=True)

# ---------------------------------------------------------------------------
# Retime: new seconds -> master seconds.  Control points are hand-cut so the
# titles hold long enough to read, while build-ups and dead air compress.
# ---------------------------------------------------------------------------
CP = [
    (0.00, 0.00),
    (0.90, 0.90),   # ticker hands over to 1945
    (1.20, 1.30),
    (3.20, 4.40),
    (4.60, 6.00),
    (5.00, 6.80),   # "我联合国人民" lands
    (6.40, 8.00),
    (6.60, 8.80),   # prologue -> number
    (7.20, 9.40),
    (9.80, 12.60),
    (10.90, 13.80), # "一个点，一门语言"
    (11.90, 14.80),
    (12.40, 15.40),
    (14.60, 17.90),
    (16.40, 19.30), # "是选择" hold
    (16.60, 19.40), # flash into paper
    (17.00, 20.10),
    (19.40, 22.80),
    (21.60, 25.40),
    (23.00, 27.40),
    (24.40, 28.80),
    (26.40, 31.30), # iris into memory
    (27.00, 31.90),
    (28.20, 33.20),
    (29.20, 34.40),
    (31.20, 37.30), # peacekeeping quote
    (31.80, 37.90),
    (33.40, 40.20),
    (34.60, 41.80), # end card
    (39.60, 47.00),
]
NEW_DUR = CP[-1][0]
NFRAMES = int(round(NEW_DUR*FPS))

def old_time(nt):
    nt = min(max(nt, 0.0), NEW_DUR)
    for (n0,o0),(n1,o1) in zip(CP, CP[1:]):
        if n0 <= nt <= n1:
            if n1 == n0: return o1
            return o0 + (o1-o0)*(nt-n0)/(n1-n0)
    return CP[-1][1]

# ---------------------------------------------------------------------------
# Kinetic language title strip
# ---------------------------------------------------------------------------
ROWS = [
    ('中文','Hans','zh'), ('العربية','Arab','ar'), ('Kiswahili','Latn','sw'),
    ('हिन्दी','Deva','hi'), ('Español','Latn','es'), ('Русский','Cyrl','ru'),
    ('日本語','Jpan','ja'), ('Français','Latn','fr'), ('Português','Latn','pt'),
    ('Türkçe','Latn','tr'), ('አማርኛ','Ethi','am'), ('Bahasa Indonesia','Latn','id'),
    ('한국어','Kore','ko'), ('বাংলা','Beng','bn'), ('עברית','Hebr','he'),
    ('Ελληνικά','Grek','el'), ('Tok Pisin','Latn','tpi'), ('ʻŌlelo Hawaiʻi','Latn','haw'),
    ('Diné bizaad','Latn','nv'), ('Gĩkũyũ','Latn','ki'), ('тоҷикӣ','Cyrl','tg'),
    ('မြန်မာ','Mymr','my'), ('ខ្មែរ','Khmr','km'), ('සිංහල','Sinh','si'),
    ('ཇོང་ཁ','Tibt','dz'), ('ትግርኛ','Ethi','ti'), ('Kreyòl ayisyen','Latn','ht'),
    ('Te Reo Māori','Latn','mi'), ('Na Vosa Vakaviti','Latn','fj'), ('toki pona','Latn','tok'),
]
ROW_H = 112

def build_ticker():
    strip = Image.new('RGBA', (W, ROW_H*len(ROWS)), (0,0,0,0))
    d = ImageDraw.Draw(strip)
    for i,(txt,scr,code) in enumerate(ROWS):
        y = i*ROW_H
        f = F.F_script(scr, 74)
        w = f.getlength(txt)
        if w > 800:
            f = F.F_script(scr, max(34,int(74*800/w)))
            w = f.getlength(txt)
        if i % 7 == 0:
            col=(135,228,255,235)
        elif i % 3 == 0:
            col=(178,216,232,215)
        else:
            col=(238,246,250,245) if i%2==0 else (238,246,250,170)
        d.text(((W-w)/2, y+18), txt, font=f, fill=col)
        d.text((1004, y+50), code, font=F.F('mono',12), fill=(110,160,185,120), anchor='ra')
        d.line([70, y+ROW_H-15, 1010, y+ROW_H-15], fill=(255,255,255,16), width=1)
    # alpha mask: clear at top/bottom, full in the middle
    m = Image.new('L', (W,H), 0)
    md = ImageDraw.Draw(m)
    for yy in range(H):
        if yy < 260: a = int(255*(yy/260)**1.4)
        elif yy > H-300: a = int(255*((H-yy)/300)**1.4)
        else: a = 255
        md.line([(0,yy),(W,yy)], fill=a)
    return strip, m

TICKER, TICKER_MASK = build_ticker()

def _scrim():
    im = Image.new('RGBA',(W,H),(0,0,0,0)); d=ImageDraw.Draw(im)
    for y in range(300):
        a = int(235*(1-y/300)**1.2)
        d.line([(0,y),(W,y)], fill=(2,8,14,a))
    for y in range(320):
        a = int(210*(y/320)**1.2)
        d.line([(0,H-1-y),(W,H-1-y)], fill=(2,8,14,a))
    return im
TICKER_SCRIM = _scrim()
TICKER_TALL = Image.new('RGBA', (W, ROW_H*len(ROWS)*2), (0,0,0,0))
TICKER_TALL.alpha_composite(TICKER, (0,0))
TICKER_TALL.alpha_composite(TICKER, (0, ROW_H*len(ROWS)))

def overlay_ticker(frame, nt):
    a = F.fade(nt, 0.0, 0.10, 0.58, 0.88)
    if a <= 0: return frame
    frame.alpha_composite(TICKER_SCRIM)
    # ease from fast to gentle
    speed = 900*(1-F.ease_out_cubic(F.seg(nt,0,0.45))) + 300
    off = int(190 + speed*nt + 250*nt*nt) % (ROW_H*len(ROWS))
    layer = TICKER_TALL.crop((0, off, W, off+H))
    lay = Image.new('RGBA', (W,H), (0,0,0,0))
    lay.alpha_composite(layer)
    lay.putalpha(ImageChops.multiply(lay.getchannel('A'), TICKER_MASK))
    if a < 1:
        lut=[int(i*a) for i in range(256)]
        lay.putalpha(lay.getchannel('A').point(lut))
    # a soft motion trail
    trail = lay.copy()
    trail.putalpha(trail.getchannel('A').point(lambda v:int(v*0.22)))
    frame.alpha_composite(trail, (0, -16))
    frame.alpha_composite(lay)
    return frame

# ---------------------------------------------------------------------------
def render_frame(nt):
    im = F.render_frame(old_time(nt))
    if nt < 1.1:
        im = overlay_ticker(im.convert('RGBA'), nt)
    return im.convert('RGB')

def render_stills(times):
    os.makedirs(WORK, exist_ok=True)
    for tt in times:
        im = render_frame(tt)
        p = os.path.join(WORK, f'silent_{tt:05.2f}.png')
        im.save(p)
        print('saved', p)

def contact_sheet(times, path, cols=5, thumb=(216,384)):
    ims=[render_frame(t).resize(thumb, Image.LANCZOS) for t in times]
    rows=(len(ims)+cols-1)//cols
    sheet=Image.new('RGB',(cols*thumb[0], rows*thumb[1]),(8,12,18))
    for i,im in enumerate(ims):
        sheet.paste(im, ((i%cols)*thumb[0], (i//cols)*thumb[1]))
    sheet.save(path)
    print('saved', path)

def render_video(path, crf=18, preset='slow'):
    cmd = ['ffmpeg','-y','-loglevel','error',
           '-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','-',
           '-an','-c:v','libx264','-preset',preset,'-crf',str(crf),
           '-pix_fmt','yuv420p','-movflags','+faststart',path]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    t0=time.time()
    for i in range(NFRAMES):
        nt=i/FPS
        im=render_frame(nt)
        p.stdin.write(im.tobytes())
        if i % 60 == 0:
            el=time.time()-t0
            print(f'frame {i}/{NFRAMES}  t={nt:5.2f}s  elapsed {el:5.1f}s', flush=True)
    p.stdin.close()
    p.wait()
    print('done', path, 'in', round(time.time()-t0,1),'s')

if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == 'video':
        out = sys.argv[2] if len(sys.argv)>2 else os.path.join(OUT,'un-skin-promo-9x16-silent.mp4')
        render_video(out)
    elif len(sys.argv) > 1 and sys.argv[1] == 'sheet':
        times=[float(x) for x in sys.argv[2:]] or [0.3,1.2,3.0,5.0,7.0,9.0,11.0,13.0,15.0,17.0,19.0,21.5,23.5,26.0,28.0,30.0,32.0,34.0,36.5]
        contact_sheet(times, os.path.join(WORK,'silent_sheet.png'))
    else:
        times=[float(x) for x in sys.argv[1:]] or [0.3,0.6,1.5,5.0,8.5,10.9,13.0,15.5,18.0,22.5,25.0,27.5,30.0,32.5,36.5]
        render_stills(times)
