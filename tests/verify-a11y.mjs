import { chromium } from 'playwright'

/**
 * Static accessibility audit — spec §6, WCAG 2.2 AA.
 *
 * Deliberately does NOT overlap the other suites. Focus handling on route
 * change, the mobile dialog trap, live regions and reduced motion are already
 * covered by verify-routes / verify-interactions / verify-motion; contrast is
 * verify-contrast. What is left is the structural layer nothing was asserting:
 * names, roles, relationships, heading order, and the two WCAG 2.2 additions
 * that apply to a site like this (2.5.8 target size, 3.3.2 visible labels).
 *
 * Every check here fails on a real defect rather than on a lint preference —
 * an element a screen reader would announce as "link" with no name, a heading
 * jump that breaks the document outline, an aria-labelledby pointing at an id
 * that does not exist.
 */

const BASE = process.env.URL || 'http://localhost:4173'

const ROUTES = [
  '/', '/services', '/services/saas', '/services/enterprise',
  '/work', '/work/northwind-logistics', '/about', '/process', '/pricing',
  '/contact', '/insights', '/insights/evaluating-rag-honestly',
  '/legal/privacy', '/legal/terms', '/this-route-does-not-exist',
]

const audit = () => {
  const problems = []
  const add = (rule, detail) => problems.push({ rule, detail })

  const label = (el) => {
    const tag = el.tagName.toLowerCase()
    const cls = (el.getAttribute('class') || '').split(/\s+/)[0] || ''
    return `<${tag}${cls ? '.' + cls : ''}>`
  }

  // ---- document ----------------------------------------------------------
  const lang = document.documentElement.getAttribute('lang')
  if (!lang) add('html-lang', 'no lang attribute on <html>')

  // ---- duplicate ids -----------------------------------------------------
  // Broken ids silently break every aria-labelledby / label[for] that uses them.
  const seen = new Map()
  for (const el of document.querySelectorAll('[id]')) {
    const id = el.id
    seen.set(id, (seen.get(id) || 0) + 1)
  }
  for (const [id, n] of seen) {
    if (n > 1) add('duplicate-id', `#${id} appears ${n} times`)
  }

  // ---- landmarks ---------------------------------------------------------
  const mains = document.querySelectorAll('main')
  if (mains.length !== 1) add('landmark', `expected exactly 1 <main>, found ${mains.length}`)
  if (!document.querySelector('header')) add('landmark', 'no <header>')
  if (!document.querySelector('footer')) add('landmark', 'no <footer>')

  // Multiple navs must be distinguishable by name.
  const navs = [...document.querySelectorAll('nav')]
  if (navs.length > 1) {
    const names = navs.map(
      (n) => n.getAttribute('aria-label') ||
        (n.getAttribute('aria-labelledby')
          ? document.getElementById(n.getAttribute('aria-labelledby'))?.textContent?.trim()
          : null)
    )
    const unnamed = names.filter((n) => !n).length
    if (unnamed) add('nav-name', `${unnamed} of ${navs.length} <nav> landmarks have no accessible name`)
    const dupes = names.filter((n, i) => n && names.indexOf(n) !== i)
    if (dupes.length) add('nav-name', `duplicate nav names: ${[...new Set(dupes)].join(', ')}`)
  }

  // ---- heading order -----------------------------------------------------
  // Skipping a level (h2 -> h4) breaks the outline screen reader users navigate by.
  const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')]
    .filter((h) => !h.closest('[aria-hidden="true"]'))
    .filter((h) => h.offsetParent !== null || getComputedStyle(h).position === 'fixed')
  let prev = 0
  for (const h of headings) {
    const level = Number(h.tagName[1])
    if (prev && level > prev + 1) {
      add('heading-order', `h${prev} -> h${level} at "${h.textContent.trim().slice(0, 44)}"`)
    }
    if (!h.textContent.trim()) add('empty-heading', label(h))
    prev = level
  }
  const h1s = headings.filter((h) => h.tagName === 'H1')
  if (h1s.length !== 1) add('h1-count', `${h1s.length} <h1> elements`)

  // ---- accessible names on interactive elements --------------------------
  const nameOf = (el) => {
    const aria = el.getAttribute('aria-label')
    if (aria && aria.trim()) return aria.trim()
    const by = el.getAttribute('aria-labelledby')
    if (by) {
      const text = by.split(/\s+/)
        .map((id) => document.getElementById(id)?.textContent?.trim() || '')
        .join(' ').trim()
      if (text) return text
    }
    if (el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA') {
      if (el.id) {
        const lab = document.querySelector(`label[for="${CSS.escape(el.id)}"]`)
        if (lab?.textContent.trim()) return lab.textContent.trim()
      }
      const wrapping = el.closest('label')
      if (wrapping?.textContent.trim()) return wrapping.textContent.trim()
      const title = el.getAttribute('title')
      if (title?.trim()) return title.trim()
      return ''
    }
    // Visible text, plus any img alt inside.
    const text = el.textContent.trim()
    if (text) return text
    const img = el.querySelector('img[alt]')
    if (img?.getAttribute('alt')?.trim()) return img.getAttribute('alt').trim()
    const t = el.getAttribute('title')
    return t?.trim() || ''
  }

  const interactive = [...document.querySelectorAll(
    'a[href], button, input:not([type="hidden"]), select, textarea, [role="button"], [role="link"], [tabindex]'
  )].filter((el) => {
    if (el.closest('[aria-hidden="true"]')) return false
    if (el.hasAttribute('disabled')) return false
    const cs = getComputedStyle(el)
    if (cs.display === 'none' || cs.visibility === 'hidden') return false
    return true
  })

  for (const el of interactive) {
    // A tabindex="-1" element is a programmatic focus target, not a control —
    // the route-focus sentinel is the example. It is not reachable by tab and
    // announces via the live region, so requiring a name on it would be wrong.
    const onlyFocusTarget =
      !el.matches('a[href], button, input, select, textarea, [role="button"], [role="link"]') &&
      Number(el.getAttribute('tabindex')) < 0
    if (onlyFocusTarget) continue

    // Elements hidden off-screen on purpose (skip link) still need a name, so
    // do not filter on geometry here.
    const name = nameOf(el)
    if (!name) add('no-accessible-name', `${label(el)} ${el.outerHTML.slice(0, 70).replace(/\s+/g, ' ')}`)
    if (el.matches('a[href]') && !el.getAttribute('href')) add('empty-href', label(el))
  }

  // A positive tabindex overrides DOM order and is essentially always a bug.
  for (const el of document.querySelectorAll('[tabindex]')) {
    const v = Number(el.getAttribute('tabindex'))
    if (v > 0) add('positive-tabindex', `${label(el)} tabindex=${v}`)
  }

  // ---- images ------------------------------------------------------------
  for (const img of document.querySelectorAll('img')) {
    if (!img.hasAttribute('alt')) add('img-no-alt', img.getAttribute('src')?.slice(0, 60) || label(img))
  }

  // Inline SVG that is not decorative must be labelled; decorative must be hidden.
  for (const svg of document.querySelectorAll('svg')) {
    const hidden = svg.getAttribute('aria-hidden') === 'true' || svg.closest('[aria-hidden="true"]')
    const named = svg.getAttribute('aria-label') || svg.querySelector('title')
    const role = svg.getAttribute('role')
    if (!hidden && !named && role !== 'presentation' && role !== 'none') {
      add('svg-unlabelled', `${label(svg)} inside ${label(svg.parentElement)}`)
    }
  }

  // ---- aria references resolve ------------------------------------------
  for (const attr of ['aria-labelledby', 'aria-describedby', 'aria-controls', 'aria-owns']) {
    for (const el of document.querySelectorAll(`[${attr}]`)) {
      // aria-controls may legitimately point at a not-yet-rendered panel
      // (the accordion unmounts collapsed content), so only flag it when the
      // control claims the target is currently expanded.
      if (attr === 'aria-controls' && el.getAttribute('aria-expanded') !== 'true') continue
      for (const id of el.getAttribute(attr).split(/\s+/).filter(Boolean)) {
        if (!document.getElementById(id)) {
          add('broken-aria-ref', `${label(el)} ${attr}="${id}" -> no such element`)
        }
      }
    }
  }

  // ---- form controls -----------------------------------------------------
  for (const field of document.querySelectorAll('input:not([type="hidden"]), select, textarea')) {
    if (field.closest('[aria-hidden="true"]')) continue
    const name = nameOf(field)
    if (!name) continue // already reported above
    // 3.3.2: a placeholder is not a label.
    const hasRealLabel =
      (field.id && document.querySelector(`label[for="${CSS.escape(field.id)}"]`)) ||
      field.closest('label')
    if (!hasRealLabel && field.getAttribute('aria-label')) {
      add('label-not-visible', `${label(field)}#${field.id || '?'} named only by aria-label`)
    }
    if (field.hasAttribute('required') && field.getAttribute('aria-required') === 'false') {
      add('required-mismatch', `${label(field)}#${field.id}`)
    }
  }

  // ---- WCAG 2.2 2.5.8 target size (24x24 minimum) ------------------------
  // The pointer target is the whole control including its children, so an
  // inline <a> wrapping a 36px block (the logo) is a 36px target even though
  // its own line box is 21px. Measure the union.
  const targetBox = (el) => {
    let box = el.getBoundingClientRect()
    let { left, top, right, bottom } = box
    for (const child of el.querySelectorAll('*')) {
      const c = child.getBoundingClientRect()
      if (c.width === 0 || c.height === 0) continue
      left = Math.min(left, c.left); top = Math.min(top, c.top)
      right = Math.max(right, c.right); bottom = Math.max(bottom, c.bottom)
    }
    return { width: right - left, height: bottom - top }
  }

  // The sr-only pattern clips an element to 1px. It is not a visible target
  // until focused, at which point it is restored to full size.
  const isVisuallyHidden = (el) => {
    const cs = getComputedStyle(el)
    return cs.clipPath !== 'none' || (cs.clip && cs.clip !== 'auto')
  }

  // A control wrapped in (or referenced by) a label is activated by clicking
  // the label, so the label is part of the target.
  const effectiveTarget = (el) => {
    let host = el
    if (el.matches('input, select, textarea')) {
      const wrapping = el.closest('label')
      const forLabel = el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`)
      host = wrapping || forLabel || el
    }
    return targetBox(host)
  }

  const centres = interactive.map((el) => {
    const b = el.getBoundingClientRect()
    return { el, cx: b.left + b.width / 2, cy: b.top + b.height / 2 }
  })

  for (const el of interactive) {
    const r = effectiveTarget(el)
    if (r.width === 0 && r.height === 0) continue
    if (r.width >= 24 && r.height >= 24) continue
    if (isVisuallyHidden(el)) continue
    // Exception: links inline within a sentence of text are exempt.
    const inSentence = el.matches('a[href]') &&
      ['P', 'LI', 'SPAN', 'DD', 'DT', 'BLOCKQUOTE'].includes(el.parentElement?.tagName)
    if (inSentence) continue

    // Exception (Spacing): an undersized target passes if a 24px circle
    // centred on it does not intersect the circle of any other target — i.e.
    // no other target centre within 24px.
    const me = centres.find((c) => c.el === el)
    const crowded = centres.some((c) =>
      c.el !== el && Math.hypot(c.cx - me.cx, c.cy - me.cy) < 24
    )
    if (!crowded) continue

    add('target-size', `${label(el)} ${Math.round(r.width)}x${Math.round(r.height)} "${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30)}"`)
  }

  return problems
}

const browser = await chromium.launch()
let fails = 0
const byRule = new Map()

for (const theme of ['light', 'dark']) {
  const ctx = await browser.newContext({ colorScheme: theme, viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()

  for (const route of ROUTES) {
    await page.goto(BASE + route, { waitUntil: 'networkidle' })
    await page.waitForTimeout(400)

    const problems = await page.evaluate(audit)
    for (const p of problems) {
      const key = `${p.rule}|${p.detail}`
      if (!byRule.has(key)) byRule.set(key, { ...p, routes: [route], theme })
      else if (!byRule.get(key).routes.includes(route)) byRule.get(key).routes.push(route)
    }
    if (problems.length === 0) console.log(`PASS ${theme.padEnd(5)} ${route}`)
    else console.log(`FAIL ${theme.padEnd(5)} ${route.padEnd(38)} ${problems.length} problem(s)`)
  }
  await ctx.close()
}

// ---- focus visibility ------------------------------------------------------
// §6 says the ring is never removed. Assert it by tabbing through a real page
// and reading the computed outline, rather than grepping for `outline: none`.
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  await page.goto(BASE + '/contact', { waitUntil: 'networkidle' })
  await page.waitForTimeout(400)

  let noRing = []
  for (let i = 0; i < 30; i++) {
    await page.keyboard.press('Tab')
    const r = await page.evaluate(() => {
      const el = document.activeElement
      if (!el || el === document.body) return null
      const cs = getComputedStyle(el)
      const w = parseFloat(cs.outlineWidth) || 0
      return {
        tag: el.tagName.toLowerCase(),
        name: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 30),
        style: cs.outlineStyle,
        width: w,
        // A ring drawn with box-shadow instead of outline is still a ring.
        shadow: cs.boxShadow !== 'none',
      }
    })
    if (!r) continue
    const visible = (r.style !== 'none' && r.width >= 1) || r.shadow
    if (!visible) noRing.push(`${r.tag} "${r.name}"`)
  }
  if (noRing.length) {
    fails += noRing.length
    console.log(`\nFAIL focus ring missing on ${noRing.length} element(s):`)
    ;[...new Set(noRing)].slice(0, 10).forEach((n) => console.log(`     ${n}`))
  } else {
    console.log('\nPASS visible focus ring on all 30 tab stops sampled')
  }
  await ctx.close()
}

await browser.close()

if (byRule.size) {
  console.log('\n──────── problems, grouped')
  const grouped = new Map()
  for (const p of byRule.values()) {
    if (!grouped.has(p.rule)) grouped.set(p.rule, [])
    grouped.get(p.rule).push(p)
  }
  for (const [rule, items] of grouped) {
    fails += items.length
    console.log(`\n${rule} (${items.length})`)
    for (const i of items.slice(0, 8)) {
      console.log(`  ${i.detail}`)
      console.log(`     on ${i.routes.slice(0, 4).join(', ')}${i.routes.length > 4 ? ` +${i.routes.length - 4} more` : ''}`)
    }
    if (items.length > 8) console.log(`  … and ${items.length - 8} more`)
  }
}

console.log(fails === 0 ? '\nALL ACCESSIBILITY CHECKS PASSED' : `\n${fails} ACCESSIBILITY PROBLEM(S)`)
process.exit(fails === 0 ? 0 : 1)
