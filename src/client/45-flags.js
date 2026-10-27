/* ==========================================================================
 * 45 · flags — 193 Member State flags + the United Nations flag, used in the
 * Member State spotlight, the photo caption and the hidden flag wall.
 * ========================================================================== */

var flagWallState = { open: false, seq: 0 }
var flagWallListeners = new Set()

function setFlagWallOpen(open) {
  if (flagWallState.open === open) return
  flagWallState = { open: open, seq: flagWallState.seq + 1 }
  flagWallListeners.forEach(function (listener) { try { listener() } catch (error) { /* isolate */ } })
}
function useFlagWallOpen() {
  return useSyncExternalStore(
    function (fn) { flagWallListeners.add(fn); return function () { flagWallListeners.delete(fn) } },
    function () { return flagWallState },
    function () { return flagWallState }
  )
}

function flagData(cc) {
  if (typeof cc !== 'string') return null
  return UN_DATA.flags[cc.toLowerCase()] || null
}

/** A small, crisp flag image; falls back to the emoji when a file is missing. */
function FlagThumb(props) {
  var src = flagData(props.cc)
  var width = props.w !== undefined ? props.w : 24
  var height = props.h !== undefined ? props.h : 18
  if (src === null) return h('span', { className: 'un-flag-emoji' }, props.fallback || '')
  return h('img', {
    className: 'un-flag ' + (props.className || ''),
    src: src,
    width: width,
    height: height,
    alt: '',
    loading: 'lazy',
    draggable: false
  })
}

function flagWallMembers() {
  return UN_DATA.members
}

function FlagWall() {
  var state = useFlagWallOpen()
  var snapshot = useLocaleSnapshot()
  var lang = snapshot.active || FALLBACK
  useEffect(function () {
    if (!state.open) return undefined
    function onKey(event) {
      if (event.key === 'Escape') setFlagWallOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return function () { document.removeEventListener('keydown', onKey) }
  }, [state.open])
  if (!state.open) return null
  return h('div', {
    className: 'un-flagwall',
    role: 'dialog',
    'aria-modal': 'true',
    'aria-label': 'United Nations',
    onClick: function (event) { if (event.target === event.currentTarget) setFlagWallOpen(false) }
  },
  h('div', { className: 'un-flagwall-head' },
    h(Emblem, { size: 34, color: '#ffffff' }),
    h('div', null,
      h('div', { className: 'un-flagwall-title' }, 'United Nations'),
      h('div', { className: 'un-flagwall-sub' }, t('tagline') + ' · 193 Member States · 会员国')),
    h('button', {
      className: 'un-flagwall-close',
      type: 'button',
      'aria-label': t('common.done'),
      onClick: function () { setFlagWallOpen(false) }
    }, h(CloseIcon, { size: 16 }))),
  h('div', { className: 'un-flagwall-grid' },
    flagWallMembers().map(function (member) {
      return h('figure', { className: 'un-flagwall-item', key: member.c, title: member.e + ' · ' + member.z },
        h(FlagThumb, { cc: member.c, w: 64, h: 48 }),
        h('figcaption', null, baseLang(lang) === 'zh' ? member.z : member.e))
    })),
  h('div', { className: 'un-flagwall-foot' },
    t('ribbon.thankYou') + ' · ' + t('about.disclaimer')))
}

/* ---------- SDG colour strip (a quiet easter egg) ------------------------ */

function SdgStrip() {
  var snapshot = useLocaleSnapshot()
  var lang = snapshot.active || FALLBACK
  return h('div', { className: 'un-sdg', title: 'Sustainable Development Goals' },
    UN_DATA.sdgs.map(function (goal) {
      return h('a', {
        key: goal.n,
        href: 'https://www.un.org/sustainabledevelopment/',
        target: '_blank',
        rel: 'noopener noreferrer',
        className: 'un-sdg-dot',
        style: { background: goal.color },
        title: goal.n + ' · ' + (baseLang(lang) === 'zh' ? goal.zh : goal.en)
      })
    }))
}
