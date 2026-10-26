#!/usr/bin/env node
/**
 * Install the United Nations skin into one or more DSH profiles.
 *
 *   node scripts/install.mjs                  # desktop profile if present, else web
 *   node scripts/install.mjs --profile web
 *   node scripts/install.mjs --all
 *   node scripts/install.mjs --dry-run
 *   node scripts/install.mjs --dsh-home /path/to/.dsh
 *
 * The script copies this package into <profile>/node_modules/dsh-theme-un and
 * adds "dsh-theme-un" to dsh.profile.bundles. It never touches other bundles.
 * Requires Node 22+ (the same Node that runs DeepSeek Harness).
 */
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { fileURLToPath } from 'node:url'

const PACKAGE = 'dsh-theme-un'
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)

function arg(name, fallback) {
  const index = args.indexOf(name)
  if (index < 0) return fallback
  const value = args[index + 1]
  if (value === undefined || value.startsWith('--')) fail(`${name} needs a value`)
  return value
}
const dryRun = args.includes('--dry-run')
const all = args.includes('--all')
const dshHome = path.resolve(arg('--dsh-home', process.env.DSH_HOME || path.join(os.homedir(), '.dsh')))
const requested = arg('--profile', '')

function fail(message) {
  console.error('\n✗ ' + message + '\n')
  process.exit(1)
}
function ok(message) { console.log('  ✓ ' + message) }
function info(message) { console.log('  · ' + message) }

if (!fs.existsSync(path.join(root, 'client.js'))) fail('client.js is missing — run `node src/build.mjs` first')
if (!fs.existsSync(path.join(root, 'package.json'))) fail('package.json is missing')

const profilesDir = path.join(dshHome, 'profiles')
if (!fs.existsSync(profilesDir)) fail(`no DSH profiles found under ${profilesDir}\n  Start DeepSeek Harness once (dsh web) and run this again.`)

const available = fs.readdirSync(profilesDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((name) => fs.existsSync(path.join(profilesDir, name, 'package.json')))

if (available.length === 0) fail(`no profile with a package.json under ${profilesDir}`)

let targets
if (requested) {
  if (!available.includes(requested)) fail(`profile "${requested}" not found. Available: ${available.join(', ')}`)
  targets = [requested]
} else if (all) {
  targets = available
} else if (available.includes('desktop')) {
  targets = ['desktop']
} else if (available.includes('web')) {
  targets = ['web']
} else {
  targets = [available[0]]
  info(`no desktop/web profile; using "${available[0]}" (pass --profile to choose)`)
}

console.log(`\nUnited Nations skin → ${dshHome}`)
console.log(`profile(s): ${targets.join(', ')}${dryRun ? '  (dry run)' : ''}\n`)

function copyPackage(target) {
  fs.rmSync(target, { recursive: true, force: true })
  fs.mkdirSync(target, { recursive: true })
  const skip = new Set(['.git', 'node_modules', 'docs', '.github'])
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (skip.has(entry.name)) continue
    fs.cpSync(path.join(root, entry.name), path.join(target, entry.name), { recursive: true })
  }
}

function addBundle(profileDir) {
  const manifestPath = path.join(profileDir, 'package.json')
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  manifest.dsh = manifest.dsh || {}
  manifest.dsh.profile = manifest.dsh.profile || {}
  const bundles = Array.isArray(manifest.dsh.profile.bundles) ? manifest.dsh.profile.bundles : []
  if (!bundles.includes(PACKAGE)) bundles.push(PACKAGE)
  manifest.dsh.profile.bundles = bundles
  if (!dryRun) fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n')
  return bundles
}

for (const name of targets) {
  const profileDir = path.join(profilesDir, name)
  const target = path.join(profileDir, 'node_modules', PACKAGE)
  console.log(`[${name}]`)
  if (dryRun) {
    info(`would copy ${root}`)
    info(`  → ${target}`)
    const bundles = addBundle(profileDir)
    info(`would ensure dsh.profile.bundles includes "${PACKAGE}" (now: ${bundles.join(', ')})`)
    continue
  }
  copyPackage(target)
  ok(`installed to ${target}`)
  const bundles = addBundle(profileDir)
  ok(`dsh.profile.bundles: ${bundles.join(', ')}`)
  if (!fs.existsSync(path.join(profileDir, 'node_modules', PACKAGE, 'client.js'))) {
    fail(`copy failed for ${name}`)
  }
}

console.log(`
Next:
  1. Fully quit DeepSeek Harness (close the desktop app, or Ctrl+C the dsh web process).
  2. Start it again.
  3. Open Settings → the United Nations page, or click the globe beside Settings.

Profile files changed:
  ${targets.map((name) => path.join(profilesDir, name, 'package.json')).join('\n  ')}

Uninstall: node scripts/uninstall.mjs --profile ${targets[0]}
`)
