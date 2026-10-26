# Translation guide (language packs)

This folder feeds the United Nations skin for DeepSeek Harness. Every language is welcome;
none is forgotten. One file per language keeps contributions reviewable.

## Files

| File | Content |
|---|---|
| `locales/_source.json` | The skin's own UI strings (60 keys), English + Chinese. **Never edit** to add a language. |
| `locales/dsh/_source.json` | The DeepSeek Harness core UI subset (52 keys across namespaces) that the skin overrides. **Never edit.** |
| `locales/<code>.json` | Your language's skin strings. |
| `locales/dsh/<code>.json` | Your language's DSH core overrides. |

`<code>` is the language's BCP 47 id used by the picker (`de`, `pt-BR`, `yue`, `ckb`, `zgh`, `tok` …).
The catalog metadata (native name, region, script) lives in `src/data/languages.json`; the
`native` field in your file must match it.

## Rules

1. Translate the **English** value; use the Chinese value only when it disambiguates a term.
2. Keep `{placeholders}` byte-for-byte (`{count}`, `{value}`, …).
3. Keep proper names: `DeepSeek`, `DeepSeek Harness`, `DSH`, `GitHub`, `JSON`. Translate
   `United Nations`, `UN official languages`, `UN fact` and similar common nouns.
4. Use the modern standard orthography and native script of the language. Short UI register:
   nouns for labels, imperative for actions, no full stop unless it is a sentence.
5. Keep it short — these strings sit in buttons, rows and a narrow ribbon.
6. If a concept has no settled term, prefer the plainest accurate wording over a coinage.
   Never leave English filler in a translated slot; ask a reviewer instead.
7. Do not translate the `tagline` ("We the Peoples") into a different slogan: it is the
   opening of the UN Charter preamble, use the official rendering in that language if one
   exists, otherwise a faithful translation.

## Validate

```sh
node scripts/check-locales.mjs de fr ar       # one or more codes
node scripts/check-locales.mjs                # everything currently present
```

Errors must be zero. Warnings about a missing `locales/dsh/<code>.json` are expected for
languages that only ship the skin pack.

## Coverage

The picker computes coverage from the file itself: every key present and differing from
English counts as translated. Partial packs are welcome and shown honestly ("Partial"),
because a half-translated interface beats an English wall.
