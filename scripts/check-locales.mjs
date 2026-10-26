#!/usr/bin/env node
/**
 * Validate language packs against the source catalog.
 *
 *   node scripts/check-locales.mjs            # every file under locales/
 *   node scripts/check-locales.mjs de fr ar   # only these codes
 *   node scripts/check-locales.mjs --strict   # treat English-identical values as errors
 *
 * Checks: JSON shape, code/filename agreement, unknown or missing keys,
 * empty values, and {placeholder} preservation. Prints one line per language.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const source = JSON.parse(fs.readFileSync(path.join(root, 'locales/_source.json'), 'utf8')).strings
const coreSource = JSON.parse(fs.readFileSync(path.join(root, 'locales/dsh/_source.json'), 'utf8')).namespaces
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'src/data/languages.json'), 'utf8'))
const fullTier = new Set(catalog.featured.filter(x => x.tier === 'full').map(x => x.c))
const metaOf = Object.fromEntries(catalog.featured.map(x => [x.c, x]))

const args = process.argv.slice(2)
const strict = args.includes('--strict')
const only = args.filter(a => !a.startsWith('--'))
const codes = only.length
  ? only
  : fs.readdirSync(path.join(root, 'locales')).filter(f => f.endsWith('.json') && !f.startsWith('_')).map(f => f.slice(0, -5))

const placeholders = (s) => [...String(s).matchAll(/\{([a-zA-Z0-9_.]+)\}/g)].map(m => m[1]).sort()
let errors = 0
let warnings = 0
const rows = []

function fail(msg) { errors++; console.error('  ✗ ' + msg) }
function warn(msg) { warnings++; console.warn('  ! ' + msg) }

for (const code of codes.sort()) {
  const file = path.join(root, 'locales', code + '.json')
  if (!fs.existsSync(file)) { fail(`${code}: locales/${code}.json missing`); continue }
  let pack
  try { pack = JSON.parse(fs.readFileSync(file, 'utf8')) } catch (e) { fail(`${code}: invalid JSON — ${e.message}`); continue }
  if (pack.code !== code) fail(`${code}: "code" is ${JSON.stringify(pack.code)}`)
  if (!pack.strings || typeof pack.strings !== 'object') { fail(`${code}: "strings" object missing`); continue }
  const expected = metaOf[code]
  if (expected && pack.native !== expected.n) warn(`${code}: native "${pack.native}" differs from catalog "${expected.n}" (ok if intentional)`)
  let translated = 0
  for (const [key, value] of Object.entries(pack.strings)) {
    if (!(key in source)) { fail(`${code}: unknown key "${key}"`); continue }
    if (typeof value !== 'string' || value.trim() === '') { fail(`${code}: empty value for "${key}"`); continue }
    const want = placeholders(source[key].en)
    const got = placeholders(value)
    if (want.join(',') !== got.join(',')) fail(`${code}.${key}: placeholders {${want.join('} {')}} expected, got {${got.join('} {')}}`)
    if (value !== source[key].en) translated++
    else if (strict && key !== 'tagline') fail(`${code}.${key}: identical to English under --strict`)
  }
  for (const key of Object.keys(source)) if (!(key in pack.strings)) warn(`${code}: missing skin key "${key}"`)
  const dshFile = path.join(root, 'locales/dsh', code + '.json')
  let coreTranslated = 0
  let coreExpected = 0
  for (const [ns, keys] of Object.entries(coreSource)) coreExpected += Object.keys(keys).length
  if (fs.existsSync(dshFile)) {
    let corePack
    try { corePack = JSON.parse(fs.readFileSync(dshFile, 'utf8')) } catch (e) { fail(`${code}: invalid JSON in locales/dsh/${code}.json — ${e.message}`); continue }
    if (corePack.code !== code) fail(`${code}: dsh pack "code" is ${JSON.stringify(corePack.code)}`)
    for (const [ns, dict] of Object.entries(corePack.namespaces || {})) {
      if (!(ns in coreSource)) { fail(`${code}: unknown DSH namespace "${ns}"`); continue }
      for (const [key, value] of Object.entries(dict)) {
        if (!(key in coreSource[ns])) { fail(`${code}: unknown DSH key "${ns}.${key}"`); continue }
        if (typeof value !== 'string' || value.trim() === '') { fail(`${code}: empty DSH value "${ns}.${key}"`); continue }
        const want = placeholders(coreSource[ns][key].en)
        const got = placeholders(value)
        if (want.join(',') !== got.join(',')) fail(`${code}: placeholders mismatch in "${ns}.${key}"`)
        if (value !== coreSource[ns][key].en) coreTranslated++
      }
    }
    for (const [ns, keys] of Object.entries(coreSource)) for (const key of Object.keys(keys)) {
      if (!corePack.namespaces?.[ns]?.[key]) warn(`${code}: missing DSH key "${ns}.${key}"`)
    }
  } else if (fullTier.has(code)) {
    warn(`${code}: no locales/dsh/${code}.json (core UI stays English)`)
  }
  const pct = Math.round((translated / Object.keys(source).length) * 100)
  const corePct = coreExpected ? Math.round((coreTranslated / coreExpected) * 100) : 0
  rows.push({ code, skin: pct, core: corePct })
}

const byCode = Object.fromEntries(rows.map(r => [r.code, r]))
const full = catalog.featured.filter(x => x.tier === 'full')
const skinDone = full.filter(x => byCode[x.c] && byCode[x.c].skin >= 95).length
const coreDone = full.filter(x => byCode[x.c] && byCode[x.c].core >= 95).length
console.log(`\nchecked ${rows.length} language(s) — errors ${errors}, warnings ${warnings}`)
console.log(`featured full-tier: ${full.length}; skin ≥95%: ${skinDone}; core DSH ≥95%: ${coreDone}`)
if (errors) process.exit(1)
