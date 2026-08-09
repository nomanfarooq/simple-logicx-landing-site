import { chromium } from 'playwright'

/**
 * prefers-reduced-motion across every route — spec §5.4, §10 (Motion).
 *
 * verify-motion already proves the reduced-motion contract on the home page
 * against the dev server (Lenis not initialised, nothing stranded, native
 * scroll works). What it cannot cover is the other 24 routes, and reduced
 * motion is exactly the setting where a single page that forgot its guard
 * stays permanently blank: the entry animation never runs, so the content
 * never becomes visible, and nothing else on the page reveals the problem.
 *
 * The failure mode is silent and total, so this sweeps all of them.
 *
 * Runs against the production build, which is the second reason it is separate
 * — the dev-only `window.__SLX` handle verify-motion uses does not exist here,
 * so every assertion below is made against rendered output instead.
 */

const BASE = process.env.URL || 'http://localhost:4173'

const ROUTES = [
  '/', '/services', '/services/saas', '/services/ai', '/services/mobile',
  '/services/web', '/services/cloud', '/services/iot', '/services/enterprise',
  '/work', '/work/northwind-logistics', '/work/meridian-health',
  '/work/atlas-payments', '/work/vantage-retail', '/work/halden-energy',
  '/about', '/process', '/pricing', '/contact', '/insights',
  '/insights/evaluating-rag-honestly', '/insights/unlayered-css-resets',
  '/legal/privacy', '/legal/terms', '/this-route-does-not-exist',
]

const browser = await chromium.launch()
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  reducedMotion: 'reduce',
})
const page = await ctx.newPage()

const errors = []
page.on('pageerror', (e) => errors.push(e.message.slice(0, 140)))
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 140)) })

let fails = 0

for (const route of ROUTES) {
  await page.goto(BASE + route, { waitUntil: 'networkidle' })
  await page.waitForTimeout(350)

  const problems = []

  // 1. Content must be visible WITHOUT scrolling anywhere. Under reduced
  //    motion there is no reveal-on-scroll, so anything below 0.9 opacity is
  //    content that will never appear.
  const stranded = await page.evaluate(() => {
    const out = []
    for (const el of document.querySelectorAll('main *')) {
      if (el.closest('[aria-hidden="true"]')) continue
      const cs = getComputedStyle(el)
      if (cs.display === 'none' || cs.visibility === 'hidden') continue
      const r = el.getBoundingClientRect()
      if (r.height < 5 || r.width < 5) continue
      if (!el.textContent.trim()) continue
      const o = parseFloat(cs.opacity)
      if (o < 0.9) {
        out.push(`${el.tagName.toLowerCase()} opacity=${o.toFixed(2)} "${el.textContent.trim().slice(0, 30)}"`)
      }
    }
    return out
  })
  if (stranded.length) problems.push(`${stranded.length} stranded: ${stranded[0]}`)

  // 2. Nothing may be left displaced by a transform that was never animated
  //    back. A reveal that translates in and does not run leaves content
  //    sitting 40px off, or off-screen entirely.
  const displaced = await page.evaluate(() => {
    const out = []
    for (const el of document.querySelectorAll('main *')) {
      if (el.closest('[aria-hidden="true"]')) continue
      const cs = getComputedStyle(el)
      if (cs.transform === 'none') continue
      const m = new DOMMatrixReadOnly(cs.transform)
      // Ignore deliberate static transforms that are part of the layout
      // (centring translates on decoration), which are large and paired with
      // absolute positioning.
      if (cs.position === 'absolute' || cs.position === 'fixed') continue
      if (Math.abs(m.m41) > 4 || Math.abs(m.m42) > 4) {
        out.push(`${el.tagName.toLowerCase()} translate(${m.m41.toFixed(0)},${m.m42.toFixed(0)}) "${el.textContent.trim().slice(0, 24)}"`)
      }
      if (Math.abs(m.a - 1) > 0.02 || Math.abs(m.d - 1) > 0.02) {
        out.push(`${el.tagName.toLowerCase()} scale(${m.a.toFixed(2)},${m.d.toFixed(2)})`)
      }
    }
    return out
  })
  if (displaced.length) problems.push(`${displaced.length} displaced: ${displaced[0]}`)

  // 3. Lenis must not take over scrolling — §5.4 hands scroll back to the
  //    browser entirely under reduced motion.
  const lenis = await page.evaluate(() => ({
    htmlClass: document.documentElement.classList.contains('lenis'),
    smooth: getComputedStyle(document.documentElement).scrollBehavior,
  }))
  if (lenis.htmlClass) problems.push('Lenis initialised under reduced motion')
  if (lenis.smooth === 'smooth') problems.push(`scroll-behavior: ${lenis.smooth}`)

  // 4. Scrolling must actually work and be instant.
  const scroll = await page.evaluate(() => {
    const target = Math.min(700, document.body.scrollHeight - window.innerHeight)
    if (target <= 0) return { skipped: true }
    window.scrollTo(0, target)
    return { immediate: window.scrollY, target }
  })
  if (!scroll.skipped && Math.abs(scroll.immediate - scroll.target) > 2) {
    problems.push(`scroll not instant (asked ${scroll.target}, got ${scroll.immediate})`)
  }

  // 5. After scrolling, still nothing hidden — catches a component that
  //    guards its entry animation but not its scrub.
  await page.waitForTimeout(250)
  const afterScroll = await page.evaluate(() =>
    [...document.querySelectorAll('main *')]
      .filter((el) => !el.closest('[aria-hidden="true"]'))
      .filter((el) => el.textContent.trim() && el.getBoundingClientRect().height > 5)
      .filter((el) => parseFloat(getComputedStyle(el).opacity) < 0.9).length)
  if (afterScroll > 0) problems.push(`${afterScroll} hidden after scroll`)

  await page.evaluate(() => window.scrollTo(0, 0))

  if (problems.length) {
    fails++
    console.log(`FAIL ${route}`)
    problems.forEach((p) => console.log(`     ${p}`))
  } else {
    console.log(`PASS ${route}`)
  }
}

// Animations that are declared must be neutered, not merely fast.
await page.goto(BASE + '/', { waitUntil: 'networkidle' })
const running = await page.evaluate(() =>
  document.getAnimations()
    .filter((a) => a.playState === 'running')
    .map((a) => {
      const t = a.effect?.getTiming?.()
      return { dur: t?.duration, iter: t?.iterations }
    })
    .filter((a) => typeof a.dur === 'number' && a.dur > 100))
if (running.length) {
  fails++
  console.log(`\nFAIL ${running.length} animation(s) still running longer than 100ms under reduced motion`)
  console.log(`     e.g. duration=${running[0].dur}ms iterations=${running[0].iter}`)
} else {
  console.log('\nPASS no animation runs longer than 100ms under reduced motion')
}

await ctx.close()
await browser.close()

if (errors.length) {
  console.log('\nCONSOLE/PAGE ERRORS:')
  ;[...new Set(errors)].slice(0, 8).forEach((e) => console.log('  ' + e))
  fails += errors.length
}

console.log(fails === 0
  ? `\nREDUCED MOTION HONOURED ON ALL ${ROUTES.length} ROUTES`
  : `\n${fails} REDUCED-MOTION PROBLEM(S)`)
process.exit(fails === 0 ? 0 : 1)
