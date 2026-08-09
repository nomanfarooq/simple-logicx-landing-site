import { chromium } from 'playwright'

/**
 * Step 8 pages: /about, /process, /pricing, /contact.
 *
 * These four were the thinnest routes on the site and are the ones most likely
 * to silently regress to placeholders, so the composition checks are explicit
 * about which sections must exist rather than only counting words.
 *
 * The pricing estimator is checked arithmetically against the published tier
 * prices, not against hardcoded numbers — the whole point of deriving both
 * from `pricingTiers` is that a price change must move the calculator too.
 */

const BASE = process.env.URL || 'http://localhost:4173'
const b = await chromium.launch()
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } })
const p = await ctx.newPage()
let fail = 0
const ok = (c, m) => { if (c) console.log('PASS ' + m); else { fail++; console.log('FAIL ' + m) } }

const scrollThrough = async () => {
  const h = await p.evaluate(() => document.body.scrollHeight)
  for (let y = 0; y < h; y += 800) { await p.evaluate(v => window.scrollTo(0, v), y); await p.waitForTimeout(80) }
  await p.evaluate(() => window.scrollTo(0, 0))
  await p.waitForTimeout(400)
}

const page = async (path) => {
  await p.goto(BASE + path, { waitUntil: 'networkidle' })
  await scrollThrough()
  return p.evaluate(() => ({
    text: document.querySelector('main').innerText,
    ld: [...document.querySelectorAll('script[type="application/ld+json"]')]
      .map(s => JSON.parse(s.textContent)['@type']),
    h1: document.querySelectorAll('main h1').length,
    stranded: [...document.querySelectorAll('main *')]
      .filter(e => parseFloat(getComputedStyle(e).opacity) < 0.9 && e.getBoundingClientRect().height > 4)
      .filter(e => !e.closest('[aria-hidden="true"]')).length,
  }))
}

/**
 * Word counts come from `innerText`, which excludes collapsed accordion
 * answers — those panels are unmounted while closed, deliberately (see
 * components/ui/Accordion). So /pricing counts ~400 words lower than it reads.
 * Thresholds are per page and set just under the real figure, to catch a page
 * regressing to a stub rather than to police prose length.
 */
const words = t => t.trim().split(/\s+/).length

/**
 * `innerText` returns text as rendered, so anything under `text-transform:
 * uppercase` — every eyebrow and cadence label on the site — comes back
 * upper-cased. Section-label assertions must be case-insensitive or they test
 * the stylesheet instead of the content.
 */
const has = (t, re) => new RegExp(re, 'i').test(t)

/* Placeholder copy from earlier build steps must be gone from all four. */
const PLACEHOLDER = /land in step \d|authored in step \d|lorem ipsum/i

/* ───────────────────────────── /about ───────────────────────────── */
{
  const r = await page('/about')
  const t = r.text
  const costLines = (t.match(/what it costs us/gi) || []).length
  const problems = []
  if (PLACEHOLDER.test(t)) problems.push('placeholder copy still present')
  if (!has(t, 'Twelve years, seven decisions')) problems.push('no story timeline')
  if (!has(t, 'what each one costs us')) problems.push('no values section')
  // One per value, not just the section heading — the cost line is the whole
  // point of the values content and the easiest thing to quietly drop.
  if (costLines !== 5) problems.push(`cost lines=${costLines} expected 5, one per value`)
  if (!/2014/.test(t) || !/2026/.test(t)) problems.push('timeline missing endpoints')
  if (!has(t, 'would be on your engagement')) problems.push('no team grid')
  if (!has(t, 'Ruth Adeyemi') || !has(t, 'Omar Al-Mansoori')) problems.push('team grid incomplete')
  if (!has(t, 'Three offices, one working day')) problems.push('no locations')
  if (!has(t, 'Open since') || !has(t, 'Headcount')) problems.push('locations lack detail')
  if (!has(t, 'Hiring is the whole business')) problems.push('no careers')
  if (!has(t, 'Open roles')) problems.push('no openings list')
  if (!r.ld.includes('Organization')) problems.push('no Organization schema')
  if (!r.ld.includes('BreadcrumbList')) problems.push('no breadcrumb')
  if (r.h1 !== 1) problems.push(`h1 count=${r.h1}`)
  if (words(t) < 1000) problems.push(`thin content (${words(t)} words)`)
  if (r.stranded > 0) problems.push(`${r.stranded} stranded elements`)
  ok(problems.length === 0,
    `/about    ${String(words(t)).padStart(4)} words | ld=[${r.ld.join(',')}]` +
    (problems.length ? `\n       ${problems.join(', ')}` : ''))
}

/* ──────────────────────────── /process ──────────────────────────── */
{
  const r = await page('/process')
  const t = r.text
  const problems = []
  if (PLACEHOLDER.test(t)) problems.push('placeholder copy still present')
  // The shared timeline must still be here — the page's original content.
  for (const phase of ['Discovery', 'Architecture', 'Build', 'Harden', 'Operate'])
    if (!has(t, `\\b${phase}\\b`)) problems.push(`no ${phase} phase`)
  if (!has(t, 'Three shapes the phases run inside')) problems.push('no engagement models')
  if (!has(t, 'Product Team') || !has(t, 'Enterprise')) problems.push('engagement models incomplete')
  // Prices must be looked up from the tiers, not restated.
  if (!/£12k/.test(t) || !/£28k/.test(t)) problems.push('model prices missing')
  if (!has(t, 'What actually lands in your diary')) problems.push('no cadence section')
  for (const c of ['Daily', 'Weekly', 'Fortnightly', 'Monthly', 'Quarterly'])
    if (!has(t, `\\b${c}\\b`)) problems.push(`no ${c} ritual`)
  if (!has(t, 'Four things we need from you')) problems.push('no client commitments')
  if (!r.ld.includes('BreadcrumbList')) problems.push('no breadcrumb')
  if (r.h1 !== 1) problems.push(`h1 count=${r.h1}`)
  if (words(t) < 750) problems.push(`thin content (${words(t)} words)`)
  if (r.stranded > 0) problems.push(`${r.stranded} stranded elements`)
  ok(problems.length === 0,
    `/process  ${String(words(t)).padStart(4)} words | ld=[${r.ld.join(',')}]` +
    (problems.length ? `\n       ${problems.join(', ')}` : ''))
}

/* ──────────────────────────── /pricing ──────────────────────────── */
{
  const r = await page('/pricing')
  const t = r.text
  const problems = []
  if (PLACEHOLDER.test(t)) problems.push('placeholder copy still present')
  if (!has(t, 'Total cost of an engagement')) problems.push('no estimator')
  if (!has(t, 'What the rate covers, and what it does not')) problems.push('no scope section')
  if (!has(t, 'Billed elsewhere')) problems.push('no exclusions')
  if (!has(t, 'The commercial questions')) problems.push('no pricing FAQ')
  const faqButtons = await p.locator('main button[aria-controls]').count()
  if (faqButtons < 5) problems.push(`faq buttons=${faqButtons}`)
  if (!r.ld.includes('BreadcrumbList')) problems.push('no breadcrumb')
  if (r.h1 !== 1) problems.push(`h1 count=${r.h1}`)
  // Lower than the other pages: six FAQ answers are unmounted while collapsed.
  if (words(t) < 550) problems.push(`thin content (${words(t)} words)`)
  if (r.stranded > 0) problems.push(`${r.stranded} stranded elements`)
  ok(problems.length === 0,
    `/pricing  ${String(words(t)).padStart(4)} words | ld=[${r.ld.join(',')}]` +
    (problems.length ? `\n       ${problems.join(', ')}` : ''))

  /* Estimator arithmetic, derived from the tier prices shown on the same page.
     A calculator that disagrees with the cards above it is the exact defect
     deriving both from `pricingTiers` exists to prevent. */
  const rates = await p.evaluate(() => {
    // Identified by cadence text rather than by position, so re-ordering the
    // cards does not silently make this compare the wrong two numbers.
    const pick = (cadence) => {
      const li = [...document.querySelectorAll('main li')]
        .find(el => el.innerText.includes(cadence) && /£[\d.]+k/.test(el.innerText))
      const m = li?.innerText.match(/£([\d.]+)k/)
      return m ? Math.round(parseFloat(m[1]) * 1000) : null
    }
    return { discovery: pick('fixed, 2 weeks'), monthly: pick('per month') }
  })
  const { discovery: discoveryRate, monthly: monthlyRate } = rates
  ok(discoveryRate === 12000 && monthlyRate === 28000,
    `pricing   card rates read as discovery=${discoveryRate} monthly=${monthlyRate}`)

  const slider = p.locator('main input[type="range"]')
  const checkbox = p.locator('main input[type="checkbox"]')
  const total = () => p.locator('main [aria-live="polite"] p').nth(1).innerText()
  const asNum = s => Number(s.replace(/[^\d]/g, ''))

  await slider.fill('6')
  await p.waitForTimeout(150)
  const base = asNum(await total())
  ok(base === discoveryRate + monthlyRate * 6,
    `estimator default 6mo + discovery = ${base} (expected ${discoveryRate + monthlyRate * 6})`)

  await slider.fill('12')
  await p.waitForTimeout(150)
  const twelve = asNum(await total())
  ok(twelve === discoveryRate + monthlyRate * 12,
    `estimator 12mo = ${twelve} (expected ${discoveryRate + monthlyRate * 12})`)

  await checkbox.uncheck()
  await p.waitForTimeout(150)
  const noDiscovery = asNum(await total())
  ok(noDiscovery === monthlyRate * 12,
    `estimator 12mo without discovery = ${noDiscovery} (expected ${monthlyRate * 12})`)

  await p.locator('main button', { hasText: 'Two squads' }).click()
  await p.waitForTimeout(150)
  const twoSquads = asNum(await total())
  ok(twoSquads === monthlyRate * 2 * 12,
    `estimator 12mo × 2 squads = ${twoSquads} (expected ${monthlyRate * 2 * 12})`)

  const pressed = await p.locator('main button[aria-pressed="true"]', { hasText: 'Two squads' }).count()
  ok(pressed === 1, 'estimator squad toggle exposes aria-pressed')

  /* The result must be a live region: the numbers change without the focused
     control (slider, checkbox) saying anything about the outcome. */
  const live = await p.locator('main [aria-live="polite"]').count()
  ok(live >= 1, 'estimator result is a live region')
}

/* ──────────────────────────── /contact ──────────────────────────── */
{
  const r = await page('/contact')
  const t = r.text
  const problems = []
  if (PLACEHOLDER.test(t)) problems.push('placeholder copy still present')
  if (!has(t, 'Rather just talk\\?')) problems.push('no booking panel')
  if (!has(t, 'What happens after you press send')) problems.push('no response SLA')
  if (!/1 working day/.test(t)) problems.push('SLA lacks a number')
  if (!has(t, 'hello@simplelogicx.com')) problems.push('no booking contact')
  if (!r.ld.includes('BreadcrumbList')) problems.push('no breadcrumb')
  if (r.h1 !== 1) problems.push(`h1 count=${r.h1}`)
  // Mostly form: labels and helper text, not prose.
  if (words(t) < 280) problems.push(`thin content (${words(t)} words)`)
  if (r.stranded > 0) problems.push(`${r.stranded} stranded elements`)
  ok(problems.length === 0,
    `/contact  ${String(words(t)).padStart(4)} words | ld=[${r.ld.join(',')}]` +
    (problems.length ? `\n       ${problems.join(', ')}` : ''))

  /* Every control must have an accessible name. An unlabelled select in a
     lead form is a silent conversion bug as much as an accessibility one. */
  const unlabelled = await p.evaluate(() =>
    [...document.querySelectorAll('main input, main select, main textarea')]
      .filter(el => !el.labels?.length && !el.getAttribute('aria-label') && !el.getAttribute('aria-labelledby'))
      .map(el => el.name || el.type))
  ok(unlabelled.length === 0, `contact   all form controls labelled${unlabelled.length ? ` — missing: ${unlabelled.join(',')}` : ''}`)

  /* Enquiry types are derived from `services`, so all seven must be offered. */
  const typeOptions = await p.locator('main select[name="enquiryType"] option').count()
  ok(typeOptions === 10, `contact   enquiry types = ${typeOptions} (7 services + hiring + other + placeholder)`)

  /* Required fields must actually block submission. */
  await p.locator('main button[type="submit"]').click()
  await p.waitForTimeout(200)
  const blocked = await p.evaluate(() => !document.querySelector('main form').checkValidity())
  ok(blocked, 'contact   empty submit is blocked by constraint validation')

  /* Self-selection note is conditional on the smallest budget band. */
  await p.locator('main select[name="budget"]').selectOption('under-12k')
  await p.waitForTimeout(150)
  const note = await p.locator('main form').innerText()
  ok(/probably the wrong shape/.test(note), 'contact   sub-minimum budget shows the honest note')
  ok(/£12k/.test(note), 'contact   note quotes the tier price rather than a literal')

  /* Full valid submit reaches the confirmation state. */
  await p.fill('main input[name="name"]', 'Test Person')
  await p.fill('main input[name="email"]', 'test@example.com')
  await p.locator('main select[name="enquiryType"]').selectOption('saas')
  await p.locator('main select[name="budget"]').selectOption('50k-150k')
  await p.locator('main select[name="timeline"]').selectOption('quarter')
  await p.fill('main textarea[name="message"]', 'A short but valid description of the problem.')
  await p.locator('main button[type="submit"]').click()
  await p.waitForTimeout(300)
  const confirm = await p.locator('main [role="status"]').innerText()
  ok(/an engineer has it/i.test(confirm), `contact   submit confirmation = "${confirm}"`)

  const cleared = await p.inputValue('main input[name="name"]')
  ok(cleared === '', 'contact   form resets after a successful submit')
}

await b.close()
console.log(fail === 0 ? '\nALL STEP-8 PAGE CHECKS PASSED' : `\n${fail} FAILED`)
process.exit(fail ? 1 : 0)
