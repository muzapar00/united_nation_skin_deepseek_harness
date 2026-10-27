# Native review status

Every translation in this repository is **AI-assisted**. Each pack is checked against the English
source for structure (keys, placeholders, non-empty values) and, where the language is a UN official
language, the quotations use the official UN texts. None of that replaces a native speaker.

This page is the honest status board. It is generated from the packs themselves: `reviewStatus` in
`locales/<code>.json` and `locales/dsh/<code>.json` is `source`, `unreviewed` or `reviewed`.

## How to claim a language

1. Open an issue with the **Translation review** template and name the language code.
2. Read `locales/_TRANSLATING.md`, then fix only that language.
3. Set `"reviewStatus": "reviewed"` and add `"reviewedBy": "your name (native speaker)"` in the pack.
4. Run `node scripts/check-locales.mjs <code>` and `node src/build.mjs --check`.
5. Send the PR. A review of one tier-A language is worth more than ten cosmetic PRs.

Priority **A** means the language is small or under-resourced and the AI pass had the least
grounding (the subagent reports flagged specific coinages). Priority **B** packs are complete but
still want a native glance, especially at UN terminology and the "We the Peoples" preamble rendering.
`source` packs (English, 中文) are authored for this project.

## What to check

- **Meaning**, not word-for-word: short UI register, imperative for actions.
- **Placeholders** stay byte-for-byte: `{count}`, `{value}`.
- **UN names**: `United Nations` should be the form used by that language's press/UN documents; the
  six official languages are fixed (联合国 / United Nations / Nations Unies / Naciones Unidas /
  Организация Объединенных Наций / الأمم المتحدة).
- **“We the Peoples”** (`tagline`): use the official Charter-preamble opening if one exists in the
  language; otherwise a faithful short rendering.
- **Charter and UDHR quotations** in `src/data/quotes.json`: in es/fr/ru/ar the official UN wording is
  used; other languages are translated.
- **RTL shaping**: Arabic, Persian, Urdu, Pashto, Sindhi, Uyghur, Hebrew and Central Kurdish must be
  real right-to-left text in the correct script.
- **Regional variety**: `pt` is deliberately neutral between Portugal and Brazil; a future `pt-BR` /
  `pt-PT` split is welcome.

## The board

| Language | Code | Skin | DSH core | Review priority | Status |
|---|---|---|---|---|---|
| Akan (Akan) | `ak` | 97% | 96% | A | unreviewed |
| Aymar aru (Aymara) | `ay` | 100% | 96% | A | unreviewed |
| Bamanankan (Bambara) | `bm` | 100% | 96% | A | unreviewed |
| Bislama (Bislama) | `bi` | 100% | 96% | A | unreviewed |
| မြန်မာ (Burmese) | `my` | 100% | 96% | A | unreviewed |
| ᏣᎳᎩ (Cherokee) | `chr` | 100% | 96% | A | unreviewed |
| རྫོང་ཁ (Dzongkha) | `dz` | 100% | 96% | A | unreviewed |
| Eʋegbe (Ewe) | `ee` | 98% | 96% | A | unreviewed |
| Na Vosa Vakaviti (Fijian) | `fj` | 100% | 96% | A | unreviewed |
| Fulfulde (Fula) | `ff` | 100% | 96% | A | unreviewed |
| Avañe'ẽ (Guarani) | `gn` | 100% | 96% | A | unreviewed |
| ʻŌlelo Hawaiʻi (Hawaiian) | `haw` | 100% | 96% | A | unreviewed |
| ᐃᓄᒃᑎᑐᑦ (Inuktitut) | `iu` | 100% | 96% | A | unreviewed |
| Taqbaylit (Kabyle) | `kab` | 100% | 96% | A | unreviewed |
| ខ្មែរ (Khmer) | `km` | 100% | 96% | A | unreviewed |
| Gĩkũyũ (Kikuyu) | `ki` | 97% | 96% | A | unreviewed |
| ລາວ (Lao) | `lo` | 100% | 96% | A | unreviewed |
| Dholuo (Luo) | `luo` | 97% | 96% | A | unreviewed |
| Te Reo Māori (Māori) | `mi` | 100% | 96% | A | unreviewed |
| Diné bizaad (Navajo) | `nv` | 100% | 96% | A | unreviewed |
| Afaan Oromoo (Oromo) | `om` | 100% | 96% | A | unreviewed |
| Runa Simi (Quechua) | `qu` | 100% | 96% | A | unreviewed |
| Gagana faʻa Sāmoa (Samoan) | `sm` | 98% | 96% | A | unreviewed |
| ⵜⴰⵎⴰⵣⵉⵖⵜ (Standard Moroccan Tamazight) | `zgh` | 100% | 96% | A | unreviewed |
| བོད་ཡིག (Tibetan) | `bo` | 100% | 96% | A | unreviewed |
| Tok Pisin (Tok Pisin) | `tpi` | 100% | 96% | A | unreviewed |
| Lea faka-Tonga (Tongan) | `to` | 100% | 96% | A | unreviewed |
| Te Ggana Tuvalu (Tuvaluan) | `tv` | 98% | 96% | A | unreviewed |
| Wolof (Wolof) | `wo` | 100% | 96% | A | unreviewed |
| Afrikaans (Afrikaans) | `af` | 98% | 90% | B | unreviewed |
| Shqip (Albanian) | `sq` | 98% | 98% | B | unreviewed |
| አማርኛ (Amharic) | `am` | 100% | 96% | B | unreviewed |
| العربية (Arabic) | `ar` | 100% | 96% | B | unreviewed |
| Հայերեն (Armenian) | `hy` | 100% | 100% | B | unreviewed |
| অসমীয়া (Assamese) | `as` | 100% | 96% | B | unreviewed |
| Azərbaycanca (Azerbaijani) | `az` | 100% | 96% | B | unreviewed |
| Euskara (Basque) | `eu` | 98% | 96% | B | unreviewed |
| Беларуская (Belarusian) | `be` | 100% | 100% | B | unreviewed |
| বাংলা (Bengali) | `bn` | 100% | 100% | B | unreviewed |
| Bosanski (Bosnian) | `bs` | 98% | 96% | B | unreviewed |
| Български (Bulgarian) | `bg` | 100% | 98% | B | unreviewed |
| Català (Catalan) | `ca` | 97% | 92% | B | unreviewed |
| Cebuano (Cebuano) | `ceb` | 100% | 94% | B | unreviewed |
| کوردی (Central Kurdish) | `ckb` | 100% | 96% | B | unreviewed |
| Hrvatski (Croatian) | `hr` | 98% | 96% | B | unreviewed |
| Čeština (Czech) | `cs` | 98% | 94% | B | unreviewed |
| Dansk (Danish) | `da` | 98% | 92% | B | unreviewed |
| Nederlands (Dutch) | `nl` | 98% | 90% | B | unreviewed |
| Esperanto (Esperanto) | `eo` | 100% | 96% | B | unreviewed |
| Eesti (Estonian) | `et` | 100% | 100% | B | unreviewed |
| Føroyskt (Faroese) | `fo` | 98% | 94% | B | unreviewed |
| Filipino (Filipino) | `tl` | 100% | 92% | B | unreviewed |
| Suomi (Finnish) | `fi` | 100% | 98% | B | unreviewed |
| Français (French) | `fr` | 97% | 88% | B | unreviewed |
| Galego (Galician) | `gl` | 98% | 94% | B | unreviewed |
| ქართული (Georgian) | `ka` | 100% | 100% | B | unreviewed |
| Deutsch (German) | `de` | 98% | 90% | B | unreviewed |
| Ελληνικά (Greek) | `el` | 100% | 98% | B | unreviewed |
| ગુજરાતી (Gujarati) | `gu` | 100% | 100% | B | unreviewed |
| Kreyòl ayisyen (Haitian Creole) | `ht` | 100% | 94% | B | unreviewed |
| Hausa (Hausa) | `ha` | 100% | 96% | B | unreviewed |
| עברית (Hebrew) | `he` | 100% | 96% | B | unreviewed |
| हिन्दी (Hindi) | `hi` | 100% | 96% | B | unreviewed |
| Magyar (Hungarian) | `hu` | 100% | 98% | B | unreviewed |
| Íslenska (Icelandic) | `is` | 100% | 100% | B | unreviewed |
| Igbo (Igbo) | `ig` | 100% | 96% | B | unreviewed |
| Ilokano (Ilocano) | `ilo` | 98% | 94% | B | unreviewed |
| Bahasa Indonesia (Indonesian) | `id` | 97% | 90% | B | unreviewed |
| Gaeilge (Irish) | `ga` | 100% | 96% | B | unreviewed |
| Italiano (Italian) | `it` | 95% | 92% | B | unreviewed |
| 日本語 (Japanese) | `ja` | 100% | 94% | B | unreviewed |
| Basa Jawa (Javanese) | `jv` | 98% | 94% | B | unreviewed |
| ಕನ್ನಡ (Kannada) | `kn` | 100% | 100% | B | unreviewed |
| Қазақша (Kazakh) | `kk` | 100% | 100% | B | unreviewed |
| 한국어 (Korean) | `ko` | 100% | 96% | B | unreviewed |
| Kurdî (Kurdish) | `ku` | 100% | 92% | B | unreviewed |
| Кыргызча (Kyrgyz) | `ky` | 100% | 100% | B | unreviewed |
| Latviešu (Latvian) | `lv` | 100% | 100% | B | unreviewed |
| Lietuvių (Lithuanian) | `lt` | 100% | 100% | B | unreviewed |
| Lëtzebuergesch (Luxembourgish) | `lb` | 100% | 94% | B | unreviewed |
| Македонски (Macedonian) | `mk` | 100% | 100% | B | unreviewed |
| Malagasy (Malagasy) | `mg` | 100% | 96% | B | unreviewed |
| Bahasa Melayu (Malay) | `ms` | 98% | 92% | B | unreviewed |
| മലയാളം (Malayalam) | `ml` | 100% | 100% | B | unreviewed |
| Malti (Maltese) | `mt` | 100% | 94% | B | unreviewed |
| मराठी (Marathi) | `mr` | 100% | 100% | B | unreviewed |
| Монгол (Mongolian) | `mn` | 100% | 96% | B | unreviewed |
| नेपाली (Nepali) | `ne` | 100% | 100% | B | unreviewed |
| Norsk bokmål (Norwegian Bokmål) | `nb` | 98% | 90% | B | unreviewed |
| ଓଡ଼ିଆ (Odia) | `or` | 100% | 96% | B | unreviewed |
| پښتو (Pashto) | `ps` | 100% | 96% | B | unreviewed |
| فارسی (Persian) | `fa` | 100% | 96% | B | unreviewed |
| Polski (Polish) | `pl` | 98% | 94% | B | unreviewed |
| Português (Portuguese) | `pt` | 98% | 92% | B | unreviewed |
| ਪੰਜਾਬੀ (Punjabi) | `pa` | 100% | 100% | B | unreviewed |
| Română (Romanian) | `ro` | 93% | 92% | B | unreviewed |
| Русский (Russian) | `ru` | 100% | 96% | B | unreviewed |
| Српски (Serbian) | `sr` | 100% | 100% | B | unreviewed |
| سنڌي (Sindhi) | `sd` | 100% | 96% | B | unreviewed |
| සිංහල (Sinhala) | `si` | 100% | 100% | B | unreviewed |
| Slovenčina (Slovak) | `sk` | 98% | 94% | B | unreviewed |
| Slovenščina (Slovenian) | `sl` | 98% | 98% | B | unreviewed |
| Soomaali (Somali) | `so` | 100% | 96% | B | unreviewed |
| Español (Spanish) | `es` | 98% | 92% | B | unreviewed |
| Basa Sunda (Sundanese) | `su` | 98% | 94% | B | unreviewed |
| Kiswahili (Swahili) | `sw` | 97% | 96% | B | unreviewed |
| Svenska (Swedish) | `sv` | 98% | 92% | B | unreviewed |
| Тоҷикӣ (Tajik) | `tg` | 100% | 100% | B | unreviewed |
| தமிழ் (Tamil) | `ta` | 100% | 100% | B | unreviewed |
| Татарча (Tatar) | `tt` | 100% | 96% | B | unreviewed |
| తెలుగు (Telugu) | `te` | 100% | 100% | B | unreviewed |
| ไทย (Thai) | `th` | 100% | 96% | B | unreviewed |
| ትግርኛ (Tigrinya) | `ti` | 100% | 96% | B | unreviewed |
| toki pona (Toki Pona) | `tok` | 100% | 96% | B | unreviewed |
| Türkçe (Turkish) | `tr` | 100% | 96% | B | unreviewed |
| Türkmençe (Turkmen) | `tk` | 100% | 98% | B | unreviewed |
| Українська (Ukrainian) | `uk` | 100% | 100% | B | unreviewed |
| اردو (Urdu) | `ur` | 100% | 96% | B | unreviewed |
| ئۇيغۇرچە (Uyghur) | `ug` | 100% | 96% | B | unreviewed |
| Oʻzbekcha (Uzbek) | `uz` | 98% | 98% | B | unreviewed |
| Tiếng Việt (Vietnamese) | `vi` | 100% | 96% | B | unreviewed |
| Cymraeg (Welsh) | `cy` | 97% | 94% | B | unreviewed |
| isiXhosa (Xhosa) | `xh` | 100% | 96% | B | unreviewed |
| Yorùbá (Yoruba) | `yo` | 100% | 96% | B | unreviewed |
| isiZulu (Zulu) | `zu` | 100% | 96% | B | unreviewed |
| 中文 (Chinese) | `zh` | 100% | built-in | source | source |
| English (English) | `en` | 0% | built-in | source | source |
