/* ==========================================================================
 * 80 · settings — the United Nations section (one settings page of its own)
 * ========================================================================== */

var THEME = null
var VERSION = UN_DATA.version

function themePreference() {
  try {
    var snapshot = THEME !== null ? THEME.getTheme() : null
    return snapshot !== null && snapshot.preference !== undefined ? snapshot.preference : 'system'
  } catch (error) { return 'system' }
}

function setThemePreference(value) {
  try { if (THEME !== null) THEME.setTheme(value) } catch (error) { /* ignore */ }
}

function currentLanguageInfo(active) {
  var item = null
  var index = buildLangIndex()
  for (var i = 0; i < index.length; i++) if (index[i].code === active) { item = index[i]; break }
  if (item === null) {
    return { native: displayNameOf(active), en: active, code: active }
  }
  return item
}

function LanguageCard(props) {
  var snapshot = useLocaleSnapshot()
  var active = snapshot.active || FALLBACK
  var info = currentLanguageInfo(active)
  var coverage = coverageOf(active)
  var full = fullLanguageCount()
  var total = buildLangIndex().length
  return h('div', { className: 'un-card' },
    h('div', { className: 'un-card-head' }, h(Emblem, { size: 12 }), t('lang.title')),
    h(Row, {
      title: t('lang.current'),
      desc: h('span', null, coverageLabel(coverage) + ' · ' + t('lang.fallback'))
    },
    h('button', {
      type: 'button',
      className: 'un-lang-button',
      onClick: function () { if (props !== undefined && typeof props.onOpenPicker === 'function') props.onOpenPicker(); else setPickerOpen(true) }
    },
    h(GlobeIcon, { size: 17 }),
    h('span', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 0 } },
      h('span', { className: 'un-lang-button-native', dir: info.dir === 'rtl' ? 'rtl' : 'ltr' }, info.native),
      h('span', { className: 'un-lang-button-en' }, info.en + ' · ' + info.code.toUpperCase())),
    h(CoverageDots, { ratio: coverage }))),
    h(Row, {
      title: t('lang.official'),
      desc: t('lang.officialNote')
    },
    h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'flex-end', maxWidth: '340px' } },
      ['ar', 'zh', 'en', 'fr', 'ru', 'es'].map(function (code) {
        var item = null
        var index = buildLangIndex()
        for (var i = 0; i < index.length; i++) if (index[i].code === code) { item = index[i]; break }
        if (item === null) return null
        return h('button', {
          key: code,
          type: 'button',
          className: 'un-chip' + (code === active ? ' is-on' : ''),
          onClick: function () { ensureLanguage(code, { select: true }); setPrefs({ recent: [code].concat(getPrefs().recent) }) }
        }, item.native)
      }))),
    h(Row, {
      title: t('lang.all'),
      desc: h('span', null, t('lang.allCount', { count: total }) + ' · ' + String(full) + ' ' + t('lang.coverage.full').toLowerCase())
    },
    h('a', { className: 'un-btn', href: TRANSLATOR_URL, target: '_blank', rel: 'noopener noreferrer' }, t('lang.contribute'))))
}

function AppearanceCard() {
  var prefs = usePrefs()
  var tick = useState(0)
  var bump = tick[1]
  var preference = themePreference()
  return h('div', { className: 'un-card' },
    h('div', { className: 'un-card-head' }, h(Emblem, { size: 12 }), t('appearance.title')),
    h(Row, { title: t('appearance.mode'), desc: t('appearance.mode.auto') + ' · ' + t('appearance.mode.light') + ' · ' + t('appearance.mode.dark') },
      h(Segmented, {
        value: preference,
        label: t('appearance.mode'),
        options: [
          { id: 'system', label: t('appearance.mode.auto') },
          { id: 'light', label: t('appearance.mode.light') },
          { id: 'dark', label: t('appearance.mode.dark') }
        ],
        onChange: function (value) { setThemePreference(value); bump(function (n) { return n + 1 }) }
      })),
    h(Row, {
      title: t('appearance.background'),
      desc: t('appearance.backgroundHint')
    },
    h(Switch, {
      value: prefs.background,
      title: t('appearance.background'),
      onChange: function (value) { setPrefs({ background: value }) }
    })),
    h(Row, {
      title: t('appearance.interval'),
      desc: t('appearance.backgroundHint')
    },
    h('select', {
      className: 'un-btn',
      value: String(prefs.interval),
      disabled: !prefs.background,
      'aria-label': t('appearance.interval'),
      onChange: function (event) { setPrefs({ interval: Number(event.target.value) }) }
    }, [12, 24, 48, 90].map(function (seconds) {
      return h('option', { key: seconds, value: String(seconds) }, seconds + ' s')
    }))),
    h(Row, {
      title: t('appearance.background') + ' · ' + String(prefs.intensity) + '%',
      desc: t('appearance.backgroundHint')
    },
    h('input', {
      type: 'range',
      className: 'un-slider',
      min: '20',
      max: '92',
      step: '1',
      value: String(prefs.intensity),
      disabled: !prefs.background,
      'aria-label': t('appearance.background'),
      onChange: function (event) { setPrefs({ intensity: Number(event.target.value) }) }
    })),
    h(Row, { title: t('appearance.ribbon'), desc: t('fact.label') },
      h(Switch, { value: prefs.facts, title: t('appearance.ribbon'), onChange: function (value) { setPrefs({ facts: value }) } })),
    h(Row, { title: t('appearance.quotes'), desc: t('quote.label') },
      h(Switch, { value: prefs.quotes, title: t('appearance.quotes'), onChange: function (value) { setPrefs({ quotes: value }) } })),
    h(Row, { title: t('appearance.motion') },
      h(Switch, {
        value: prefs.reduceMotion,
        title: t('appearance.motion'),
        onChange: function (value) {
          setPrefs({ reduceMotion: value })
          document.body.classList.toggle('un-reduced', value || prefersReducedMotion())
        }
      })))
}

function charterQuotes() {
  return UN_DATA.quotes.filter(function (quote) { return quote.id.indexOf('q-preamble-') === 0 })
}

function otherQuotes() {
  return UN_DATA.quotes.filter(function (quote) { return quote.id.indexOf('q-preamble-') !== 0 })
}

function AboutCard() {
  var snapshot = useLocaleSnapshot()
  var lang = snapshot.active || FALLBACK
  var egg = useState(0)
  var eggCount = egg[0]
  var setEggCount = egg[1]
  var revealed = eggCount >= 5
  return h('div', { className: 'un-card un-about' },
    h('div', { className: 'un-card-head' }, h(Emblem, { size: 12 }), t('about.title')),
    h('div', { style: { display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 0 6px' } },
      h('button', {
        type: 'button',
        title: t('about.title'),
        'aria-label': t('about.title'),
        onClick: function () {
          var next = eggCount + 1
          setEggCount(next)
          if (next === 3) setFlagWallOpen(true)
          if (next === 5) toast('UN80 · 1945—2025')
        },
        style: { border: 0, background: 'transparent', padding: 0, cursor: 'pointer', lineHeight: 0 }
      }, h(EmblemBadge, { size: 52 })),
      h('div', null,
        h('div', { style: { fontSize: '14px', fontWeight: 650, color: 'var(--un-ink)' } }, 'United Nations'),
        h('div', { style: { fontSize: '11px', color: 'var(--un-ink-3)', letterSpacing: '.04em' } },
          t('about.version') + ' ' + VERSION + ' · ' + t('tagline')),
        revealed ? h('div', { className: 'un-badge', style: { marginTop: '6px' } }, 'UN80 · 1945—2025') : null)),
    h('div', { className: 'un-links', style: { margin: '10px 0 12px' } },
      h('a', { className: 'un-btn un-btn-primary', href: UN_URL, target: '_blank', rel: 'noopener noreferrer' }, t('about.un'), h(ArrowIcon, { size: 14 })),
      h('a', { className: 'un-btn', href: REPO_URL, target: '_blank', rel: 'noopener noreferrer' }, t('about.repo')),
      h('a', { className: 'un-btn', href: TRANSLATOR_URL, target: '_blank', rel: 'noopener noreferrer' }, t('lang.contribute'))),
    h('div', { className: 'un-charter' },
      h('div', { style: { fontSize: '11px', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--un-ink-3)', margin: '2px 0 6px' } }, t('about.charter')),
      h('details', { open: false },
        h('summary', null, t('about.charter') + ' · ' + t('tagline')),
        charterQuotes().map(function (quote) {
          return h('p', { key: quote.id, dir: activeDirection() }, pickI18n(quote.text, lang))
        }),
        h('div', { className: 'un-charter-src' }, pickI18n(charterQuotes()[0].src, lang))),
      otherQuotes().map(function (quote) {
        return h('details', { key: quote.id },
          h('summary', null, pickI18n(quote.src, lang)),
          h('p', { dir: activeDirection() }, pickI18n(quote.text, lang)),
          h('div', { className: 'un-charter-src' }, pickI18n(quote.src, lang)))
      })),
    h('div', { style: { marginTop: '14px' } },
      h('div', { style: { fontSize: '11px', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--un-ink-3)', margin: '2px 0 8px' } },
        t('ribbon.member') + ' · 193'),
      h('details', { className: 'un-flag-mosaic-wrap' },
        h('summary', null, '193 个会员国 · Member States'),
        h('div', { className: 'un-flag-mosaic' },
          UN_DATA.members.map(function (member) {
            return h('figure', { key: member.c, className: 'un-flag-mosaic-item', title: member.e + ' · ' + member.z },
              h(FlagThumb, { cc: member.c, w: 26, h: 20 }),
              h('figcaption', null, baseLang(lang) === 'zh' ? member.z : member.e))
          }))),
      h('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' } },
        h('button', {
          type: 'button',
          className: 'un-btn',
          onClick: function () { setFlagWallOpen(true) }
        }, h(Emblem, { size: 13 }), 'United Nations · 193'),
        h(SdgStrip))),
    h('div', { style: { marginTop: '14px', fontSize: '10.5px', lineHeight: 1.6, color: 'var(--un-ink-3)' } },
      h('p', { style: { margin: '0 0 6px' } }, t('about.disclaimer')),
      h('p', { style: { margin: '0 0 4px' } }, t('about.credits') + ':'),
      h('ul', { style: { margin: '0', paddingInlineStart: '16px' } },
        UN_DATA.credits.map(function (credit, index) {
          return h('li', { key: index },
            h('a', { className: 'un-link', href: credit.source, target: '_blank', rel: 'noopener noreferrer' }, credit.title),
            ' — ' + credit.author + ' (' + credit.license + ')')
        })),
      h('p', { style: { margin: '8px 0 0' } }, 'Emblem: United Nations. Code: MIT. Translations: CC BY-SA 4.0.')))
}

var TAGLINE_ORDER = ['zh', 'en', 'fr', 'es', 'ru', 'ar']

function TaglineButton() {
  var snapshot = useLocaleSnapshot()
  var state = useState(-1)
  var index = state[0]
  var setIndex = state[1]
  var active = snapshot.active || FALLBACK
  var current = index < 0 ? t('tagline') : UN_DATA.taglines[TAGLINE_ORDER[index]] || t('tagline')
  function cycle() {
    var next = (index + 1) % TAGLINE_ORDER.length
    setIndex(next)
    var code = TAGLINE_ORDER[next]
    toast(displayNameOf(code) + ' · ' + UN_DATA.taglines[code])
  }
  return h('button', {
    type: 'button',
    className: 'un-hero-tag un-hero-tag-button',
    title: t('tagline') + ' · 1945',
    onClick: cycle,
    dir: active === 'ar' || current === UN_DATA.taglines.ar ? undefined : undefined
  }, current + ' · 1945')
}

function UnitedNationsSection(props) {
  var snapshot = useLocaleSnapshot()
  var direction = activeDirection()
  return h('div', { className: 'un-section', dir: direction },
    h('div', { className: 'un-hero-card' },
      h(EmblemBadge, { size: 62 }),
      h('div', { style: { minWidth: 0 } },
        h('h2', { className: 'un-hero-title' }, t('title')),
        h('p', { className: 'un-hero-sub' }, t('subtitle')),
        h(TaglineButton))),
    h(LanguageCard, { onOpenPicker: function () { if (typeof props.close === 'function') props.close(); setPickerOpen(true) } }),
    h(AppearanceCard),
    h(AboutCard))
}
