#!/usr/bin/env node
/**
 * Merge src/data/i18n/<lang>.json content translations into facts.json and
 * quotes.json. Idempotent: every run replaces the target language's entries
 * with the partial file, leaving other languages untouched.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const factsPath = path.join(root, 'src/data/facts.json')
const quotesPath = path.join(root, 'src/data/quotes.json')
const facts = JSON.parse(fs.readFileSync(factsPath, 'utf8'))
const quotes = JSON.parse(fs.readFileSync(quotesPath, 'utf8'))
const factIds = new Set(facts.map((fact) => fact.id))
const quoteIds = new Set(quotes.map((quote) => quote.id))
const dir = path.join(root, 'src/data/i18n')
let errors = 0
for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort()) {
  const lang = file.slice(0, -5)
  const pack = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'))
  if (pack.language !== lang) { console.error(`✗ ${file}: "language" must be ${lang}`); errors++; continue }
  for (const [id, text] of Object.entries(pack.facts || {})) {
    if (!factIds.has(id)) { console.error(`✗ ${lang}: unknown fact id ${id}`); errors++; continue }
    if (typeof text !== 'string' || !text.trim()) { console.error(`✗ ${lang}: empty fact ${id}`); errors++; continue }
    facts.find((fact) => fact.id === id).i18n[lang] = text
  }
  for (const [id, value] of Object.entries(pack.quotes || {})) {
    if (!quoteIds.has(id)) { console.error(`✗ ${lang}: unknown quote id ${id}`); errors++; continue }
    if (!value || typeof value.text !== 'string' || !value.text.trim()) { console.error(`✗ ${lang}: empty quote ${id}`); errors++; continue }
    const quote = quotes.find((entry) => entry.id === id)
    quote.text[lang] = value.text
    if (value.src) quote.src[lang] = value.src
  }
  console.log(`merged ${lang}: ${Object.keys(pack.facts || {}).length} facts, ${Object.keys(pack.quotes || {}).length} quotes`)
}
if (errors) { console.error(`\n${errors} error(s); nothing written`); process.exit(1) }
fs.writeFileSync(factsPath, JSON.stringify(facts, null, 2) + '\n')
fs.writeFileSync(quotesPath, JSON.stringify(quotes, null, 2) + '\n')
console.log('content translations merged')
