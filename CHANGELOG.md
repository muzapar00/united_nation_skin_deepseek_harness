# Changelog

All notable changes to the United Nations skin for DeepSeek Harness.

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
