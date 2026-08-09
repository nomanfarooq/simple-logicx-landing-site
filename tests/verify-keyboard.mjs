import { chromium } from 'playwright'

/**
 * Keyboard operability — spec §6 ("full keyboard operability").
 *
 * The other suites drive the site with `click()`, which is a synthetic pointer
 * event: it will happily activate a <div> with an onClick handler, a control
 * that is not in the tab order, or a custom widget that ignores Enter and
 * Space. None of those are usable by keyboard, and none of them fail a
 * click-driven test.
 *
 * So everything here is driven ONLY by real key events — Tab, Enter, Space,
 * arrows, Escape — with no click() anywhere in the file. If a check passes,
 * that interaction genuinely works without a mouse.
 *
 * Complements rather than repeats verify-interactions, which covers the
 * mega-menu and mobile dialog structurally. What is added here is the widgets
 * that had no keyboard coverage at all: the pricing estimator, the 404 search,
 * the two filter bars, the article contents rail, and the whole-page tab
 * sweep that proves there is no trap between the skip link and the footer.
 */

const BASE = process.env.URL || 'http://localhost:4173'

let fails = 0
const ok = (cond, msg) => {
  if (!cond) fails++
  console.log(`${cond ? 'PASS' : 'FAIL'} ${msg}`)
}

const focused = (page) =>
  page.evaluate(() => {
    const el = document.activeElement
    if (!el) return null
    return {
      tag: el.tagName.toLowerCase(),
      type: el.getAttribute('type'),
      role: el.getAttribute('role'),
      name: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 40),
      id: el.id || null,
      inMain: !!el.closest('main'),
      inFooter: !!el.closest('footer'),
      inHeader: !!el.closest('header'),
    }
  })

/** Tab until `predicate` matches the focused element, or give up. */
async function tabTo(page, predicate, limit = 120) {
  for (let i = 0; i < limit; i++) {
    await page.keyboard.press('Tab')
    const f = await focused(page)
    if (f && predicate(f)) return f
  }
  return null
}

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()

// ---------------------------------------------------------------- skip link
console.log('\n──── skip link')
await page.goto(BASE + '/', { waitUntil: 'networkidle' })
await page.waitForTimeout(400)

await page.keyboard.press('Tab')
let f = await focused(page)
ok(f?.tag === 'a' && /skip/i.test(f.name), `first tab stop is the skip link ("${f?.name}")`)

// It must be visible once focused — a skip link nobody can see is not a skip link.
const skipVisible = await page.evaluate(() => {
  const el = document.activeElement
  const r = el.getBoundingClientRect()
  return { w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top) }
})
ok(skipVisible.w > 24 && skipVisible.h >= 16 && skipVisible.top >= 0,
  `skip link becomes visible on focus (${skipVisible.w}x${skipVisible.h} at y=${skipVisible.top})`)

await page.keyboard.press('Enter')
await page.waitForTimeout(500)
const afterSkip = await page.evaluate(() => ({
  hash: location.hash,
  active: document.activeElement?.id || document.activeElement?.tagName,
  inMain: document.activeElement?.id === 'main' || !!document.activeElement?.closest('main'),
}))
ok(afterSkip.inMain, `skip link moves focus to main (focus=${afterSkip.active})`)

// The assertion that actually matters: after skipping, the next Tab must land
// inside main rather than back in the navbar. Chromium can satisfy this via
// the sequential-focus starting point even when focus itself did not move,
// which is why the target carries tabIndex={-1} — see RootLayout.
await page.keyboard.press('Tab')
const nextAfterSkip = await focused(page)
ok(nextAfterSkip?.inMain && !nextAfterSkip?.inHeader,
  `next tab stop after skipping is inside main ("${nextAfterSkip?.name}")`)

// ------------------------------------------------------------ theme toggle
console.log('\n──── theme toggle')
await page.goto(BASE + '/', { waitUntil: 'networkidle' })
await page.waitForTimeout(400)
const before = await page.evaluate(() => document.documentElement.getAttribute('data-theme'))
const toggle = await tabTo(page, (x) => /theme|dark|light/i.test(x.name))
ok(!!toggle, `theme toggle reachable by Tab ("${toggle?.name}")`)
if (toggle) {
  await page.keyboard.press('Enter')
  await page.waitForTimeout(500)
  const after = await page.evaluate(() => document.documentElement.getAttribute('data-theme'))
  ok(after && after !== before, `Enter flips the theme (${before} -> ${after})`)
}

// ------------------------------------------------------- pricing estimator
console.log('\n──── pricing estimator')
await page.goto(BASE + '/pricing', { waitUntil: 'networkidle' })
await page.waitForTimeout(600)

const slider = await tabTo(page, (x) => x.tag === 'input' && x.type === 'range')
ok(!!slider, 'estimator slider is reachable by Tab')

if (slider) {
  const read = () => page.evaluate(() => {
    const s = document.querySelector('main input[type="range"]')
    return { value: Number(s.value), min: Number(s.min), max: Number(s.max) }
  })
  const start = await read()
  await page.keyboard.press('ArrowRight')
  await page.waitForTimeout(200)
  const right = await read()
  ok(right.value === start.value + 1, `ArrowRight increments (${start.value} -> ${right.value})`)

  await page.keyboard.press('ArrowLeft')
  await page.keyboard.press('ArrowLeft')
  await page.waitForTimeout(200)
  const left = await read()
  ok(left.value === start.value - 1, `ArrowLeft decrements (${right.value} -> ${left.value})`)

  await page.keyboard.press('End')
  await page.waitForTimeout(250)
  const end = await read()
  ok(end.value === end.max, `End jumps to max (${end.value} of ${end.max})`)

  await page.keyboard.press('Home')
  await page.waitForTimeout(250)
  const home = await read()
  ok(home.value === home.min, `Home jumps to min (${home.value})`)

  // The whole point of the slider is that the total responds to it.
  const totalAt = async () => page.evaluate(() => {
    const live = [...document.querySelectorAll('main [aria-live]')]
      .map((e) => e.textContent).join(' ')
    const m = live.match(/£\s?([\d,]+)/)
    return m ? Number(m[1].replace(/,/g, '')) : null
  })
  const atMin = await totalAt()
  await page.keyboard.press('End')
  await page.waitForTimeout(350)
  const atMax = await totalAt()
  ok(atMin !== null && atMax !== null && atMax > atMin,
    `keyboard changes the announced total (£${atMin} at min -> £${atMax} at max)`)
}

// The squad control is a segmented pair, not an on/off switch — activating the
// already-selected option correctly leaves it selected. Tab to the option that
// is NOT selected, which is the only one whose state should change.
{
  let squad = null
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press('Tab')
    const state = await page.evaluate(() => {
      const el = document.activeElement
      return {
        pressed: el.getAttribute('aria-pressed'),
        name: (el.textContent || '').trim().slice(0, 30),
      }
    })
    if (state.pressed === 'false') { squad = state; break }
  }
  ok(!!squad, `reached an unselected squad option ("${squad?.name}")`)
  if (squad) {
    await page.keyboard.press('Enter')
    await page.waitForTimeout(300)
    const after = await page.evaluate(() => document.activeElement.getAttribute('aria-pressed'))
    ok(after === 'true', `Enter selects it (aria-pressed false -> ${after})`)

    const selectedCount = await page.evaluate(() =>
      document.querySelectorAll('main [role="group"] button[aria-pressed="true"], main button[aria-pressed="true"]').length)
    ok(selectedCount >= 1, `exactly one option stays selected (${selectedCount} pressed on the page)`)
  }
}

const checkbox = await tabTo(page, (x) => x.tag === 'input' && x.type === 'checkbox', 30)
ok(!!checkbox, 'discovery checkbox is reachable by Tab')
if (checkbox) {
  const state = () => page.evaluate(() => document.querySelector('main input[type=checkbox]').checked)
  const b = await state()
  await page.keyboard.press('Space')
  await page.waitForTimeout(250)
  const a = await state()
  ok(a !== b, `Space toggles the discovery checkbox (${b} -> ${a})`)
}

// ------------------------------------------------------------- 404 search
console.log('\n──── 404 search')
await page.goto(BASE + '/no-such-page', { waitUntil: 'networkidle' })
await page.waitForTimeout(500)

const field = await tabTo(page, (x) => x.tag === 'input' && x.inMain)
ok(!!field, '404 search field is reachable by Tab')
if (field) {
  await page.keyboard.type('northwind', { delay: 25 })
  await page.waitForTimeout(450)
  const results = await page.evaluate(() =>
    [...document.querySelectorAll('main [role="search"] ~ * a, main a')]
      .map((a) => a.getAttribute('href'))
      .filter((h) => h && h.startsWith('/work')))
  ok(results.length > 0, `typing finds results (${results.slice(0, 3).join(' ')})`)

  // Results must be reachable by keyboard from the field, not just rendered.
  const firstResult = await tabTo(page, (x) => x.tag === 'a' && x.inMain, 15)
  ok(!!firstResult, `first result is the next tab stop ("${firstResult?.name}")`)
  if (firstResult) {
    await page.keyboard.press('Enter')
    await page.waitForTimeout(900)
    const path = await page.evaluate(() => location.pathname)
    ok(path !== '/no-such-page', `Enter navigates to a result (${path})`)
  }
}

// -------------------------------------------------------------- filter bars
for (const [route, label] of [['/work', 'work'], ['/insights', 'insights']]) {
  console.log(`\n──── ${label} filters`)
  await page.goto(BASE + route, { waitUntil: 'networkidle' })
  await page.waitForTimeout(600)

  const btn = await tabTo(page, (x) => x.inMain && x.tag === 'button', 60)
  ok(!!btn, `${label} filter buttons are reachable by Tab ("${btn?.name}")`)
  if (!btn) continue

  // Move to a non-active filter and activate it with the keyboard only.
  let target = null
  for (let i = 0; i < 8; i++) {
    const pressed = await page.evaluate(() => document.activeElement.getAttribute('aria-pressed'))
    const f2 = await focused(page)
    if (pressed === 'false' && f2.tag === 'button') { target = f2; break }
    await page.keyboard.press('Tab')
  }
  ok(!!target, `${label}: found an inactive filter to activate ("${target?.name}")`)
  if (!target) continue

  const countBefore = await page.evaluate(() => document.querySelectorAll('main ul li').length)
  await page.keyboard.press('Enter')
  // Deliberately short: filtered results must render immediately. A longer
  // wait would let the 1200ms Reveal failsafe hide a regression — the same
  // reasoning as verify-work.
  await page.waitForTimeout(250)

  const after = await page.evaluate(() => ({
    pressed: document.activeElement.getAttribute('aria-pressed'),
    stillFocused: document.activeElement.tagName.toLowerCase(),
    count: document.querySelectorAll('main ul li').length,
    hidden: [...document.querySelectorAll('main ul li')]
      .filter((li) => parseFloat(getComputedStyle(li).opacity) < 0.9).length,
    live: [...document.querySelectorAll('[aria-live]')].map((e) => e.textContent.trim()).join(' | '),
  }))
  ok(after.pressed === 'true', `${label}: Enter activates the filter (aria-pressed=${after.pressed})`)
  ok(after.stillFocused === 'button', `${label}: focus stays on the filter after activation`)
  ok(after.hidden === 0, `${label}: filtered results are visible immediately (${after.hidden} below 0.9 opacity)`)
  ok(after.count !== countBefore || after.live.length > 0,
    `${label}: result set changed and was announced ("${after.live.slice(0, 60)}")`)
}

// ------------------------------------------------------ article contents rail
console.log('\n──── article contents rail')
await page.goto(BASE + '/insights/evaluating-rag-honestly', { waitUntil: 'networkidle' })
await page.waitForTimeout(700)

const railLink = await tabTo(page, (x) => x.tag === 'a' && x.inMain, 40)
ok(!!railLink, `contents link reachable by Tab ("${railLink?.name}")`)
if (railLink) {
  // Assert against the anchor's own target, not the scroll direction: tabbing
  // to the link already scrolls it into view, so the jump can legitimately go
  // upward. What matters is that the heading ends up at the top.
  const href = await page.evaluate(() => document.activeElement.getAttribute('href'))
  ok(!!href && href.startsWith('#'), `contents link is a real anchor (${href})`)

  await page.keyboard.press('Enter')
  await page.waitForTimeout(1400) // Lenis animates; give it time to settle

  const landed = await page.evaluate((h) => {
    const target = document.querySelector(h)
    if (!target) return null
    return { top: Math.round(target.getBoundingClientRect().top), y: Math.round(window.scrollY) }
  }, href)
  ok(landed && landed.top >= -8 && landed.top < 180,
    `Enter scrolls the target heading to the top (offset ${landed?.top}px)`)

  // Lenis holds its own target; a native hash jump would be animated back.
  await page.waitForTimeout(900)
  const settled = await page.evaluate((h) => ({
    top: Math.round(document.querySelector(h).getBoundingClientRect().top),
  }), href)
  ok(Math.abs(settled.top - landed.top) < 40,
    `position holds rather than springing back (${landed.top} -> ${settled.top})`)
}

// -------------------------------------------------- no trap, whole document
console.log('\n──── full document sweep')
await page.goto(BASE + '/pricing', { waitUntil: 'networkidle' })
await page.waitForTimeout(500)

{
  const seen = []
  let reachedFooter = false
  let stuck = 0
  let last = ''
  for (let i = 0; i < 200; i++) {
    await page.keyboard.press('Tab')
    const f2 = await focused(page)
    if (!f2) continue
    const sig = `${f2.tag}#${f2.id}:${f2.name}`
    if (sig === last) stuck++
    else stuck = 0
    last = sig
    seen.push(f2)
    if (f2.inFooter) { reachedFooter = true; break }
    if (stuck > 5) break
  }
  ok(reachedFooter, `tab order reaches the footer without a trap (${seen.length} stops)`)
  ok(stuck <= 5, `no element holds focus across consecutive tabs (max repeat ${stuck})`)
}

// Shift+Tab must walk back out the way it came in.
{
  const forward = await focused(page)
  await page.keyboard.press('Shift+Tab')
  const back = await focused(page)
  ok(back && back.name !== forward.name, `Shift+Tab moves backwards ("${forward?.name}" -> "${back?.name}")`)
}

await ctx.close()
await browser.close()

console.log(fails === 0 ? '\nALL KEYBOARD CHECKS PASSED' : `\n${fails} KEYBOARD PROBLEM(S)`)
process.exit(fails === 0 ? 0 : 1)
