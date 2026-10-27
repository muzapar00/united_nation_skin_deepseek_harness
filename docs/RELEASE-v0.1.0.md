# United Nations skin — v0.1.0

**白底、联合国蓝、官方徽记、维和背景轮播，以及一个收录 7,030 种语言的选择器。**
First public release of a community theme for DeepSeek Harness.

## Highlights

- **Theme** — UN blue `#009EDB`, paper white and deep navy over the host's `--dsw-*` tokens; Daylight
  and Blue hour schemes; official emblem; 193 Member State flags shipped as vectors.
- **Peacekeeping background** — six UN photographs dissolve slowly behind the conversation, always
  credited, with the contributing country's flag and “The United Nations thanks you for your service
  and sacrifice”. Adjustable interval and intensity.
- **Ambient ribbons** — UN facts, Member State spotlights and the peacekeeping thank-you in one place;
  the Charter, the Universal Declaration, UNESCO and China's proposals to the UN in another.
  Date-aware on UN observances (29 May, 24 Oct, 27 Jan, 8–9 May, 10 Dec …).
- **Languages** — a 7,030-language catalogue (ISO 639-3 + CLDR endonyms) with search by native name,
  English name or code, region filters, suggestions, recents and honest coverage badges. **127
  languages** ship a complete skin interface and a 52-string DSH core vocabulary pack; English is
  always the fallback.
- **A United Nations settings page** — language, appearance, background, ribbons, motion, and an About
  panel with the Charter preamble in the active language, photo credits, the un.org link and the
  non-endorsement notice.
- **Installers** for Linux, macOS and Windows; the script finds the `desktop` or `web` profile, copies
  the package, and registers the bundle. Uninstall is one command.

## Install

```bash
git clone https://github.com/muzapar00/united_nation_skin_deepseek_harness.git
cd united_nation_skin_deepseek_harness
./scripts/install.sh            # Windows: .\scripts\install.ps1
# fully quit DeepSeek Harness, then start it again
```

Requires DeepSeek Harness ≥ 0.1.5. Tested on Linux Web; the desktop app uses the same front-end.

## Verify

```bash
node scripts/check-locales.mjs    # 127 languages, 0 errors
node src/build.mjs --check        # committed client.js matches src/
```

## Credits

Photographs: Kassim Traoré (VOA), MONUSCO Photos, Besserwisser123, Irish Defence Forces,
Oxfam East Africa — licenses and sources in `NOTICE` and `src/data/credits.json`.
Emblem: Wikimedia Commons. Flags: [flag-icons](https://github.com/lipis/flag-icons) (MIT).
Code MIT; translations and UN content CC BY-SA 4.0.

This is a community project. It is not an official United Nations product and is not endorsed by the
United Nations. 本项目为社区作品，非联合国官方产品。
