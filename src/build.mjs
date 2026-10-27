#!/usr/bin/env node
/**
 * Build client.js from src/client/*.js plus the language packs, data files and
 * image assets. No bundler, no dependencies: the client half is plain
 * JavaScript loaded by the harness browser kernel.
 *
 *   node src/build.mjs            # build
 *   node src/build.mjs --check    # build and fail on language-pack errors
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8')
const readJson = (p) => JSON.parse(read(p))
const pkg = readJson('package.json')
const source = readJson('locales/_source.json')
const coreSource = readJson('locales/dsh/_source.json')

if (process.argv.includes('--check')) {
  execFileSync(process.execPath, [path.join(root, 'scripts/check-locales.mjs')], { stdio: 'inherit' })
}

/* ---------- language packs ---------- */
const locales = {}
const localeDir = path.join(root, 'locales')
for (const file of fs.readdirSync(localeDir).sort()) {
  if (!file.endsWith('.json') || file.startsWith('_')) continue
  const code = file.slice(0, -5)
  const pack = readJson('locales/' + file)
  const strings = {}
  for (const key of Object.keys(source.strings)) {
    if (pack.strings && typeof pack.strings[key] === 'string') strings[key] = pack.strings[key]
  }
  locales[code] = { native: pack.native || code, english: pack.english || code, strings }
}

const core = {}
const coreDir = path.join(root, 'locales/dsh')
for (const file of fs.readdirSync(coreDir).sort()) {
  if (!file.endsWith('.json') || file.startsWith('_')) continue
  const code = file.slice(0, -5)
  const pack = readJson('locales/dsh/' + file)
  const namespaces = {}
  for (const [ns, dict] of Object.entries(pack.namespaces || {})) {
    if (coreSource.namespaces[ns] === undefined) continue
    const kept = {}
    for (const [key, value] of Object.entries(dict)) {
      if (coreSource.namespaces[ns][key] !== undefined && typeof value === 'string') kept[key] = value
    }
    if (Object.keys(kept).length > 0) namespaces[ns] = kept
  }
  core[code] = namespaces
}

/* ---------- data ---------- */
const flags = {}
for (const file of fs.readdirSync(path.join(root, 'assets/flags-thumb')).sort()) {
  if (!file.endsWith('.webp')) continue
  flags[file.slice(0, -5)] = 'data:image/webp;base64,' + fs.readFileSync(path.join(root, 'assets/flags-thumb', file)).toString('base64')
}
const languages = readJson('src/data/languages.json')
const members = readJson('src/data/members.json')
const facts = readJson('src/data/facts.json')
const quotes = readJson('src/data/quotes.json')
const credits = readJson('src/data/credits.json')
const taglines = readJson('src/data/taglines.json')
const sdgs = readJson('src/data/sdgs.json')

const featureByCode = {}
for (const item of languages.featured) featureByCode[item.c] = item

const svgUri = (file) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(read(file))
const emblem = {
  mono: svgUri('assets/emblem-mono.svg'),
  badge: svgUri('assets/emblem-badge.svg')
}

const PHOTO_COUNTRY = {
  benin: { cc: 'bj', en: 'Benin', zh: '贝宁' },
  mali: { cc: 'bd', en: 'Bangladesh', zh: '孟加拉国' },
  nile: { cc: 'un', en: 'UNMISS · South Sudan', zh: '南苏丹 · 联合国南苏丹特派团' },
  shamrock: { cc: 'ie', en: 'Ireland', zh: '爱尔兰' },
  juba: { cc: 'ss', en: 'South Sudan', zh: '南苏丹' },
  outpost: { cc: 'id', en: 'Indonesia', zh: '印度尼西亚' }
}

const images = credits.map((credit) => {
  const country = PHOTO_COUNTRY[credit.file] || { cc: 'un', en: 'United Nations', zh: '联合国' }
  const data = 'data:image/webp;base64,' + fs.readFileSync(path.join(root, 'assets/bg', credit.file + '.webp')).toString('base64')
  return {
    id: credit.file,
    data,
    country,
    flagThumb: flags[country.cc] || null,
    credit: { title: credit.title, author: credit.author, license: credit.license, source: credit.source }
  }
})

const DATA = {
  version: pkg.version,
  source: Object.fromEntries(Object.entries(source.strings).map(([key, value]) => [key, value.en])),
  locales,
  core,
  languages,
  featureByCode,
  members,
  facts,
  quotes,
  credits,
  emblem,
  flags,
  taglines,
  sdgs
}

/* ---------- assemble ---------- */
const partDir = path.join(root, 'src/client')
const parts = fs.readdirSync(partDir).filter((f) => f.endsWith('.js')).sort()
const body = parts.map((file) => '\n/* ---- ' + file + ' ---- */\n' + fs.readFileSync(path.join(partDir, file), 'utf8')).join('\n')

const out = [
  '/**',
  ' * ' + pkg.name + ' v' + pkg.version + ' — United Nations skin for DeepSeek Harness.',
  ' * GENERATED FILE. Edit src/client/*.js and locales/*.json, then run `node src/build.mjs`.',
  ' * Do not edit by hand: the next build overwrites it.',
  ' */',
  'window.__ModuleLoader__.load({',
  '  id: ' + JSON.stringify(pkg.name) + ',',
  '  factory: (require) => {',
  '    var module = { exports: {} };',
  '    var exports = module.exports;',
  '    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });',
  '    var UN_DATA = ' + JSON.stringify(DATA) + ';',
  '    var UN_IMAGES = ' + JSON.stringify(images) + ';',
  body,
  '    exports.inject = ["slots", "locale", "theme"];',
  '    exports.apply = apply;',
  '    return module.exports;',
  '  }',
  '});',
  ''
].join('\n')

try {
  // Compile-only check: catches a broken string or bracket before it ships.
  // eslint-disable-next-line no-new-func
  new Function(out)
} catch (error) {
  console.error('✗ generated client.js has a syntax error: ' + error.message)
  process.exit(1)
}

fs.writeFileSync(path.join(root, 'client.js'), out)
const size = (p) => (fs.statSync(path.join(root, p)).size / 1024).toFixed(1) + ' KB'
console.log('built client.js')
console.log('  size        ', size('client.js'))
console.log('  languages   ', Object.keys(locales).length, 'skin packs,', Object.keys(core).length, 'core packs')
console.log('  catalog     ', languages.catalog.length, 'languages,', languages.featured.length, 'featured')
console.log('  images      ', images.length, 'backgrounds,', Object.keys(flags).length, 'flag thumbnails')
