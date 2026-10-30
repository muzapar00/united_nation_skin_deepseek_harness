# United Nations skin — v0.2.0

The flags release. All 193 Member State flags now appear in the interface, and the easter egg drawer
is open.

## Highlights

- **Flags in use** — 193 Member State flags + the UN flag, shipped as vectors and embedded as crisp
  WebP thumbnails: the Member State spotlight in the facts ribbon, the contributing-country flag on
  the peacekeeping photo caption, a 193-flag mosaic in About, and a hidden full-screen flag wall.
  Emoji flags are no longer required, so Windows renders them correctly.
- **Flag wall** — open it from the conversation hero emblem, from the About emblem (three clicks), or
  with the Konami code. 193 flags, names in Chinese or English, and the peacekeeping thank-you.
- **Six official languages** — clicking “We the Peoples · 1945” in Settings cycles the Charter
  preamble opening in Chinese, English, French, Spanish, Russian and Arabic.
- **SDG strip** — the 17 official Sustainable Development Goal colours under the About credits, each
  with a tooltip and a link to un.org.
- **“peace”** — type it outside an input and the UNESCO Constitution line appears in the active
  language.
- **Smaller fixes** — the settings language button now closes Settings before opening the picker (the
  picker was rendering behind the settings panel); the picker body no longer leaves empty space.

## Install / update

```bash
cd united_nation_skin_deepseek_harness && git pull
./scripts/install.sh            # Windows: .\scripts\install.ps1
# fully quit and restart DeepSeek Harness
```

Existing installs only need the updated package copied again (the one-command installer is
idempotent).

Requires DeepSeek Harness ≥ 0.1.5. Tested on Linux Web; the desktop app uses the same front-end.

## Verify

```bash
node scripts/check-locales.mjs    # 127 languages, 0 errors
node src/build.mjs --check        # committed client.js matches src/
```

Community project, not affiliated with or endorsed by the United Nations.
