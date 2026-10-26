/* ==========================================================================
 * 70 · language — the catalogue, the searchable picker and the globe button
 * ========================================================================== */

var LANG_INDEX = null
var TRANSLATOR_URL = 'https://github.com/muzapar00/united_nation_skin_deepseek_harness/blob/main/locales/_TRANSLATING.md'
var REPO_URL = 'https://github.com/muzapar00/united_nation_skin_deepseek_harness'
var UN_URL = 'https://www.un.org/'

var SPECIAL_FOLD = {
  'ø': 'o', 'Ø': 'o', 'æ': 'ae', 'Æ': 'ae', 'œ': 'oe', 'Œ': 'oe', 'ß': 'ss',
  'ł': 'l', 'Ł': 'l', 'đ': 'd', 'Đ': 'd', 'ð': 'd', 'Ð': 'd', 'þ': 'th', 'Þ': 'th',
  'ı': 'i', 'İ': 'i', 'ħ': 'h', 'Ħ': 'h', 'ŧ': 't', 'Ŧ': 't', 'ŋ': 'ng', 'Ŋ': 'ng',
  'ʻ': '', 'ʼ': '', '’': '', '‘': '', '`': '', '·': ' ', '-': ' ', '_': ' ', '’': ''
}

function foldText(value) {
  var text = String(value || '')
  var out = ''
  for (var i = 0; i < text.length; i++) {
    var ch = text[i]
    out += SPECIAL_FOLD[ch] !== undefined ? SPECIAL_FOLD[ch] : ch
  }
  try { out = out.normalize('NFD').replace(/[\u0300-\u036f]/g, '') } catch (error) { /* old engine */ }
  return out.toLowerCase().replace(/\s+/g, ' ').trim()
}

function buildLangIndex() {
  if (LANG_INDEX !== null) return LANG_INDEX
  var featured = UN_DATA.languages.featured
  var byIso3 = {}
  var byCode = {}
  for (var i = 0; i < featured.length; i++) {
    var f = featured[i]
    byIso3[f.iso3] = f
    byCode[f.c] = f
  }
  var list = []
  for (var j = 0; j < featured.length; j++) {
    var item = featured[j]
    list.push({
      code: item.c,
      en: item.e,
      native: item.n,
      region: item.region,
      script: item.script,
      dir: item.dir,
      tier: item.tier,
      featured: true,
      key: foldText(item.n) + '\u0000' + foldText(item.e) + '\u0000' + item.c + '\u0000' + item.iso3
    })
  }
  var catalog = UN_DATA.languages.catalog
  for (var k = 0; k < catalog.length; k++) {
    var row = catalog[k]
    if (byIso3[row[0]] !== undefined) continue
    var native = row[2] || row[1]
    list.push({
      code: row[0],
      en: row[1],
      native: native,
      region: '',
      script: '',
      dir: 'ltr',
      tier: 'catalog',
      featured: false,
      key: foldText(native) + '\u0000' + foldText(row[1]) + '\u0000' + row[0]
    })
  }
  list.sort(function (a, b) {
    if (a.featured !== b.featured) return a.featured ? -1 : 1
    return a.en.localeCompare(b.en)
  })
  LANG_INDEX = list
  return list
}

function fullLanguageCount() {
  var featured = UN_DATA.languages.featured
  var count = 0
  for (var i = 0; i < featured.length; i++) {
    if (featured[i].tier === 'full' && UN_DATA.locales[featured[i].c] !== undefined) count += 1
  }
  return count
}

function browserLanguages() {
  var tags = []
  try {
    if (navigator.languages && navigator.languages.length > 0) tags = Array.prototype.slice.call(navigator.languages)
    else if (navigator.language) tags = [navigator.language]
  } catch (error) { tags = [] }
  var out = []
  var seen = {}
  for (var i = 0; i < tags.length; i++) {
    var base = baseLang(tags[i])
    if (seen[base]) continue
    seen[base] = true
    out.push(base)
  }
  return out
}

function queryLanguages(query, region) {
  var list = buildLangIndex()
  var q = foldText(query)
  var result = []
  for (var i = 0; i < list.length; i++) {
    var item = list[i]
    if (region !== 'all' && item.region !== region) continue
    if (q !== '' && item.key.indexOf(q) < 0) continue
    result.push(item)
  }
  if (q !== '') {
    result.sort(function (a, b) {
      var aExact = a.code === q || foldText(a.native) === q || foldText(a.en) === q ? 0 : 1
      var bExact = b.code === q || foldText(b.native) === q || foldText(b.en) === q ? 0 : 1
      if (aExact !== bExact) return aExact - bExact
      var aPrefix = foldText(a.native).indexOf(q) === 0 || foldText(a.en).indexOf(q) === 0 ? 0 : 1
      var bPrefix = foldText(b.native).indexOf(q) === 0 || foldText(b.en).indexOf(q) === 0 ? 0 : 1
      if (aPrefix !== bPrefix) return aPrefix - bPrefix
      if (a.featured !== b.featured) return a.featured ? -1 : 1
      return a.en.localeCompare(b.en)
    })
  }
  return result
}

function glyphOf(item) {
  var text = String(item.native || item.en || '?').trim()
  var first = Array.from(text)[0] || '?'
  return first.toUpperCase()
}

function LangRow(props) {
  var item = props.item
  var active = props.active === item.code
  var coverage = coverageOf(item.code)
  var meta = item.featured ? item.en : item.en
  return h('button', {
    type: 'button',
    className: 'un-lang' + (active ? ' is-active' : ''),
    onClick: function () { props.onPick(item.code) },
    title: item.native + ' · ' + item.en + ' · ' + item.code
  },
  h('span', { className: 'un-lang-script', 'aria-hidden': 'true', dir: item.dir === 'rtl' ? 'rtl' : 'ltr' }, glyphOf(item)),
  h('span', { className: 'un-lang-body' },
    h('span', { className: 'un-lang-native', dir: item.dir === 'rtl' ? 'rtl' : 'ltr' }, item.native),
    h('span', { className: 'un-lang-meta' },
      h('span', null, meta),
      h('span', { className: 'un-lang-code' }, item.code.toUpperCase()))),
  h(CoverageDots, { ratio: coverage }),
  h('span', { className: 'un-lang-check' }, active ? h(CheckIcon, { size: 15 }) : null))
}

function VirtualLanguageList(props) {
  var items = props.items
  var rowHeight = 58
  var boxRef = useRef(null)
  var measure = useState(320)
  var viewport = measure[0]
  var setViewport = measure[1]
  var state = useState(0)
  var scrollTop = state[0]
  var setScrollTop = state[1]
  useEffect(function () {
    var element = boxRef.current
    if (element === null) return undefined
    function read() { setViewport(Math.max(180, element.clientHeight)) }
    read()
    if (typeof window.ResizeObserver === 'function') {
      var observer = new window.ResizeObserver(read)
      observer.observe(element)
      return function () { observer.disconnect() }
    }
    window.addEventListener('resize', read)
    return function () { window.removeEventListener('resize', read) }
  }, [])
  var start = Math.max(0, Math.floor(scrollTop / rowHeight) - 5)
  var visible = Math.ceil(viewport / rowHeight) + 11
  var end = Math.min(items.length, start + visible)
  var rows = []
  for (var i = start; i < end; i++) {
    rows.push(h(LangRow, { key: items[i].code, item: items[i], active: props.active, onPick: props.onPick }))
  }
  return h('div', {
    className: 'un-body',
    ref: boxRef,
    onScroll: function (event) { setScrollTop(event.currentTarget.scrollTop) }
  },
  h('div', { style: { height: items.length * rowHeight + 'px', position: 'relative' } },
    h('div', { style: { position: 'absolute', top: start * rowHeight + 'px', left: '0', right: '0' } }, rows)))
}

function QuickLangChip(props) {
  var item = props.item
  var coverage = coverageOf(item.code)
  return h('button', {
    type: 'button',
    className: 'un-lang' + (props.active ? ' is-active' : ''),
    style: { padding: '7px 10px', width: 'auto', gap: '9px', borderRadius: '12px', border: '1px solid var(--un-line)' },
    onClick: function () { props.onPick(item.code) },
    title: item.native + ' · ' + item.en
  },
  h('span', { className: 'un-lang-script', style: { width: '30px', height: '26px', fontSize: '12px' }, 'aria-hidden': 'true' }, glyphOf(item)),
  h('span', { style: { display: 'flex', flexDirection: 'column', lineHeight: 1.2, textAlign: 'left', minWidth: 0 } },
    h('span', { style: { fontSize: '12.5px', fontWeight: 600 }, dir: item.dir === 'rtl' ? 'rtl' : 'ltr' }, item.native),
    h('span', { style: { fontSize: '9.5px', color: 'var(--un-ink-3)' } }, item.en)),
  h(CoverageDots, { ratio: coverage }))
}

function LanguageOverlay() {
  var openState = usePickerOpen()
  var snapshot = useLocaleSnapshot()
  var prefs = usePrefs()
  var active = snapshot.active || FALLBACK
  var queryState = useState('')
  var query = queryState[0]
  var setQuery = queryState[1]
  var regionState = useState('all')
  var region = regionState[0]
  var setRegion = regionState[1]
  var browseState = useState(false)
  var browse = browseState[0]
  var setBrowse = browseState[1]
  var inputRef = useRef(null)

  useEffect(function () {
    if (!openState.open) return undefined
    setQuery('')
    setBrowse(false)
    setRegion('all')
    var timer = window.setTimeout(function () {
      if (inputRef.current !== null) inputRef.current.focus()
    }, 30)
    function onKey(event) {
      if (event.key === 'Escape') setPickerOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return function () {
      window.clearTimeout(timer)
      document.removeEventListener('keydown', onKey)
    }
  }, [openState.open])

  if (!openState.open) return null

  var index = buildLangIndex()
  var byCode = {}
  for (var i = 0; i < index.length; i++) byCode[index[i].code] = index[i]
  var featured = UN_DATA.languages.featured
  var featureByCode = UN_DATA.featureByCode

  var suggested = []
  var seenSuggested = {}
  function pushSuggested(code) {
    if (code === active) return
    if (seenSuggested[code]) return
    var item = byCode[code]
    if (item === undefined) return
    seenSuggested[code] = true
    suggested.push(item)
  }
  var official = ['ar', 'zh', 'en', 'fr', 'ru', 'es']
  browserLanguages().forEach(pushSuggested)
  ;(prefs.recent || []).forEach(pushSuggested)
  ;['de', 'ja', 'hi', 'sw', 'pt', 'tr', 'id', 'ko'].forEach(pushSuggested)
  suggested = suggested.filter(function (item) { return official.indexOf(item.code) < 0 }).slice(0, 6)

  var showList = browse || query.trim() !== '' || region !== 'all'
  var results = showList ? queryLanguages(query, region) : []
  var regions = [
    { id: 'all', label: t('lang.region.all') },
    { id: 'africa', label: t('lang.region.africa') },
    { id: 'americas', label: t('lang.region.americas') },
    { id: 'asia', label: t('lang.region.asia') },
    { id: 'europe', label: t('lang.region.europe') },
    { id: 'oceania', label: t('lang.region.oceania') }
  ]

  function pick(code) {
    var ok = ensureLanguage(code, { select: true })
    if (!ok) {
      toast(t('lang.coverage.none'))
      return
    }
    var recent = [code].concat((getPrefs().recent || []).filter(function (entry) { return entry !== code })).slice(0, 8)
    setPrefs({ recent: recent })
    toast(coverageOf(code) === 0 ? displayNameOf(code) + ' · ' + t('lang.fallback') : displayNameOf(code))
    setPickerOpen(false)
  }

  var activeIndex = byCode[active]
  var activeNative = activeIndex !== undefined ? activeIndex.native : displayNameOf(active)
  var activeMeta = featureByCode[baseLang(active)] || null

  return h('div', {
    className: 'un-backdrop',
    dir: activeDirection(),
    onMouseDown: function (event) { if (event.target === event.currentTarget) setPickerOpen(false) }
  },
  h('div', {
    className: 'un-modal',
    role: 'dialog',
    'aria-modal': 'true',
    'aria-label': t('overlay.title')
  },
  h('div', { className: 'un-modal-head' },
    h('button', { className: 'un-modal-close', type: 'button', 'aria-label': t('common.done'), onClick: function () { setPickerOpen(false) } }, h(CloseIcon, { size: 15 })),
    h('div', { className: 'un-modal-head-row' },
      h(EmblemBadge, { size: 44 }),
      h('div', null,
        h('h2', { className: 'un-modal-title' }, t('overlay.title')),
        h('p', { className: 'un-modal-sub' }, t('overlay.subtitle'))))),
  h('div', { className: 'un-search' },
    h(SearchIcon, { size: 16 }),
    h('input', {
      ref: inputRef,
      type: 'search',
      value: query,
      placeholder: t('lang.searchHint'),
      'aria-label': t('lang.search'),
      onChange: function (event) { setQuery(event.target.value); setBrowse(true) }
    }),
    h('span', { className: 'un-kbd' }, 'Esc')),
  h('div', { className: 'un-chips' },
    regions.map(function (entry) {
      return h('button', {
        key: entry.id,
        type: 'button',
        className: 'un-chip' + (region === entry.id ? ' is-on' : ''),
        onClick: function () {
          setRegion(entry.id)
          if (entry.id !== 'all') setBrowse(true)
        }
      }, entry.label)
    })),
  !showList ? h('div', { className: 'un-body is-suggest' },
    h('div', { className: 'un-group-label' }, t('lang.suggested')),
    h('div', { className: 'un-chips', style: { padding: '0 12px 6px' } },
      suggested.map(function (item) {
        return h(QuickLangChip, { key: item.code, item: item, active: item.code === active, onPick: pick })
      })),
    h('div', { className: 'un-group-label' }, t('lang.official')),
    h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '0 12px 4px' } },
      ['ar', 'zh', 'en', 'fr', 'ru', 'es'].map(function (code) {
        var item = byCode[code]
        return item !== undefined ? h(QuickLangChip, { key: code, item: item, active: code === active, onPick: pick }) : null
      })),
    h('div', { className: 'un-note' }, t('lang.officialNote') + ' · ' + t('lang.fallback')),
    h('div', { style: { padding: '16px 12px 4px' } },
      h('button', {
        type: 'button',
        className: 'un-btn',
        onClick: function () { setBrowse(true) }
      }, t('lang.allCount', { count: index.length }), h(ArrowIcon, { size: 14 })))
  ) : h('div', null,
    h('div', { className: 'un-group-label' },
      query.trim() !== '' ? t('lang.search') : region === 'all' ? t('lang.all') : t('lang.region.' + region),
      h('span', { style: { fontWeight: 600, letterSpacing: 0, textTransform: 'none', fontSize: '11px' } },
        ' · ' + results.length)),
    results.length === 0
      ? h('div', { className: 'un-empty' }, t('lang.coverage.none'))
      : h(VirtualLanguageList, { items: results, active: active, onPick: pick })
  ),
  h('div', { className: 'un-modal-foot' },
    h('span', null,
      h('span', { className: 'un-badge', style: { marginInlineEnd: '8px' } }, String(fullLanguageCount())),
      t('lang.allCount', { count: index.length })),
    h('div', { style: { display: 'flex', alignItems: 'center', gap: '12px' } },
      h('span', { dir: 'ltr' }, activeNative + (activeMeta !== null && activeMeta.e !== activeNative ? ' · ' + activeMeta.e : ' · ' + String(active).toUpperCase())),
      h('a', {
        className: 'un-link',
        href: TRANSLATOR_URL,
        target: '_blank',
        rel: 'noopener noreferrer',
        title: t('lang.contributeHint')
      }, t('lang.contribute'))))))
}

function GlobeButton(props) {
  return h('button', {
    type: 'button',
    className: 'un-globe',
    title: t('overlay.open'),
    'aria-label': t('overlay.open'),
    onClick: function () { setPickerOpen(true) }
  }, h(GlobeIcon, { size: 18 }))
}

function OverlaySeat() {
  return h(React.Fragment, null, h(LanguageOverlay), h(ToastHost))
}
