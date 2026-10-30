# Changelog

All notable changes to the United Nations skin for DeepSeek Harness.

## 0.2.1 — 2026-10-27

### Fixed

- **Send button contrast.** The composer's send button used the `button-info-fill` token, which the
  skin had mapped to a 10 % blue tint — a white arrow on a nearly white pill, so an enabled button
  looked disabled. The token is now a solid UN blue (`#0077A8`, dark: `#1D9BCB`), clearly darker than
  the pale disabled state.
- **Send feedback.** A restrained spring: the button squashes to 88 % while pressed, springs back on
  release, and a single soft ring plus a short pop runs when a message is actually sent (mouse or
  Enter). The state is keyed on the composer's primary button by class, so it also works when the
  interface is in Chinese, Arabic or any other language.

## 0.2.0 — 2026-10-27

### Added

- **Members use their flags everywhere.** 194 vector flags (193 Member States + the UN flag) now
  render as crisp images in the Member State spotlight, the peacekeeping photo caption, the About
  mosaic and the hidden flag wall — instead of emoji that Windows cannot draw.
- **Flag wall.** A full-screen wall of all 193 Member State flags with their names, opened from the
  About panel, from the conversation hero emblem, or with the Konami code.
- **UN emblem egg.** Three clicks on the emblem in About open the flag wall; five still reveal
  UN80. The hero emblem also opens the wall.
- **Tagline in six languages.** Clicking “我联合国人民 · 1945” cycles the official Charter preamble
  opening in Chinese, English, French, Spanish, Russian and Arabic.
- **SDG strip.** The 17 official Sustainable Development Goal colours sit quietly under the About
  credits, each linking to un.org.
- **“peace”.** Typing the word outside an input box shows the UNESCO Constitution line about the
  defences of peace.

### Changed

- The flag wall background is nearly opaque, so the wall reads as a wall rather than a translucent
  layer.
- The settings language button now closes Settings before opening the picker, so the picker is never
  hidden behind the settings panel.

## 0.1.0 — 2026-10-27

First public release.

### Added

- United Nations theme for DeepSeek Harness Web and desktop profiles: white and
  UN blue palette, official emblem, 193 Member State flags, light "Daylight"
  and dark "Blue hour" schemes, reduced-motion support.
- Rotating peacekeeping photo background (six UN photographs, credited in the
  About panel), with interval and intensity controls.
- Two ambient ribbons above the composer: UN facts / Member State spotlight /
  the peacekeeping thank-you, and a rotating line from the Charter, the
  Universal Declaration, UNESCO and China's proposals to the United Nations.
- Language picker with a 7,030-language catalogue, search by native name,
  English name or ISO code, region filters, suggestions, recents and honest
  coverage badges; 127 languages carry a full skin translation and a DSH core
  vocabulary pack; English remains the fallback.
- United Nations settings page: language, appearance, background rotation,
  ribbons, motion, and an About panel with the Charter preamble, photo credits,
  the un.org link and the non-endorsement notice.
- Language packs: 127 languages under `locales/`, community-editable JSON.
- Build system with no external dependencies (`node src/build.mjs`), validator
  (`node scripts/check-locales.mjs`), installers for Linux/macOS and Windows,
  GitHub Actions validation.
- GitHub-ready documentation: Chinese and English READMEs, translation guide,
  NOTICE, license.

### Known limitations

- The host UI's right-to-left layout is not mirrored for Arabic, Hebrew, Persian,
  Urdu and other RTL languages yet; the skin's own surfaces are RTL-aware.
- Cover-image fonts are the operating system's; no font is bundled.
- Some language packs are AI-assisted and still need native review.
