/* ==========================================================================
 * 00 · boot — constants, preference store, locale plumbing, tiny helpers
 * ========================================================================== */

var React = require('react')
var h = React.createElement
var useState = React.useState
var useEffect = React.useEffect
var useMemo = React.useMemo
var useRef = React.useRef
var useCallback = React.useCallback
var useSyncExternalStore = React.useSyncExternalStore

var PLUGIN_ID = 'dsh-theme-un'
var NS = 'un'
var BODY_ATTR = 'data-dsh-un'
var STYLE_ID = 'dsh-theme-un-style'
var PREF_KEY = 'dsh.un.v1'
var SOURCE_KEYS = Object.keys(UN_DATA.source)
var SOURCE_COUNT = SOURCE_KEYS.length
var FALLBACK = 'en'

/* ---------- local preferences (per browser; the language itself is stored
 * by the locale plugin's host settings, this is only presentation state) ---- */

function readJSON(key) {
  try {
    var raw = window.localStorage.getItem(key)
    if (raw === null) return null
    var parsed = JSON.parse(raw)
    return parsed !== null && typeof parsed === 'object' ? parsed : null
  } catch (error) {
    return null
  }
}

function writeJSON(key, value) {
  try { window.localStorage.setItem(key, JSON.stringify(value)) } catch (error) { /* private mode */ }
}

var PREF_DEFAULTS = {
  background: true,
  interval: 24,
  intensity: 78,
  facts: true,
  quotes: true,
  reduceMotion: false,
  recent: [],
  lang: ''
}

function normalizePrefs(raw) {
  var source = raw !== null && typeof raw === 'object' ? raw : {}
  var out = {}
  for (var key in PREF_DEFAULTS) out[key] = PREF_DEFAULTS[key]
  for (var key2 in PREF_DEFAULTS) {
    if (source[key2] === undefined || source[key2] === null) continue
    out[key2] = source[key2]
  }
  out.background = out.background !== false
  out.facts = out.facts !== false
  out.quotes = out.quotes !== false
  out.reduceMotion = out.reduceMotion === true
  out.interval = Math.max(8, Math.min(180, Number(out.interval) || 24))
  out.intensity = Math.max(20, Math.min(92, Number(out.intensity) || 62))
  out.recent = Array.isArray(out.recent) ? out.recent.filter(function (x) { return typeof x === 'string' }).slice(0, 8) : []
  out.lang = typeof out.lang === 'string' ? out.lang : ''
  return out
}

var PREFS = normalizePrefs(readJSON(PREF_KEY))
var prefListeners = new Set()

function getPrefs() { return PREFS }
function subscribePrefs(listener) {
  prefListeners.add(listener)
  return function () { prefListeners.delete(listener) }
}
function setPrefs(patch) {
  PREFS = normalizePrefs(Object.assign({}, PREFS, patch))
  writeJSON(PREF_KEY, PREFS)
  prefListeners.forEach(function (listener) { try { listener() } catch (error) { /* isolate */ } })
}
function usePrefs() { return useSyncExternalStore(subscribePrefs, getPrefs, getPrefs) }

/* ---------- locale service plumbing -------------------------------------- */

var LOCALE = null
var TRANSLATE = null
var registeredSkin = new Set()
var registeredCore = new Set()
var addedLanguages = new Set()
var ensureLangRef = null

function localeSnapshot() {
  if (LOCALE !== null && typeof LOCALE.getSnapshot === 'function') return LOCALE.getSnapshot()
  return { active: FALLBACK, locales: [], revision: 0 }
}
function subscribeLocale(listener) {
  if (LOCALE === null || typeof LOCALE.subscribe !== 'function') return function () {}
  return LOCALE.subscribe(listener)
}
function useLocaleSnapshot() { return useSyncExternalStore(subscribeLocale, localeSnapshot, localeSnapshot) }

function baseLang(id) { return String(id || FALLBACK).split('-')[0] }

function fillVars(text, vars) {
  if (vars === undefined || vars === null) return text
  return String(text).replace(/\{([a-zA-Z0-9_.]+)\}/g, function (match, name) {
    return vars[name] === undefined || vars[name] === null ? match : String(vars[name])
  })
}

function t(key, vars) {
  var text = null
  if (TRANSLATE !== null) {
    try { text = TRANSLATE(key) } catch (error) { text = null }
  }
  if (text === null || text === undefined || text === key) {
    var en = UN_DATA.locales[FALLBACK]
    text = en !== undefined && en.strings[key] !== undefined ? en.strings[key] : key
  }
  return fillVars(text, vars)
}

function activeLang() {
  var snapshot = localeSnapshot()
  return snapshot !== null && snapshot.active !== undefined ? snapshot.active : FALLBACK
}

/** Pick the best translation of a content record (`i18n` map) for a language. */
function pickI18n(map, lang) {
  if (map === null || map === undefined) return ''
  if (map[lang] !== undefined) return map[lang]
  var base = baseLang(lang)
  if (map[base] !== undefined) return map[base]
  return map[FALLBACK] !== undefined ? map[FALLBACK] : ''
}

function activeDirection() {
  var lang = activeLang()
  var meta = UN_DATA.featureByCode[baseLang(lang)]
  return meta !== undefined && meta.dir === 'rtl' ? 'rtl' : 'ltr'
}

/* ---------- language registry (skin + DSH core dictionaries) -------------- */

function registerSkinPack(code) {
  if (registeredSkin.has(code)) return
  var pack = UN_DATA.locales[code]
  if (pack === undefined || pack === null) return
  registeredSkin.add(code)
  try {
    LOCALE.register(NS, code, pack.strings)
  } catch (error) {
    registeredSkin.delete(code)
    try { console.warn('[dsh-theme-un] skin dictionary registration failed for ' + code, error) } catch (ignored) {}
  }
}

function registerCorePack(code) {
  if (registeredCore.has(code)) return
  var pack = UN_DATA.core[code]
  if (pack === undefined || pack === null) return
  registeredCore.add(code)
  for (var ns in pack) {
    try {
      LOCALE.register(ns, code, pack[ns])
    } catch (error) {
      try { console.warn('[dsh-theme-un] core dictionary registration failed for ' + ns + '/' + code, error) } catch (ignored) {}
    }
  }
}

/** Make sure a language is selectable, then load its dictionaries. */
function ensureLanguage(code, options) {
  if (LOCALE === null || typeof code !== 'string' || code === '') return false
  var meta = UN_DATA.featureByCode[baseLang(code)]
  var known = meta !== undefined
  var pack = UN_DATA.locales[code]
  if (!known && pack === undefined) return false
  if (!addedLanguages.has(code)) {
    try {
      var registrations = LOCALE.getSnapshot().locales
      var present = false
      for (var i = 0; i < registrations.length; i++) if (registrations[i].id === code) { present = true; break }
      if (!present) {
        LOCALE.addLanguage({ id: code, label: meta !== undefined ? meta.n : code, fallback: FALLBACK })
      }
      addedLanguages.add(code)
    } catch (error) {
      try { console.warn('[dsh-theme-un] could not register language ' + code, error) } catch (ignored) {}
    }
  }
  registerSkinPack(code)
  registerCorePack(code)
  if (options !== undefined && options.select === true) {
    try { LOCALE.setLocale(code) } catch (error) { return false }
    setPrefs({ lang: code })
  }
  return true
}

/* ---------- formatting ---------------------------------------------------- */

function pad2(value) { return value < 10 ? '0' + value : String(value) }
function flagFor(code) {
  if (typeof code !== 'string' || code.length !== 2) return ''
  var upper = code.toUpperCase()
  try {
    return String.fromCodePoint.apply(String, upper.split('').map(function (letter) {
      return 0x1F1E6 + letter.charCodeAt(0) - 65
    }))
  } catch (error) { return '' }
}
function prefersReducedMotion() {
  try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches } catch (error) { return false }
}
function storageAvailable() {
  try {
    var key = '__dsh_un_probe__'
    window.localStorage.setItem(key, '1')
    window.localStorage.removeItem(key)
    return true
  } catch (error) { return false }
}
