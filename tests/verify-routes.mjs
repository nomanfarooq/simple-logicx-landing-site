import { chromium } from 'playwright'

const BASE = process.env.URL || 'http://localhost:4173'
const ROUTES = [
  '/', '/services',
  // all seven detail pages
  '/services/saas', '/services/ai', '/services/mobile', '/services/web',
  '/services/cloud', '/services/iot', '/services/enterprise',
  '/work', '/work/northwind-logistics', '/work/meridian-health', '/work/atlas-payments', '/work/vantage-retail', '/work/halden-energy', '/about', '/process', '/pricing',
  '/contact', '/insights', '/insights/evaluating-rag-honestly',
  '/legal/privacy', '/legal/terms', '/this-route-does-not-exist',
]
const WIDTHS = [375, 768, 1440, 2560]

const browser = await chromium.launch()
let fails = 0
const errors = []

for (const theme of ['light', 'dark']) {
  const ctx = await browser.newContext({ colorScheme: theme, viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`[${theme}] ${m.text().slice(0, 160)}`) })
  page.on('pageerror', (e) => errors.push(`[${theme}] PAGEERROR ${e.message.slice(0, 160)}`))

  for (const route of ROUTES) {
    await page.goto(BASE + route, { waitUntil: 'networkidle' })
    await page.waitForTimeout(450)

    const meta = await page.evaluate(() => ({
      title: document.title,
      desc: document.querySelector('meta[name=description]')?.content ?? null,
      canonical: document.querySelector('link[rel=canonical]')?.href ?? null,
      h1s: [...document.querySelectorAll('h1')].map((h) => h.textContent.trim().slice(0, 40)),
      hasNav: !!document.querySelector('header nav'),
      hasFooter: !!document.querySelector('footer'),
      skip: document.querySelector('a[href="#main"]')?.textContent?.trim() ?? null,
      jsonLd: document.querySelectorAll('script[type="application/ld+json"]').length,
    }))

    const problems = []
    if (!meta.title || meta.title.length < 5) problems.push('no title')
    if (!meta.desc) problems.push('no description')
    if (!meta.canonical) problems.push('no canonical')
    if (meta.h1s.length !== 1) problems.push(`h1 count=${meta.h1s.length}`)
    if (!meta.hasNav) problems.push('no nav')
    if (!meta.hasFooter) problems.push('no footer')
    if (!meta.skip) problems.push('no skip link')

    // layout across widths
    for (const w of WIDTHS) {
      await page.setViewportSize({ width: w, height: 900 })
      await page.waitForTimeout(280)
      const r = await page.evaluate(() => {
        const vw = innerWidth
        const docW = document.documentElement.scrollWidth
        const cs = [...document.querySelectorAll('main [class*="max-w-"]')]
          .filter((el) => /max-w-(wide|default|article|narrow)/.test(el.className))
          .map((el) => {
            const b = el.getBoundingClientRect()
            return { l: b.left, r: vw - b.right }
          })
          .filter((c) => Math.abs(c.l - c.r) > 1)
        return { overflow: docW - vw, asym: cs.length }
      })
      if (r.overflow > 0) problems.push(`overflow ${r.overflow}px @${w}`)
      if (r.asym > 0) problems.push(`asym ${r.asym} @${w}`)
    }
    await page.setViewportSize({ width: 1440, height: 900 })

    if (problems.length) { fails++; console.log(`FAIL ${theme} ${route}\n     ${problems.join(', ')}`) }
    else console.log(`PASS ${theme} ${route.padEnd(34)} "${meta.title.slice(0, 46)}"${meta.jsonLd ? ' +ld' : ''}`)
  }
  await ctx.close()
}

// client-side navigation + focus management
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
await page.goto(BASE + '/', { waitUntil: 'networkidle' })
await page.click('a[href="/work"]')
await page.waitForTimeout(1600)
const nav = await page.evaluate(() => ({
  path: location.pathname,
  scrollY: window.scrollY,
  focused: document.activeElement?.id || document.activeElement?.tagName,
  title: document.title,
}))
console.log(`\nclient-side nav -> ${nav.path} | scrollY=${nav.scrollY} | focus=${nav.focused} | title="${nav.title.slice(0,40)}"`)
if (nav.path !== '/work') { fails++; console.log('FAIL: navigation did not change route') }
if (nav.focused !== 'route-focus') { fails++; console.log(`FAIL: focus went to ${nav.focused}, expected route-focus sentinel`) }

await ctx.close()
await browser.close()

if (errors.length) {
  console.log('\nCONSOLE ERRORS:')
  ;[...new Set(errors)].slice(0, 10).forEach((e) => console.log('  ' + e))
  fails += errors.length
}
console.log(fails === 0 ? '\nALL ROUTE CHECKS PASSED' : `\n${fails} PROBLEM(S)`)
process.exit(fails === 0 ? 0 : 1)
