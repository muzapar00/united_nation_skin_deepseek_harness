/* ==========================================================================
 * 50 · facts ribbon — one line under the composer: UN knowledge, member
 * states and the peacekeeping thank-you, rotated. One kind of information
 * per place, as requested.
 * ========================================================================== */

var ROTATE_FACTS_MS = 10000

function dayIndex() {
  var now = new Date()
  return Math.floor((now.getTime() - now.getTimezoneOffset() * 60000) / 86400000)
}

function memberName(member, lang) {
  if (baseLang(lang) === 'zh' && member.z) return member.z
  return member.e
}

function todayFactId() {
  var now = new Date()
  var month = now.getMonth() + 1
  var day = now.getDate()
  if (month === 1 && day === 27) return 'holocaust-remembrance'
  if (month === 4 && day === 7) return 'who'
  if (month === 5 && (day === 8 || day === 9)) return 'wwii-remembrance'
  if (month === 5 && day === 29) return 'peacekeepers-day'
  if (month === 10 && day === 24) return 'founded'
  if (month === 12 && day === 10) return 'human-rights-day'
  return null
}

function buildFactPlaylist(lang) {
  var items = []
  var facts = UN_DATA.facts
  var members = UN_DATA.members
  var day = dayIndex()
  var factOffset = day % Math.max(1, facts.length)
  var memberOffset = (day * 7) % Math.max(1, members.length)
  items.push({
    id: 'thanks',
    kind: 'thanks',
    label: t('ribbon.peacekeeping'),
    flag: '🇺🇳',
    text: t('ribbon.thankYou')
  })
  var special = todayFactId()
  if (special !== null) {
    for (var s = 0; s < facts.length; s++) {
      if (facts[s].id === special) {
        items.push({ id: 'fact-' + special, kind: 'fact', label: t('fact.label'), flag: '🇺🇳', text: pickI18n(facts[s].i18n, lang) })
        break
      }
    }
  }
  var factCursor = 0
  var memberCursor = 0
  for (var i = 0; i < 48; i++) {
    if (i % 4 === 3) {
      var member = members[(memberOffset + memberCursor) % members.length]
      memberCursor += 1
      items.push({
        id: 'member-' + member.c,
        kind: 'member',
        label: t('ribbon.member'),
        flag: member.f,
        cc: member.c,
        text: memberName(member, lang) + ' · United Nations'
      })
      continue
    }
    var fact = facts[(factOffset + factCursor) % facts.length]
    factCursor += 1
    items.push({
      id: 'fact-' + fact.id,
      kind: 'fact',
      label: t('fact.label'),
      flag: '🇺🇳',
      text: pickI18n(fact.i18n, lang)
    })
  }
  return items
}

function useRotatingIndex(length, ms, enabled) {
  var state = useState(0)
  var index = state[0]
  var setIndex = state[1]
  useEffect(function () {
    if (!enabled || length <= 1) return undefined
    var timer = window.setInterval(function () {
      if (document.hidden) return
      setIndex(function (current) { return (current + 1) % length })
    }, ms)
    return function () { window.clearInterval(timer) }
  }, [length, ms, enabled])
  return [index % Math.max(1, length), setIndex]
}

function FactsRibbon() {
  var prefs = usePrefs()
  var snapshot = useLocaleSnapshot()
  var lang = snapshot.active || FALLBACK
  var items = useMemo(function () { return buildFactPlaylist(lang) }, [lang])
  var rotation = useRotatingIndex(items.length, ROTATE_FACTS_MS, prefs.facts)
  var index = rotation[0]
  var setIndex = rotation[1]
  var pop = useState(false)
  var open = pop[0]
  var setOpen = pop[1]
  var hover = useRef(false)

  useEffect(function () {
    function onKey(event) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return function () { document.removeEventListener('keydown', onKey) }
  }, [])

  if (!prefs.facts) return null
  var item = items[index]
  if (item === undefined) return null

  return h('div', {
    className: 'un-facts',
    onMouseEnter: function () { hover.current = true },
    onMouseLeave: function () { hover.current = false }
  },
  h('div', { className: 'un-facts-main' },
    h('span', { className: 'un-facts-flag', key: 'flag-' + item.id },
      item.cc !== undefined ? h(FlagThumb, { cc: item.cc, fallback: item.flag, w: 22, h: 16 }) : item.flag),
    h('span', { className: 'un-facts-label' }, item.label),
    h('span', { className: 'un-facts-text un-fade-in', key: item.id, title: item.text }, item.text)),
  h('button', {
    type: 'button',
    className: 'un-facts-more',
    'aria-label': t('fact.label'),
    onClick: function (event) { event.stopPropagation(); setOpen(!open) }
  }, open ? '×' : '⋯'),
  open ? h('div', { className: 'un-facts-pop', role: 'dialog' },
    h('button', { className: 'un-facts-pop-close', type: 'button', onClick: function () { setOpen(false) } }, '×'),
    h('b', null, item.label),
    h('div', null, item.text),
    item.kind === 'thanks' ? h('div', { style: { marginTop: '8px', fontSize: '11px', opacity: 0.7 } }, t('about.credits')) : null) : null)
}

/* ==========================================================================
 * 60 · quotes — one rotating line above the composer, from the Charter,
 * the Universal Declaration, UNESCO and China's proposals to the UN.
 * ========================================================================== */

var ROTATE_QUOTES_MS = 16000

function QuotesRibbon() {
  var prefs = usePrefs()
  var snapshot = useLocaleSnapshot()
  var lang = snapshot.active || FALLBACK
  var quotes = UN_DATA.quotes
  var rotation = useRotatingIndex(quotes.length, ROTATE_QUOTES_MS, prefs.quotes)
  var index = rotation[0]
  if (!prefs.quotes) return null
  var quote = quotes[index]
  if (quote === undefined) return null
  var text = pickI18n(quote.text, lang)
  var source = pickI18n(quote.src, lang)
  return h('div', { className: 'un-quote', dir: activeDirection() },
    h('span', { className: 'un-quote-mark', 'aria-hidden': 'true' }, '“'),
    h('span', { className: 'un-quote-text un-fade-in', key: quote.id, title: source }, text),
    h('span', { className: 'un-quote-src' }, source))
}
