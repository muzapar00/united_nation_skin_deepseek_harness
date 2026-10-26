#!/usr/bin/env node
/** Remove the United Nations skin from one or all DSH profiles. */
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'

const PACKAGE = 'dsh-theme-un'
const args = process.argv.slice(2)
const get = (name, fallback) => {
  const i = args.indexOf(name)
  return i < 0 ? fallback : args[i + 1]
}
const dshHome = path.resolve(get('--dsh-home', process.env.DSH_HOME || path.join(os.homedir(), '.dsh')))
const requested = get('--profile', '')
const all = args.includes('--all')
const profilesDir = path.join(dshHome, 'profiles')
if (!fs.existsSync(profilesDir)) { console.error(`no profiles under ${profilesDir}`); process.exit(1) }
const available = fs.readdirSync(profilesDir).filter((name) => fs.existsSync(path.join(profilesDir, name, 'package.json')))
const targets = all ? available : [requested || (available.includes('desktop') ? 'desktop' : available.includes('web') ? 'web' : available[0])]
for (const name of targets) {
  if (!available.includes(name)) { console.error(`profile "${name}" not found`); continue }
  const profileDir = path.join(profilesDir, name)
  fs.rmSync(path.join(profileDir, 'node_modules', PACKAGE), { recursive: true, force: true })
  const manifestPath = path.join(profileDir, 'package.json')
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  const bundles = manifest?.dsh?.profile?.bundles
  if (Array.isArray(bundles)) {
    manifest.dsh.profile.bundles = bundles.filter((entry) => entry !== PACKAGE)
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n')
  }
  const patchPath = path.join(profileDir, 'cordis.patch.yml')
  if (fs.existsSync(patchPath) && fs.readFileSync(patchPath, 'utf8').includes(PACKAGE)) {
    console.warn(`  ! ${patchPath} mentions ${PACKAGE}: remove that loader row manually if you added one`)
  }
  console.log(`[${name}] removed ${PACKAGE}`)
}
console.log('\nRestart DeepSeek Harness to finish uninstalling.')
