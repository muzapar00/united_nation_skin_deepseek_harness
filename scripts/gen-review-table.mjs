#!/usr/bin/env node
/**
 * Regenerate the native-review table in docs/REVIEW.md from the packs.
 * Keeps the prose above the table and replaces everything from "## The board".
 */
import fs from 'node:fs'

const source = JSON.parse(fs.readFileSync('locales/_source.json', 'utf8')).strings
const coreSource = JSON.parse(fs.readFileSync('locales/dsh/_source.json', 'utf8')).namespaces
const catalog = JSON.parse(fs.readFileSync('src/data/languages.json', 'utf8'))
const meta = Object.fromEntries(catalog.featured.map((x) => [x.c, x]))
const tierA = new Set(['iu','chr','nv','luo','zgh','tpi','bi','ay','gn','qu','wo','ff','bm','ak','ee','om','kab','ki','tv','haw','fj','sm','to','dz','bo','mi','my','lo','km'])
const rows = []
const skinTotal = Object.keys(source).length
let coreTotal = 0
for (const ns of Object.values(coreSource)) coreTotal += Object.keys(ns).length
for (const file of fs.readdirSync('locales').filter((f) => f.endsWith('.json') && !f.startsWith('_'))) {
  const code = file.slice(0, -5)
  const pack = JSON.parse(fs.readFileSync('locales/' + file, 'utf8'))
  let done = 0
  for (const key of Object.keys(source)) if (pack.strings[key] !== undefined && pack.strings[key] !== source[key].en) done++
  let corePct = null
  const coreFile = 'locales/dsh/' + file
  if (fs.existsSync(coreFile)) {
    const core = JSON.parse(fs.readFileSync(coreFile, 'utf8'))
    let cdone = 0
    for (const [ns, keys] of Object.entries(coreSource)) for (const key of Object.keys(keys)) {
      if (core.namespaces?.[ns]?.[key] !== undefined && core.namespaces[ns][key] !== keys[key].en) cdone++
    }
    corePct = Math.round((cdone / coreTotal) * 100)
  }
  const m = meta[code] || { n: code, e: code }
  const priority = code === 'en' || code === 'zh' ? 'source' : tierA.has(code) ? 'A' : 'B'
  rows.push({ code, native: m.n, en: m.e, skin: Math.round((done / skinTotal) * 100), core: corePct, priority, status: pack.reviewStatus || 'unreviewed' })
}
rows.sort((a, b) => (a.priority === b.priority ? a.en.localeCompare(b.en) : a.priority.localeCompare(b.priority)))
const table = ['| Language | Code | Skin | DSH core | Review priority | Status |', '|---|---|---|---|---|---|']
for (const r of rows) table.push(`| ${r.native} (${r.en}) | \`${r.code}\` | ${r.skin}% | ${r.core === null ? 'built-in' : r.core + '%'} | ${r.priority} | ${r.status} |`)
const page = fs.readFileSync('docs/REVIEW.md', 'utf8')
const head = page.split('\n## The board')[0]
fs.writeFileSync('docs/REVIEW.md', head + '\n## The board\n\n' + table.join('\n') + '\n')
console.log('docs/REVIEW.md updated —', rows.length, 'languages,', rows.filter((r) => r.priority === 'A').length, 'priority A')
