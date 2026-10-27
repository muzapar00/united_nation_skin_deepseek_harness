#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Cover art for the United Nations skin promo."""
import os, sys, math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import film as F

ASSETS = F.ASSETS
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'out')
os.makedirs(OUT, exist_ok=True)

def bg(w,h, deep=True):
    y=np.linspace(0,1,h)[:,None]; x=np.linspace(0,1,w)[None,:]
    top=(5,13,24); bot=(2,7,12)
    a=np.zeros((h,w,3),np.float32)
    for i in range(3): a[:,:,i]=top[i]+(bot[i]-top[i])*(y**0.9)
    r=np.sqrt((x-0.45)**2+((y-0.35)*0.7)**2)
    g=np.clip(1-r/0.5,0,1)**2
    a += g[...,None]*np.array((0,80,125),np.float32)*0.55
    # dot grid
    ys=np.arange(15,h,30); xs=np.arange(15,w,30)
    a[ys[:,None],xs[None,:],:]*=0.985
    return Image.fromarray(np.clip(a,0,255).astype(np.uint8)).convert('RGBA')

def vignette(im, s=0.5):
    w,h=im.size; a=np.array(im).astype(np.float32)
    y=np.linspace(-1,1,h)[:,None]; x=np.linspace(-1,1,w)[None,:]
    r=np.sqrt(x*x*0.62+y*y*0.62)
    v=np.clip(1-s*np.clip((r-0.3)/0.85,0,1)**1.6,0,1)
    a*=v[...,None]
    return Image.fromarray(np.clip(a,0,255).astype(np.uint8)).convert('RGBA')

def make_3x4(path):
    W,H=1080,1440
    im=bg(W,H)
    d=ImageDraw.Draw(im)
    # brand
    d.rectangle([76,74,90,82], fill=F.BLUE+(255,))
    F.blk(['UNITED NATIONS'],'inter_m',15,F.WHITE,3.2,1.0,'left').draw(im,102,66,0.95)
    F.blk(['A THEME FOR DEEPSEEK HARNESS'],'inter',10,F.MUT_D,2.0,1.0,'left').draw(im,102,89,0.9)
    # emblem
    e=F.emblem(120,'white'); im.alpha_composite(e,(W-76-e.width,64))
    # eyebrow
    F.blk(['1945 — 2025 · WE THE PEOPLES'],'inter_m',11,F.GOLD,3.6,1.0,'left').draw(im,76,170,0.9)
    # big number
    F.blk(['7,030'],'sg_l',218,F.WHITE,1,1.0,'left').draw(im,68,210)
    F.blk(['种语言，'],'serif',56,F.WHITE,4,1.0,'left').draw(im,76,470)
    F.blk(['一个位置。'],'serif',56,F.WHITE,4,1.0,'left').draw(im,76,540)
    F.blk(['A PLACE FOR EVERY LANGUAGE.'],'inter_m',12,F.BLUE,3.6,1.0,'left').draw(im,78,625,0.95)
    # picker card
    ct=F.card(os.path.join(ASSETS,'picker.png'), 760, radius=18, sharpen=1.0)
    im.alpha_composite(ct[0], (int(W-760-80-ct[1]), int(672-ct[1])))
    # footer
    d.line([76,1352,W-76,1352], fill=(255,255,255,38), width=1)
    F.blk(['UNITED NATIONS × DEEPSEEK HARNESS'],'inter_m',10,F.MUT_D,2.6,1.0,'left').draw(im,76,1370,0.8)
    F.blk(['COMMUNITY THEME · NOT AN OFFICIAL UN PRODUCT'],'inter',9,F.MUT_D,2.0,1.0,'left').draw(im,76,1392,0.7)
    F.blk(['v0.1.0'],'inter',9,F.MUT_D,1.6,1.0,'right').draw(im,W-76,1370,0.7)
    im=vignette(im,0.45)
    im.convert('RGB').save(path, quality=95)
    print('saved',path,im.size)

def make_16x9(path):
    W,H=1920,1080
    im=bg(W,H)
    d=ImageDraw.Draw(im)
    d.rectangle([110,96,126,106], fill=F.BLUE+(255,))
    F.blk(['UNITED NATIONS'],'inter_m',17,F.WHITE,3.4,1.0,'left').draw(im,140,86,0.95)
    F.blk(['A THEME FOR DEEPSEEK HARNESS'],'inter',11,F.MUT_D,2.2,1.0,'left').draw(im,140,113,0.9)
    e=F.emblem(110,'white'); im.alpha_composite(e,(W-110-e.width,80))
    F.blk(['1945 — 2025 · WE THE PEOPLES'],'inter_m',12,F.GOLD,4.0,1.0,'left').draw(im,110,218,0.9)
    F.blk(['7,030'],'sg_l',250,F.WHITE,1,1.0,'left').draw(im,100,258)
    F.blk(['种语言，一个位置。'],'serif',66,F.WHITE,4,1.0,'left').draw(im,110,570)
    F.blk(['A PLACE FOR EVERY LANGUAGE.'],'inter_m',13,F.BLUE,4.0,1.0,'left').draw(im,112,672,0.95)
    F.blk(['白色 · 联合国蓝 · 维和影像 · 宪章字句'],'sans',20,F.MUT_D,2.6,1.0,'left').draw(im,112,730,0.85)
    d.line([110,832,560,832], fill=(255,255,255,35), width=1)
    F.blk(['UNITED NATIONS × DEEPSEEK HARNESS'],'inter_m',10,F.MUT_D,2.6,1.0,'left').draw(im,110,856,0.8)
    F.blk(['COMMUNITY THEME · NOT AN OFFICIAL UN PRODUCT'],'inter',9,F.MUT_D,2.0,1.0,'left').draw(im,110,878,0.7)
    F.blk(['v0.1.0 · MIT'],'inter',9,F.MUT_D,1.6,1.0,'left').draw(im,110,900,0.7)
    # picker card right
    cw=850
    ct=F.card(os.path.join(ASSETS,'picker.png'), cw, radius=20, sharpen=1.0)
    im.alpha_composite(ct[0], (int(W-cw-100-ct[1]), int(170-ct[1])))
    # subtle glow behind card
    im=vignette(im,0.45)
    im.convert('RGB').save(path, quality=95)
    print('saved',path,im.size)

if __name__ == '__main__':
    make_3x4(os.path.join(OUT,'un-skin-promo-cover-3x4.png'))
    make_16x9(os.path.join(OUT,'un-skin-promo-cover-16x9.png'))
