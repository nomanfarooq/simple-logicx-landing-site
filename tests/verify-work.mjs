import { chromium } from 'playwright'

const BASE = process.env.URL || 'http://localhost:4173'
const SLUGS = [
  'northwind-logistics', 'meridian-health', 'atlas-payments',
  'vantage-retail', 'halden-energy',
]

const b = await chromium.launch()
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } })
const p = await ctx.newPage()
const errors = []
p.on('pageerror', (e) => errors.push(e.message))
p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })

let fail = 0
const ok = (c, m) => { if (c) console.log('PASS ' + m); else { fail++; console.log('FAIL ' + m) } }

// ---------------------------------------------------------- case study pages
for (const slug of SLUGS) {
  await p.goto(`${BASE}/work/${slug}`, { waitUntil: 'networkidle' })
  const h = await p.evaluate(() => document.body.scrollHeight)
  for (let y = 0; y < h; y += 800) { await p.evaluate((v) => window.scrollTo(0, v), y); await p.waitForTimeout(90) }
  await p.waitForTimeout(500)

  const r = await p.evaluate(() => {
    const txt = document.querySelector('main').innerText
    return {
      words: txt.trim().split(/\s+/).length,
      challenge: /the challenge/i.test(txt),
      approach: /what we did about it/i.test(txt),
      arch: /how it fits together/i.test(txt),
      results: /what changed/i.test(txt),
      nextCase: /next case study/i.test(txt),
      quote: !!document.querySelector('main blockquote'),
      figure: !!document.querySelector('main figure figcaption'),
      diagramStages: document.querySelectorAll('main figure ol > li').length,
      jsonLd: [...document.querySelectorAll('script[type="application/ld+json"]')]
        .map((s) => JSON.parse(s.textContent)['@type']),
      hidden: [...document.querySelectorAll('main *')]
        .filter((e) => parseFloat(getComputedStyle(e).opacity) < 0.9 && e.getBoundingClientRect().height > 4)
        .filter((e) => !e.closest('[aria-hidden="true"]')).length,
    }
  })

  const problems = []
  if (!r.challenge) problems.push('no challenge')
  if (!r.approach) problems.push('no approach')
  if (!r.arch) problems.push('no architecture')
  if (!r.results) problems.push('no results')
  if (!r.nextCase) problems.push('no next case')
  if (!r.quote) problems.push('no blockquote')
  if (!r.figure) problems.push('no figcaption')
  if (r.diagramStages !== 4) problems.push(`diagram stages=${r.diagramStages}`)
  if (!r.jsonLd.includes('Article')) problems.push('no Article schema')
  if (r.words < 520) problems.push(`thin (${r.words} words)`)
  if (r.hidden > 0) problems.push(`${r.hidden} stranded`)

  ok(problems.length === 0,
    `${slug.padEnd(21)} ${String(r.words).padStart(4)} words | ${r.diagramStages} stages | ld=[${r.jsonLd.join(',')}]` +
    (problems.length ? `\n       ${problems.join(', ')}` : ''))
}

// ------------------------------------------------------- next-case wrap-around
await p.goto(`${BASE}/work/${SLUGS.at(-1)}`, { waitUntil: 'networkidle' })
await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
await p.waitForTimeout(600)
const nextHref = await p.evaluate(() => {
  const links = [...document.querySelectorAll('main a[href^="/work/"]')]
  return links.at(-1)?.getAttribute('href')
})
ok(nextHref === `/work/${SLUGS[0]}`, `last study wraps to first (${nextHref})`)

// ------------------------------------------------------------------ filtering
await p.goto(`${BASE}/work`, { waitUntil: 'networkidle' })
await p.waitForTimeout(700)
const allCount = await p.locator('main ul > li').count()
ok(allCount === SLUGS.length, `index lists all ${SLUGS.length} studies (${allCount})`)

const filters = await p.locator('[role=group] button').count()
ok(filters > 3, `filter offers ${filters} options`)

// pick the Cloud filter (3 studies) and check the list shrinks
// Short wait on purpose: filtered results must render immediately, not fade
// in. Before the `disabled` fix the list sat blank for 1.2s here.
const cloudBtn = p.locator('[role=group] button', { hasText: 'Cloud' }).first()
await cloudBtn.click()
await p.waitForTimeout(250)
const cloudCount = await p.locator('main ul > li').count()
ok(cloudCount === 3, `Cloud filter narrows to 3 (${cloudCount})`)
ok((await cloudBtn.getAttribute('aria-pressed')) === 'true', 'active filter has aria-pressed=true')

// There are two polite live regions: RootLayout's route announcer and this
// page's result count. Check all of them rather than guessing an index.
const liveText = await p.evaluate(() =>
  [...document.querySelectorAll('[aria-live=polite]')].map((e) => e.textContent.trim()))
ok(liveText.some((t) => /3 case studies/.test(t)),
  `result count announced (${JSON.stringify(liveText)})`)

// filtered-in cards must be visible, not stranded at opacity 0
const strandedAfterFilter = await p.evaluate(() =>
  [...document.querySelectorAll('main ul > li')]
    .filter((e) => parseFloat(getComputedStyle(e.firstElementChild ?? e).opacity) < 0.9).length)
ok(strandedAfterFilter === 0, `no cards stranded after filtering (${strandedAfterFilter})`)

// back to all
await p.locator('[role=group] button', { hasText: 'All work' }).first().click()
await p.waitForTimeout(800)
ok((await p.locator('main ul > li').count()) === SLUGS.length, 'clearing the filter restores all studies')

ok(errors.length === 0, `no console/page errors (${errors.slice(0, 2).join(' | ') || 'none'})`)

await b.close()
console.log(fail === 0 ? '\nALL WORK CHECKS PASSED' : `\n${fail} FAILED`)
process.exit(fail ? 1 : 0)
