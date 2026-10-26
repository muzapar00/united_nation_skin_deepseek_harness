/* ==========================================================================
 * 30 · shared UI atoms — emblem, icons, switches, toast, modal state
 * ========================================================================== */

var EMBLEM_MONO = 'url("' + UN_DATA.emblem.mono + '")'
var EMBLEM_BADGE = 'url("' + UN_DATA.emblem.badge + '")'

/** Monochrome UN emblem, recoloured with `color` (defaults to currentColor). */
function Emblem(props) {
  var size = props !== undefined && props.size !== undefined ? props.size : 20
  var style = {
    width: size + 'px',
    height: size + 'px',
    backgroundColor: (props !== undefined && props.color) || 'currentColor',
    WebkitMaskImage: EMBLEM_MONO,
    maskImage: EMBLEM_MONO
  }
  return h('span', {
    className: 'un-emblem ' + ((props !== undefined && props.className) || ''),
    style: style,
    'aria-hidden': 'true'
  })
}

/** The official badge form: white emblem on the UN blue disc. */
function EmblemBadge(props) {
  var size = props !== undefined && props.size !== undefined ? props.size : 24
  return h('span', {
    className: 'un-emblem-badge ' + ((props !== undefined && props.className) || ''),
    style: { width: size + 'px', height: size + 'px', backgroundImage: EMBLEM_BADGE },
    'aria-hidden': 'true'
  })
}

function svgIcon(size, children, viewBox) {
  return h('svg', {
    width: size,
    height: size,
    viewBox: viewBox || '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': 'true'
  }, children)
}

function GlobeIcon(props) {
  var size = props !== undefined && props.size !== undefined ? props.size : 18
  return svgIcon(size, [
    h('circle', { key: 'c', cx: 12, cy: 12, r: 8.6 }),
    h('path', { key: 'a', d: 'M3.6 12h16.8' }),
    h('path', { key: 'b', d: 'M12 3.4c2.3 2.3 3.5 5.3 3.5 8.6S14.3 18.3 12 20.6C9.7 18.3 8.5 15.3 8.5 12S9.7 5.7 12 3.4z' })
  ])
}
function SearchIcon(props) {
  var size = props !== undefined && props.size !== undefined ? props.size : 16
  return svgIcon(size, [
    h('circle', { key: 'c', cx: 11, cy: 11, r: 6.6 }),
    h('path', { key: 'l', d: 'M16.2 16.2 21 21' })
  ])
}
function CloseIcon(props) {
  var size = props !== undefined && props.size !== undefined ? props.size : 16
  return svgIcon(size, [
    h('path', { key: 'a', d: 'M6 6l12 12' }),
    h('path', { key: 'b', d: 'M18 6 6 18' })
  ])
}
function CheckIcon(props) {
  var size = props !== undefined && props.size !== undefined ? props.size : 16
  return svgIcon(size, [h('path', { key: 'p', d: 'M4.5 12.5 9.5 17.5 19.5 6.5' })])
}
function ArrowIcon(props) {
  var size = props !== undefined && props.size !== undefined ? props.size : 15
  return svgIcon(size, [
    h('path', { key: 's', d: 'M5 12h13' }),
    h('path', { key: 'a', d: 'M13 6.5 18.5 12 13 17.5' })
  ])
}

/* ---------- toast -------------------------------------------------------- */

var toastState = { text: '', seq: 0 }
var toastListeners = new Set()
function toast(text) {
  var seq = toastState.seq + 1
  toastState = { text: text, seq: seq }
  toastListeners.forEach(function (listener) { try { listener() } catch (error) { /* isolate */ } })
  window.setTimeout(function () {
    if (toastState.seq !== seq) return
    toastState = { text: '', seq: toastState.seq + 1 }
    toastListeners.forEach(function (listener) { try { listener() } catch (error) { /* isolate */ } })
  }, 2600)
}
function useToast() { return useSyncExternalStore(function (fn) { toastListeners.add(fn); return function () { toastListeners.delete(fn) } }, function () { return toastState }, function () { return toastState }) }
function ToastHost() {
  var state = useToast()
  if (!state.text) return null
  return h('div', { className: 'un-toast', role: 'status' }, state.text)
}

/* ---------- language overlay open state ---------------------------------- */

var pickerState = { open: false, seq: 0 }
var pickerListeners = new Set()
function setPickerOpen(open) {
  if (pickerState.open === open) return
  pickerState = { open: open, seq: pickerState.seq + 1 }
  pickerListeners.forEach(function (listener) { try { listener() } catch (error) { /* isolate */ } })
}
function usePickerOpen() {
  return useSyncExternalStore(
    function (fn) { pickerListeners.add(fn); return function () { pickerListeners.delete(fn) } },
    function () { return pickerState },
    function () { return pickerState }
  )
}

/* ---------- form atoms --------------------------------------------------- */

function Switch(props) {
  return h('button', {
    type: 'button',
    role: 'switch',
    'aria-checked': props.value ? 'true' : 'false',
    className: 'un-switch' + (props.value ? ' is-on' : ''),
    onClick: function () { props.onChange(!props.value) },
    title: props.title || undefined
  })
}

function Segmented(props) {
  return h('div', { className: 'un-seg', role: 'group', 'aria-label': props.label || undefined },
    props.options.map(function (option) {
      return h('button', {
        key: option.id,
        type: 'button',
        className: option.id === props.value ? 'is-on' : '',
        'aria-pressed': option.id === props.value ? 'true' : 'false',
        onClick: function () { props.onChange(option.id) }
      }, option.label)
    }))
}

function Row(props) {
  return h('div', { className: 'un-row' },
    h('div', { className: 'un-row-main' },
      h('div', { className: 'un-row-title' }, props.title),
      props.desc !== undefined ? h('div', { className: 'un-row-desc' }, props.desc) : null),
    h('div', { className: 'un-row-side' }, props.children))
}

/* ---------- derived helpers --------------------------------------------- */

var COVERAGE_CACHE = {}
function coverageOf(code) {
  if (COVERAGE_CACHE[code] !== undefined) return COVERAGE_CACHE[code]
  var ratio = 0
  if (code === FALLBACK) ratio = 1
  else {
    var pack = UN_DATA.locales[code]
    if (pack !== undefined && pack !== null) {
      var en = UN_DATA.locales[FALLBACK].strings
      var done = 0
      for (var i = 0; i < SOURCE_KEYS.length; i++) {
        var key = SOURCE_KEYS[i]
        var value = pack.strings[key]
        if (value !== undefined && value !== en[key]) done += 1
      }
      ratio = done / SOURCE_COUNT
    }
  }
  COVERAGE_CACHE[code] = ratio
  return ratio
}

function coreCoverageOf(code) {
  if (code === FALLBACK) return 1
  var pack = UN_DATA.core[code]
  if (pack === undefined || pack === null) return 0
  var en = UN_DATA.core[FALLBACK]
  var done = 0
  var total = 0
  for (var ns in en) {
    for (var key in en[ns]) {
      total += 1
      if (pack[ns] !== undefined && pack[ns][key] !== undefined && pack[ns][key] !== en[ns][key]) done += 1
    }
  }
  return total === 0 ? 0 : done / total
}

function coverageLabel(ratio) {
  if (ratio >= 0.95) return t('lang.coverage.full')
  if (ratio >= 0.55) return t('lang.coverage.partial')
  if (ratio > 0) return t('lang.coverage.basic')
  return t('lang.coverage.none')
}

function CoverageDots(props) {
  var ratio = props.ratio
  var level = ratio >= 0.95 ? 3 : ratio >= 0.55 ? 2 : ratio > 0 ? 1 : 0
  return h('span', { className: 'un-cov', title: coverageLabel(ratio) }, [0, 1, 2].map(function (index) {
    return h('span', { key: index, className: 'un-dot' + (index < level ? ' is-on' : '') })
  }))
}

function languageMeta(code) {
  return UN_DATA.featureByCode[baseLang(code)] || null
}

function displayNameOf(code) {
  var meta = languageMeta(code)
  if (meta !== null) return meta.n
  var pack = UN_DATA.locales[code]
  if (pack !== undefined) return pack.native
  for (var i = 0; i < UN_DATA.languages.catalog.length; i++) {
    if (UN_DATA.languages.catalog[i][0] === code) {
      return UN_DATA.languages.catalog[i][2] || UN_DATA.languages.catalog[i][1]
    }
  }
  return code
}

function openExternal(url) {
  try { window.open(url, '_blank', 'noopener,noreferrer') } catch (error) { /* ignore */ }
}
