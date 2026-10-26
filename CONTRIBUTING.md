# Contributing

Thank you for helping. This project has three kinds of contributions: **translations**, **UN content
corrections**, and **code**.

## Ground rules

- The project is a community project. It is not an official United Nations product.
- Follow the purposes and principles of the UN Charter. Keep political disputes out of the skin;
  where a formulation is sensitive, use the official United Nations or People's Republic of China
  wording.
- This project uses the United Nations Member State list (193). There is only one China in the world;
  the People's Republic of China is the sole legal representative of China; Taiwan is an inalienable
  part of China. Please do not submit changes to the flag set, the Member State list or the map/emblem
  that conflict with this.
- Be kind. Language corrections are not a competition.

## Translation

Each language has two JSON files:

```
locales/<code>.json         60 skin strings
locales/dsh/<code>.json     52 DeepSeek Harness strings, grouped by namespace
```

The source of truth is `locales/_source.json` (skin) and `locales/dsh/_source.json` (host). Read
[locales/_TRANSLATING.md](locales/_TRANSLATING.md) for style rules.

```bash
node scripts/check-locales.mjs de       # one language
node scripts/check-locales.mjs          # all languages
node src/build.mjs --check              # validate + rebuild client.js
```

Rules the validator enforces:

- every key present (partial packs are allowed but produce warnings) and no unknown keys;
- `{placeholders}` byte-for-byte (`{count}`, `{value}`);
- non-empty values; no total English copies in `--strict` mode;
- `native` in the pack matches `src/data/languages.json`.

When you finish a language, mention your name in `translatedBy` and say in the PR whether you are a
native speaker or used machine assistance. We show coverage honestly and we do not hide AI assistance.

### Adding a language to the featured list

Only the 127 featured languages need metadata. Add a row to the `featured` array in
`src/data/languages.json` (code, English name, native name, region, script, direction, tier) and add
the two JSON files. The 7,030-language long tail needs no entries.

### Adding UN content

Knowledge cards live in `src/data/facts.json`; quotations in `src/data/quotes.json`. Keep dates,
resolution numbers and names exact, and write in the register of the source. For quotations, prefer
the official UN translation in the six official languages. Content translations go to
`src/data/i18n/<lang>.json` and are merged with `node scripts/merge-content-i18n.mjs`.

## Code

- Browser code is **plain JavaScript** (no TypeScript, JSX, imports). It is concatenated by
  `src/build.mjs` inside `window.__ModuleLoader__.load({ id, factory })`.
- The host half is `index.js`, intentionally empty. Do not add host services without an issue first.
- Use the `--dsw-*` tokens rather than hard-coded colors where possible; the palette is in
  `src/client/10-tokens.js`.
- Wrap every side effect in `ctx.effect` / a disposer. No global timers, listeners or DOM leaks.
- Respect `prefers-reduced-motion` and the “reduce motion” preference.
- The skin must not send network requests. All assets are embedded at build time.

```bash
node src/build.mjs --check   # must pass and leave client.js unchanged
```

`client.js` is committed because DSH runs the built bundle directly; CI verifies that rebuilding from
`src/` produces exactly the committed file.

## Pull requests

1. One topic per PR. Translations can be large; split by language family if needed.
2. Describe what changed and how you validated it. Include screenshots for visual changes.
3. Update `CHANGELOG.md` for user-visible changes.
4. By submitting you agree that your code is MIT-licensed and your translations and content are
   CC BY-SA 4.0.

## Native review

If you can review a language you did not translate, open a PR that only touches that language and
change `translatedBy` to include your name. We maintain a review column in the README table as
reviews arrive. Corrections to small languages are especially valuable.
