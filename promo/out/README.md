# United Nations × DeepSeek Harness — promo kit

## 文件

| 文件 | 用途 |
|---|---|
| `un-skin-promo-9x16-silent.mp4` | 主片。1080×1920，30 fps，39.6 s，H.264，**无音轨**。 |
| `un-skin-promo-cover-3x4.png` | 小红书 / 竖版封面，1080×1440。 |
| `un-skin-promo-cover-16x9.png` | B 站 / YouTube / X 封面，1920×1080。 |
| `un-skin-promo.zh.srt` | 中文字幕（与画面文字对应，便于二次剪辑/无障碍）。 |
| `un-skin-promo.en.srt` | 英文字幕。 |
| `MUSIC-CUES.md` | 39.6 s 的情绪曲线、对拍点、声音设计建议。 |
| `SOCIAL-COPY.md` | 小红书 / 微博 / B 站 / X / 抖音文案。 |
| `CREDITS.md` | 素材、字体、照片授权与免责声明。 |

## 加音乐（剪映 / CapCut）

1. 新建 1080×1920、30 fps 项目，导入 `un-skin-promo-9x16-silent.mp4`。
2. 铺一条你选的音乐，按 `MUSIC-CUES.md` 的 `0.9 / 4.8 / 6.4 / 11.9 / 16.6 / 21.6 / 26.4 / 31.2 / 34.6` 对拍。
3. 如需卡点，优先保证 **16.6**（进入产品）与 **26.4**（进入维和）落在重拍。
4. 导出 1080×1920、30 fps、H.264；音频码率 192–320 kbps。

## 重新渲染（可选）

```bash
# 首次：准备截屏裁切与徽记
promo/.venv/bin/python promo/prepare_assets.py

# 静音主片
promo/.venv/bin/python promo/silent.py video promo/out/un-skin-promo-9x16-silent.mp4

# 封面
promo/.venv/bin/python promo/covers.py

# 关键帧
promo/.venv/bin/python promo/silent.py 5.0 10.9 18.0 27.5 36.5
```

## 事实与口径

- 7,030 种活着的语言：ISO 639-3（SIL）目录；项目内 `src/data/languages.json`。
- 127 种完整翻译：皮肤界面 + 52 条 DSH 核心词汇；缺失回退英文。
- 193 个会员国：联合国会员国列表。
- 六张维和照片：视频中展示其中两张，完整六张在皮肤内轮播。
- 项目为社区作品，**非联合国官方产品，未获联合国背书**。
