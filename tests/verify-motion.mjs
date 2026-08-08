import { chromium } from 'playwright'

const BASE = process.env.URL || 'http://localhost:5199'
const browser = await chromium.launch()
let fail = 0
const ok = (c, m) => { if (c) console.log('PASS ' + m); else { fail++; console.log('FAIL ' + m) } }

// ---------------------------------------------------------------- normal motion
let ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
let page = await ctx.newPage()
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
await page.goto(BASE + '/', { waitUntil: 'networkidle' })
await page.waitForTimeout(900)

ok(await page.evaluate(() => document.documentElement.classList.contains('lenis')),
  'Lenis active (html.lenis present)')
ok(await page.evaluate(() => !!document.querySelector('link[rel=stylesheet],style') &&
  [...document.styleSheets].some((s) => { try { return [...s.cssRules].some(r => /html\.lenis/.test(r.cssText)) } catch { return false } })),
  'Lenis stylesheet loaded (html.lenis rule present)')

// smooth scroll actually interpolates: after a wheel tick, position should be
// mid-flight rather than instantly final
await page.mouse.move(700, 500)
await page.mouse.wheel(0, 800)
await page.waitForTimeout(60)
const mid = await page.evaluate(() => window.scrollY)
await page.waitForTimeout(1400)
const settled = await page.evaluate(() => window.scrollY)
ok(mid > 0 && mid < settled, `smooth scroll interpolates (mid=${Math.round(mid)} < settled=${Math.round(settled)})`)

// Lenis drives ScrollTrigger — the wiring v1 lacked. Functional proof: build a
// real trigger, scroll via the wheel (which only Lenis handles), and require
// that the trigger saw the movement. If the two clocks were separate, as in v1,
// onUpdate would never fire from a Lenis-driven scroll.
await page.evaluate(() => {
  window.scrollTo(0, 0)
  const { ScrollTrigger } = window.__SLX
  const probe = document.createElement('div')
  probe.style.cssText = 'position:absolute;top:600px;height:1200px;width:8px;pointer-events:none'
  document.body.appendChild(probe)
  window.__probe = { updates: [], last: 0 }
  window.__probeST = ScrollTrigger.create({
    trigger: probe, start: 'top bottom', end: 'bottom top',
    onUpdate: (self) => { window.__probe.updates.push(self.progress); window.__probe.last = self.progress },
  })
})
await page.waitForTimeout(200)
await page.mouse.move(700, 500)
await page.mouse.wheel(0, 700)
await page.waitForTimeout(1500)
const wired = await page.evaluate(() => {
  const r = { count: window.__probe.updates.length, last: window.__probe.last }
  window.__probeST.kill()
  return r
})
ok(wired.count > 5 && wired.last > 0,
  `ScrollTrigger driven by Lenis (${wired.count} updates, progress=${wired.last.toFixed(3)})`)

// ------------------------------------------------- ScrollTrigger leak across routes
const counts = []
for (let i = 0; i < 3; i++) {
  await page.click('a[href="/work"]'); await page.waitForTimeout(900)
  await page.click('a[href="/pricing"]'); await page.waitForTimeout(900)
  await page.goto(BASE + '/', { waitUntil: 'networkidle' }); await page.waitForTimeout(700)
  counts.push(await page.evaluate(() => window.__SLX?.ScrollTrigger.getAll().length ?? -1))
}
ok(counts.every((c) => c === counts[0]),
  `no ScrollTrigger leak across 3 nav cycles (counts: ${counts.join(', ')})`)

// ------------------------------------------------------------------- counter
await page.goto(BASE + '/', { waitUntil: 'networkidle' })
await page.waitForTimeout(2600)
const counterText = await page.evaluate(() =>
  [...document.querySelectorAll('dd')].map((d) => d.firstElementChild?.textContent?.trim()).filter(Boolean))
ok(counterText.includes('150+') && counterText.includes('98%'),
  `counters settle on authored values (${counterText.join(' ')})`)

// ------------------------------------------------------------------- marquee seam
const seam = await page.evaluate(() => {
  const track = [...document.querySelectorAll('.w-max')].find((t) => getComputedStyle(t).animationName === 'slx-marquee')
  if (!track) return null
  const [a, b] = track.children
  return { a: a.getBoundingClientRect().width, b: b.getBoundingClientRect().width, total: track.getBoundingClientRect().width }
})
ok(seam && Math.abs(seam.a - seam.b) < 1 && Math.abs(seam.total / 2 - seam.a) < 1,
  seam ? `marquee halves equal and exactly 50% (a=${seam.a.toFixed(1)} b=${seam.b.toFixed(1)} total/2=${(seam.total/2).toFixed(1)})` : 'marquee track not found')

// ---------------------------------------------------- reveals end visible
const revealOpacity = await page.evaluate(() => {
  window.scrollTo(0, document.body.scrollHeight)
  return new Promise((res) => setTimeout(() => {
    const els = [...document.querySelectorAll('main *')]
      .filter((e) => { const o = parseFloat(getComputedStyle(e).opacity); return o < 0.9 && e.getBoundingClientRect().height > 4 })
      .filter((e) => !e.closest('[aria-hidden="true"]'))
      .map((e) => e.className?.toString().slice(0, 50))
    res(els)
  }, 2200))
})
ok(revealOpacity.length === 0, `no visible content stranded below opacity 0.9 (${revealOpacity.length} found)`)
ok(errors.length === 0, `no console/page errors (${errors.slice(0,2).join(' | ') || 'none'})`)
await ctx.close()

// ---------------------------------------------------------- reduced motion
ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
page = await ctx.newPage()
await page.goto(BASE + '/', { waitUntil: 'networkidle' })
await page.waitForTimeout(900)

ok(!(await page.evaluate(() => document.documentElement.classList.contains('lenis'))),
  'reduced motion: Lenis NOT initialised')

const rmHidden = await page.evaluate(() => {
  window.scrollTo(0, document.body.scrollHeight)
  return new Promise((res) => setTimeout(() => {
    res([...document.querySelectorAll('main *')]
      .filter((e) => parseFloat(getComputedStyle(e).opacity) < 0.9 && e.getBoundingClientRect().height > 4)
      .filter((e) => !e.closest('[aria-hidden="true"]')).length)
  }, 900))
})
ok(rmHidden === 0, `reduced motion: all content visible immediately (${rmHidden} hidden)`)

const rmScroll = await page.evaluate(() => {
  const y0 = window.scrollY
  window.scrollTo(0, 0)
  return { y0, y1: window.scrollY }
})
ok(rmScroll.y1 === 0, 'reduced motion: native instant scroll works')
await ctx.close()

await browser.close()
console.log(fail === 0 ? '\nALL MOTION CHECKS PASSED' : `\n${fail} FAILED`)
process.exit(fail ? 1 : 0)
