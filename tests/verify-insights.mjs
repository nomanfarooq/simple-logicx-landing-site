import { chromium } from 'playwright'

/**
 * Insights index and the three long-form articles.
 *
 * The interesting assertions here are the derived ones. `readingTime`, the
 * table of contents and the byline are all computed from the article body
 * rather than authored beside it, so each is checked against the thing it is
 * derived from — a contents list that omits a section, or a reading time that
 * no longer matches the body, is the failure this suite exists to catch.
 */

const BASE = process.env.URL || 'http://localhost:4173'
const b = await chromium.launch()
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage()
let fail = 0
const ok = (c, m) => { if (c) console.log('PASS ' + m); else { fail++; console.log('FAIL ' + m) } }
// innerText renders text-transform, and every eyebrow on the site is uppercase.
const has = (t, re) => new RegExp(re, 'i').test(t)

const SLUGS = ['unlayered-css-resets', 'evaluating-rag-honestly', 'migrations-without-downtime']
/** Matches the WPM constant in content/insights.js. */
const WPM = 200

const scrollThrough = async () => {
  const h = await p.evaluate(() => document.body.scrollHeight)
  for (let y = 0; y < h; y += 800) { await p.evaluate(v => window.scrollTo(0, v), y); await p.waitForTimeout(70) }
  await p.evaluate(() => window.scrollTo(0, 0))
  await p.waitForTimeout(350)
}

/* ──────────────────────────── /insights ─────────────────────────── */
{
  await p.goto(`${BASE}/insights`, { waitUntil: 'networkidle' })
  await scrollThrough()

  const cards = await p.locator('main ul > li a[href^="/insights/"]').count()
  ok(cards === SLUGS.length, `index     ${cards} article cards (expected ${SLUGS.length})`)

  const t = await p.evaluate(() => document.querySelector('main').innerText)
  ok(!/land in step \d|authored in step \d/i.test(t), 'index     no placeholder copy')
  // Reading time and byline are derived; both must reach the card.
  ok(/\d+ min read/.test(t), 'index     cards show a derived reading time')
  ok(has(t, 'Tom Okafor') || has(t, 'Nadia Haddad') || has(t, 'Elena Vasilenko'),
    'index     cards show the resolved author name')

  const filters = await p.locator('main button[aria-pressed]').count()
  ok(filters >= 3, `index     ${filters} topic filters exposed with aria-pressed`)

  /* Filtered results must appear at once. 250ms only — a longer wait would let
     the 1200ms Reveal failsafe mask the exact regression this catches. */
  await p.locator('main button[aria-pressed]').nth(1).click()
  await p.waitForTimeout(250)
  const afterFilter = await p.evaluate(() => {
    const items = [...document.querySelectorAll('main ul > li a[href^="/insights/"]')]
    return {
      count: items.length,
      invisible: items.filter(e => parseFloat(getComputedStyle(e.closest('li')).opacity) < 0.9).length,
    }
  })
  ok(afterFilter.count >= 1 && afterFilter.invisible === 0,
    `index     filtered results render immediately (${afterFilter.count} shown, ${afterFilter.invisible} still fading)`)

  const live = await p.locator('main [aria-live="polite"]').count()
  ok(live >= 1, 'index     result count announced in a live region')
}

/* ──────────────────────── /insights/:slug ───────────────────────── */
for (const slug of SLUGS) {
  await p.goto(`${BASE}/insights/${slug}`, { waitUntil: 'networkidle' })
  await scrollThrough()

  const r = await p.evaluate(() => {
    const main = document.querySelector('main')
    const toc = [...document.querySelectorAll('nav[aria-label="On this page"] a')]
    return {
      text: main.innerText,
      h1: main.querySelectorAll('h1').length,
      // Headings inside the body, excluding the contents rail's own heading.
      bodyHeadings: [...main.querySelectorAll('h2[id]')].map(h => h.id),
      tocTargets: toc.map(a => a.getAttribute('href').slice(1)),
      readingTime: (main.innerText.match(/(\d+) min read/) || [])[1],
      ld: [...document.querySelectorAll('script[type="application/ld+json"]')]
        .map(s => JSON.parse(s.textContent)),
      codeBlocks: main.querySelectorAll('pre code').length,
      // A code sample must never widen the document (§3.2).
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      stranded: [...main.querySelectorAll('*')]
        .filter(e => parseFloat(getComputedStyle(e).opacity) < 0.9 && e.getBoundingClientRect().height > 4)
        .filter(e => !e.closest('[aria-hidden="true"]')).length,
    }
  })

  const words = r.text.trim().split(/\s+/).length
  const article = r.ld.find(x => x['@type'] === 'Article')
  const problems = []

  if (/land in step \d|authored in step \d|lorem ipsum/i.test(r.text)) problems.push('placeholder copy still present')
  if (r.h1 !== 1) problems.push(`h1 count=${r.h1}`)
  if (words < 900) problems.push(`thin article (${words} words)`)
  if (r.bodyHeadings.length < 4) problems.push(`only ${r.bodyHeadings.length} sections`)

  // The contents list is generated from the body's h2 blocks. It must list
  // every one of them, in order, and every anchor must resolve.
  if (r.tocTargets.length !== r.bodyHeadings.length)
    problems.push(`toc lists ${r.tocTargets.length} of ${r.bodyHeadings.length} sections`)
  if (r.tocTargets.join('|') !== r.bodyHeadings.join('|'))
    problems.push('toc order does not match the body')
  const dangling = r.tocTargets.filter(id => !r.bodyHeadings.includes(id))
  if (dangling.length) problems.push(`dangling anchors: ${dangling.join(',')}`)

  if (!article) problems.push('no Article schema')
  if (!r.ld.some(x => x['@type'] === 'BreadcrumbList')) problems.push('no breadcrumb')
  if (article && !article.author?.name) problems.push('Article schema has no author')
  if (article && !article.wordCount) problems.push('Article schema has no wordCount')

  // readingTime is derived from the body at module load. Check the rendered
  // figure against the schema's own word count rather than against a literal.
  if (article && r.readingTime) {
    const expected = Math.max(1, Math.round(article.wordCount / WPM))
    if (Number(r.readingTime) !== expected)
      problems.push(`reading time ${r.readingTime} min but ${article.wordCount} words implies ${expected}`)
  } else if (!r.readingTime) problems.push('no reading time rendered')

  if (r.codeBlocks < 1) problems.push('no code samples')
  if (r.overflow !== 0) problems.push(`document overflows by ${r.overflow}px`)
  if (r.stranded > 0) problems.push(`${r.stranded} stranded elements`)
  if (!has(r.text, 'Read next')) problems.push('no onward navigation')

  ok(problems.length === 0,
    `${slug.padEnd(26)} ${String(words).padStart(4)} words | ${r.bodyHeadings.length} sections | ${r.readingTime} min` +
    (problems.length ? `\n       ${problems.join(', ')}` : ''))
}

/* Read-next must wrap, so the oldest article is not a dead end. */
{
  const seen = new Set()
  let slug = SLUGS[0]
  for (let i = 0; i < SLUGS.length; i++) {
    await p.goto(`${BASE}/insights/${slug}`, { waitUntil: 'networkidle' })
    seen.add(slug)
    slug = await p.evaluate(() => {
      const links = [...document.querySelectorAll('main a[href^="/insights/"]')]
      const next = links[links.length - 1]
      return next?.getAttribute('href').replace('/insights/', '')
    })
  }
  ok(seen.size === SLUGS.length && SLUGS.includes(slug),
    `articles  read-next wraps through all ${seen.size} articles and back`)
}

/* Contents links must scroll rather than jump — Lenis holds its own target
   position and a native hash jump gets animated straight back. */
{
  await p.goto(`${BASE}/insights/${SLUGS[0]}`, { waitUntil: 'networkidle' })
  await p.waitForTimeout(400)
  const before = await p.evaluate(() => window.scrollY)
  await p.locator('nav[aria-label="On this page"] a').last().click()
  await p.waitForTimeout(1600)
  const after = await p.evaluate(() => window.scrollY)
  ok(after > before + 200, `articles  contents link scrolls the page (${Math.round(before)} → ${Math.round(after)})`)
}

await b.close()
console.log(fail === 0 ? '\nALL INSIGHTS CHECKS PASSED' : `\n${fail} FAILED`)
process.exit(fail ? 1 : 0)
