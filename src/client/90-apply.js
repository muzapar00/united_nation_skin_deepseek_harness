/* ==========================================================================
 * 90 · apply — mount the skin into the client plugin tree
 * ========================================================================== */

function BrandMark(props) {
  var size = props !== undefined && props.size !== undefined ? props.size : 22
  return h('span', { className: 'un-brand-rail' }, h(Emblem, { size: size, className: 'un-brand-mark' }))
}

function BrandName() {
  return h('div', { className: 'un-brand' },
    h('div', { className: 'un-brand-text' },
      h('div', { className: 'un-brand-name' }, 'United Nations'),
      h('div', { className: 'un-brand-sub' }, 'DeepSeek Harness')))
}

function HeroMark() {
  return h('div', { className: 'un-hero' }, h(Emblem, { size: 44, className: 'un-hero-mark' }))
}

function registerSlot(ctx, name, registration, component, label) {
  try {
    ctx.effect(function () {
      return ctx.slots.inject(name, function () {
        return ctx.slots.register(registration, component)
      })
    }, 'un-skin: ' + label)
  } catch (error) {
    try { console.warn('[dsh-theme-un] slot "' + name + '" unavailable', error) } catch (ignored) {}
  }
}

function applyStyleLayer(ctx) {
  var style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = buildCss()
  document.head.appendChild(style)
  document.body.setAttribute(BODY_ATTR, '1')
  document.body.classList.toggle('un-reduced', getPrefs().reduceMotion || prefersReducedMotion())
  ctx.effect(function () {
    return function () {
      if (style.parentNode !== null) style.parentNode.removeChild(style)
      document.body.removeAttribute(BODY_ATTR)
      document.body.classList.remove('un-reduced')
      document.body.style.removeProperty('--un-veil-alpha')
      document.body.style.removeProperty('--un-veil-top')
    }
  }, 'un-skin: style layer')
}

function applyLocale(ctx) {
  var snapshot = LOCALE.getSnapshot()
  registerSkinPack(FALLBACK)
  registerCorePack(FALLBACK)
  ensureLanguage(FALLBACK)
  ensureLanguage(snapshot.active)
  var stored = getPrefs().lang
  if (stored !== '' && stored !== snapshot.active) {
    ensureLanguage(stored, { select: true })
  }
  ctx.effect(function () {
    return LOCALE.subscribe(function () {
      var active = LOCALE.getSnapshot().active
      ensureLanguage(active)
      if (active !== getPrefs().lang) setPrefs({ lang: active })
    })
  }, 'un-skin: locale follow')
}

function applyShortcuts(ctx) {
  function onKey(event) {
    var modifier = event.metaKey || event.ctrlKey
    if (modifier && event.shiftKey && (event.key === 'L' || event.key === 'l')) {
      event.preventDefault()
      setPickerOpen(true)
    }
  }
  document.addEventListener('keydown', onKey)
  ctx.effect(function () {
    return function () { document.removeEventListener('keydown', onKey) }
  }, 'un-skin: shortcuts')
}

function logIntro() {
  try {
    var quote = UN_DATA.quotes[0]
    console.log('%c United Nations Skin for DeepSeek Harness ', 'background:#009EDB;color:#fff;font-weight:600;padding:2px 6px;border-radius:4px')
    console.log('%c' + quote.text.en + ' — ' + quote.src.en, 'color:#0077A8;font-style:italic')
  } catch (error) { /* ignore */ }
}

function apply(ctx) {
  LOCALE = ctx.get !== undefined && ctx.get('locale') !== undefined ? ctx.get('locale') : ctx.locale
  THEME = ctx.get !== undefined && ctx.get('theme') !== undefined ? ctx.get('theme') : ctx.theme
  if (LOCALE === null || LOCALE === undefined) {
    console.warn('[dsh-theme-un] the locale service is missing; the skin cannot install its dictionaries')
    return
  }
  if (THEME === null || THEME === undefined) {
    console.warn('[dsh-theme-un] the theme service is missing; the skin keeps its CSS layer only')
  }
  TRANSLATE = LOCALE.bind(NS)

  applyStyleLayer(ctx)

  if (THEME !== null && THEME !== undefined && typeof THEME.overrideTokens === 'function') {
    ctx.effect(function () {
      var dispose = THEME.overrideTokens(PLUGIN_ID, buildTokenOverrides())
      return function () { if (typeof dispose === 'function') dispose() }
    }, 'un-skin: token layer')
  }

  applyLocale(ctx)
  applyShortcuts(ctx)

  ctx.effect(function () { return mountBackground(ctx) }, 'un-skin: background rotation')

  registerSlot(ctx, 'sidebar.brand.mark', { name: 'sidebar.brand.mark', id: 'un-mark', priority: -1 }, BrandMark, 'brand mark')
  registerSlot(ctx, 'sidebar.brand.name', { name: 'sidebar.brand.name', id: 'un-name', priority: -1 }, BrandName, 'brand name')
  registerSlot(ctx, 'conversation.hero.brand.mark', { name: 'conversation.hero.brand.mark', id: 'un-hero', priority: -1 }, HeroMark, 'hero mark')
  registerSlot(ctx, 'sidebar.footer.action', { name: 'sidebar.footer.action', id: 'un-globe', order: 10, label: t('overlay.open') }, GlobeButton, 'language button')
  registerSlot(ctx, 'conversation.input.dock', { name: 'conversation.input.dock', id: 'un-quotes', order: 88, label: t('appearance.quotes') }, QuotesRibbon, 'quotes ribbon')
  registerSlot(ctx, 'conversation.input.dock', { name: 'conversation.input.dock', id: 'un-facts', order: 90, label: t('appearance.ribbon') }, FactsRibbon, 'facts ribbon')
  registerSlot(ctx, 'shell.overlay', { name: 'shell.overlay', id: 'un-overlay', order: 95 }, OverlaySeat, 'language overlay')
  registerSlot(ctx, 'settings.section', {
    name: 'settings.section',
    id: 'unitednations',
    order: 40,
    label: function () { return t('nav') }
  }, UnitedNationsSection, 'settings section')

  logIntro()
}
