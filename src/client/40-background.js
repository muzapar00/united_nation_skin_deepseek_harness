/* ==========================================================================
 * 40 · background — the peacekeeping photo rotation behind the whole app
 * ========================================================================== */

var BG = {
  root: null,
  front: null,
  back: null,
  index: 0,
  timer: null,
  disposeFns: []
}

function bgImages() { return UN_IMAGES }

function captionText() {
  var image = bgImages()[BG.index % bgImages().length]
  return image
}

function updateCaption() {
  if (BG.root === null) return
  var image = captionText()
  var capLine = BG.root.querySelector('.un-bg-cap-line')
  var capLineFlag = BG.root.querySelector('.un-bg-cap-flagimg')
  var capLineText = capLine !== null ? capLine.querySelector('span') : null
  var capThanks = BG.root.querySelector('.un-bg-cap-thanks')
  var capCredit = BG.root.querySelector('.un-bg-cap-credit')
  if (capLine !== null) {
    if (image.flagThumb) {
      capLineFlag.src = image.flagThumb
      capLineFlag.style.display = ''
    } else {
      capLineFlag.style.display = 'none'
    }
    capLineText.textContent = ' ' + t('ribbon.peacekeeping') + ' · ' + image.country.en
  }
  if (capThanks !== null) capThanks.textContent = t('ribbon.thankYou')
  if (capCredit !== null) {
    capCredit.textContent = 'Photo: ' + image.credit.author + ' · ' + image.credit.license
  }
}

function showImage(index, instant) {
  if (BG.root === null) return
  var images = bgImages()
  if (images.length === 0) return
  var image = images[index % images.length]
  var next = BG.back
  var previous = BG.front
  next.style.transition = instant ? 'none' : ''
  next.style.backgroundImage = 'url("' + image.data + '")'
  next.style.opacity = '1'
  // after the dissolve, hide the old front without animating and swap roles
  window.setTimeout(function () {
    if (BG.root === null) return
    previous.style.transition = 'none'
    previous.style.opacity = '0'
    window.setTimeout(function () { if (previous !== null) previous.style.transition = '' }, 40)
  }, instant ? 0 : 2450)
  BG.front = next
  BG.back = previous
  BG.index = index % images.length
  updateCaption()
}

function armRotation() {
  if (BG.timer !== null) { window.clearInterval(BG.timer); BG.timer = null }
  var prefs = getPrefs()
  if (!prefs.background) return
  var seconds = Math.max(8, Math.min(180, Number(prefs.interval) || 24))
  BG.timer = window.setInterval(function () {
    if (document.hidden) return
    showImage(BG.index + 1, false)
  }, seconds * 1000)
}

function mountBackground(ctx) {
  var root = document.createElement('div')
  root.className = 'un-bg'
  root.setAttribute('aria-hidden', 'true')
  var a = document.createElement('div')
  a.className = 'un-bg-img is-front'
  var b = document.createElement('div')
  b.className = 'un-bg-img'
  var veil = document.createElement('div')
  veil.className = 'un-bg-veil'
  var top = document.createElement('div')
  top.className = 'un-bg-top'
  var cap = document.createElement('div')
  cap.className = 'un-bg-cap'
  var line = document.createElement('div'); line.className = 'un-bg-cap-line'
  var lineFlag = document.createElement('img'); lineFlag.className = 'un-bg-cap-flagimg'; lineFlag.alt = ''; lineFlag.loading = 'lazy'
  var lineText = document.createElement('span')
  line.appendChild(lineFlag); line.appendChild(lineText)
  var thanks = document.createElement('div'); thanks.className = 'un-bg-cap-thanks'
  var credit = document.createElement('div'); credit.className = 'un-bg-cap-credit'
  cap.appendChild(line); cap.appendChild(thanks); cap.appendChild(credit)
  root.appendChild(a); root.appendChild(b); root.appendChild(veil); root.appendChild(top); root.appendChild(cap)
  var first = bgImages()[0]
  if (first !== undefined) a.style.backgroundImage = 'url("' + first.data + '")'
  a.style.opacity = '1'
  document.body.appendChild(root)
  BG.root = root
  BG.front = a
  BG.back = b
  BG.index = 0
  BG.disposeFns.push(function () {
    if (BG.timer !== null) { window.clearInterval(BG.timer); BG.timer = null }
    if (root.parentNode !== null) root.parentNode.removeChild(root)
    BG.root = null
    BG.front = null
    BG.back = null
  })

  // preload every frame so a dissolve never shows an empty layer
  for (var i = 1; i < bgImages().length; i++) {
    var preload = new window.Image()
    preload.src = bgImages()[i].data
  }

  function applyVeil() {
    var prefs = getPrefs()
    var alpha = Math.max(0.2, Math.min(0.92, Number(prefs.intensity) / 100))
    document.body.style.setProperty('--un-veil-alpha', String(alpha))
    document.body.style.setProperty('--un-veil-top', String(Math.max(0.15, alpha - 0.1)))
  }
  applyVeil()
  updateCaption()
  armRotation()

  BG.disposeFns.push(subscribePrefs(function () {
    applyVeil()
    armRotation()
    updateCaption()
    if (!getPrefs().background) {
      root.style.opacity = '0'
    } else {
      root.style.opacity = '1'
    }
  }))
  BG.disposeFns.push(subscribeLocale(function () {
    updateCaption()
  }))

  var onVisibility = function () {
    if (!document.hidden) armRotation()
  }
  document.addEventListener('visibilitychange', onVisibility)
  BG.disposeFns.push(function () { document.removeEventListener('visibilitychange', onVisibility) })

  return function () {
    BG.disposeFns.forEach(function (fn) { try { fn() } catch (error) { /* isolate */ } })
    BG.disposeFns = []
  }
}
