import { chromium } from 'playwright'

/**
 * WCAG 2.2 AA text contrast, measured — spec §6 (Accessibility) and §10 (Theme).
 *
 * This is the one acceptance criterion no other suite could reach: every check
 * elsewhere asserts on structure, and contrast is a computed property of two
 * colours that are themselves composited at paint time.
 *
 * Two things make a naive `color` vs `background-color` comparison wrong here,
 * and both are live in this codebase:
 *
 *   1. The ink tokens carry alpha. `--text-muted` is `rgb(6 34 46 / 0.52)`, not
 *      a solid grey, so the colour that actually reaches the screen depends on
 *      what is behind it. Reading `color` alone measures a colour that is never
 *      painted.
 *   2. Surfaces carry alpha too. `--surface` is a 4% wash, so a card sits on
 *      whatever is under the card. The effective background is the whole
 *      ancestor stack composited, not the nearest element with a background.
 *
 * So: walk up from each text node compositing every background-color until an
 * opaque one is reached, composite the text colour over that result, then apply
 * the WCAG relative-luminance formula.
 *
 * Gradients are not exempt. A ramp has a contrast ratio at every point along
 * it, and the one that matters is the worst one — so the gradient's colour
 * stops are parsed out of the computed `background-image` and each is measured.
 * This applies in both directions: text sitting ON a gradient (the primary
 * button) and text PAINTED WITH a gradient via `background-clip: text` (every
 * display headline), where the glyphs are the ramp and the page is behind them.
 *
 * Known limitation, stated rather than hidden: this composites the ancestor
 * chain, so it cannot see a decorative sibling painted behind the text — the
 * aurora orbs are positioned siblings, not ancestors. They are 10–20% opacity
 * over the base surface, so measuring against the base is close but not exact.
 * Anything relying on a margin of less than ~0.2 there should be treated as
 * unproven.
 */

const BASE = process.env.URL || 'http://localhost:4173'

const ROUTES = [
  '/', '/services',
  '/services/saas', '/services/ai', '/services/mobile', '/services/web',
  '/services/cloud', '/services/iot', '/services/enterprise',
  '/work', '/work/northwind-logistics', '/work/meridian-health',
  '/work/atlas-payments', '/work/vantage-retail', '/work/halden-energy',
  '/about', '/process', '/pricing', '/contact',
  '/insights', '/insights/evaluating-rag-honestly',
  '/insights/unlayered-css-resets',
  '/legal/privacy', '/legal/terms', '/this-route-does-not-exist',
]

// 375 matters as well as 1440: type is fluid, so a heading that clears the
// 24px "large text" bar on desktop can drop under it on a phone and become
// subject to the stricter 4.5:1 threshold.
const WIDTHS = [375, 1440]

const AA_NORMAL = 4.5
const AA_LARGE = 3.0

const collect = () => {
  const parseColor = (str) => {
    const m = str.match(/rgba?\(([^)]+)\)/)
    if (!m) return null
    const parts = m[1].split(/[,\s/]+/).filter(Boolean).map(Number)
    const [r, g, b] = parts
    const a = parts.length > 3 ? parts[3] : 1
    return { r, g, b, a }
  }

  // Standard source-over compositing of `fg` onto an opaque `bg`.
  const over = (fg, bg) => ({
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a),
    a: 1,
  })

  const luminance = ({ r, g, b }) => {
    const ch = (v) => {
      const s = v / 255
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
    }
    return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b)
  }

  const ratio = (a, b) => {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
    return (hi + 0.05) / (lo + 0.05)
  }

  // Every colour stop in a computed background-image, in order.
  const stopsOf = (bgImage) => {
    if (!bgImage || bgImage === 'none') return []
    return (bgImage.match(/rgba?\([^)]*\)/g) || []).map(parseColor).filter(Boolean)
  }

  // The effective background behind `el`: composite every ancestor background
  // from the bottom up until the stack is opaque. `startAt` lets a caller skip
  // the element itself, which is what gradient-clipped text needs — its own
  // background IS the ink, so the background is whatever is behind it.
  const backgroundOf = (el, startAt) => {
    const layers = []
    let gradient = null
    let gradientStops = []
    let node = startAt || el
    while (node && node.nodeType === 1) {
      const cs = getComputedStyle(node)
      if (cs.backgroundImage && cs.backgroundImage !== 'none' && !gradient) {
        const s = stopsOf(cs.backgroundImage)
        if (s.length) {
          gradient = cs.backgroundImage.slice(0, 90)
          gradientStops = s
        }
      }
      const c = parseColor(cs.backgroundColor)
      if (c && c.a > 0) {
        layers.push(c)
        if (c.a === 1) break
      }
      node = node.parentElement
    }
    // Nothing opaque found: the canvas is the page background.
    let base = { r: 255, g: 255, b: 255, a: 1 }
    const last = layers[layers.length - 1]
    if (last && last.a === 1) {
      base = layers.pop()
    } else {
      const canvas = parseColor(getComputedStyle(document.documentElement).backgroundColor)
      if (canvas && canvas.a === 1) base = canvas
    }
    // Apply remaining translucent layers bottom-up.
    let acc = base
    for (let i = layers.length - 1; i >= 0; i--) acc = over(layers[i], acc)

    // A gradient paints over the colour beneath it, so each stop composited
    // over that colour is a background the text genuinely sits on.
    const candidates = gradientStops.length
      ? gradientStops.map((s) => over(s, acc))
      : [acc]

    return { bg: acc, candidates, gradient }
  }

  const cumulativeOpacity = (el) => {
    let o = 1
    let node = el
    while (node && node.nodeType === 1) {
      const v = parseFloat(getComputedStyle(node).opacity)
      if (!Number.isNaN(v)) o *= v
      node = node.parentElement
    }
    return o
  }

  const describe = (el) => {
    const cls = (el.getAttribute('class') || '').split(/\s+/).filter(Boolean).slice(0, 4).join('.')
    return el.tagName.toLowerCase() + (cls ? '.' + cls : '')
  }

  const out = []
  const all = document.querySelectorAll('body *')

  for (const el of all) {
    // Only elements that paint their own text.
    const text = [...el.childNodes]
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent.trim())
      .join(' ')
      .trim()
    if (!text) continue

    const cs = getComputedStyle(el)
    if (cs.visibility === 'hidden' || cs.display === 'none') continue
    const rect = el.getBoundingClientRect()
    if (rect.width < 1 || rect.height < 1) continue
    if (el.closest('[aria-hidden="true"]')) continue

    const opacity = cumulativeOpacity(el)
    // Mid-animation elements are verify-motion's problem, not this suite's.
    if (opacity < 0.99) continue

    const fill = cs.webkitTextFillColor || cs.color
    const fg = parseColor(fill) || parseColor(cs.color)
    if (!fg) continue

    const size = parseFloat(cs.fontSize)
    const weight = parseInt(cs.fontWeight, 10) || 400
    const large = size >= 24 || (size >= 18.66 && weight >= 700)

    const required = large ? 3.0 : 4.5
    const show = (c) => `rgb(${Math.round(c.r)},${Math.round(c.g)},${Math.round(c.b)})`

    // Gradient-clipped text (`text-grad`): the glyphs ARE the ramp and the
    // page is behind them. Measure every stop against the real background,
    // which means skipping this element's own background — it is the ink.
    if (fg.a === 0) {
      const own = getComputedStyle(el).backgroundImage
      const inkStops = stopsOf(own)
      const behind = backgroundOf(el, el.parentElement)
      if (!inkStops.length) continue // transparent text with no ink source

      let worst = null
      for (const stop of inkStops) {
        for (const b of behind.candidates) {
          const r = ratio(over(stop, b), b)
          if (!worst || r < worst.r) worst = { r, stop, b }
        }
      }
      out.push({
        kind: 'gradient-text',
        sel: describe(el), text: text.slice(0, 48),
        size: Math.round(size * 10) / 10, weight, large, required,
        ratio: Math.round(worst.r * 100) / 100,
        fg: show(worst.stop), bg: show(worst.b),
        gradient: own.slice(0, 90),
        pass: worst.r >= required,
      })
      continue
    }

    // Opaque text: worst case across every background it may sit on.
    const { candidates, gradient } = backgroundOf(el)
    let worst = null
    for (const b of candidates) {
      const r = ratio(over(fg, b), b)
      if (!worst || r < worst.r) worst = { r, b }
    }

    out.push({
      kind: gradient ? 'gradient-backed' : 'measured',
      sel: describe(el),
      text: text.slice(0, 48),
      size: Math.round(size * 10) / 10,
      weight, large, required,
      ratio: Math.round(worst.r * 100) / 100,
      fg: `rgba(${fg.r},${fg.g},${fg.b},${fg.a})`,
      bg: show(worst.b),
      gradient,
      pass: worst.r >= required,
    })
  }
  return out
}

const browser = await chromium.launch()
let fails = 0
let checked = 0
const failures = new Map()
const gradientText = new Map()

for (const theme of ['light', 'dark']) {
  const ctx = await browser.newContext({
    colorScheme: theme,
    viewport: { width: 1440, height: 900 },
  })
  const page = await ctx.newPage()

  for (const route of ROUTES) {
    await page.goto(BASE + route, { waitUntil: 'networkidle' })
    // Let reveals settle so nothing is measured mid-transition.
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(500)
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForTimeout(350)

    for (const w of WIDTHS) {
      await page.setViewportSize({ width: w, height: 900 })
      await page.waitForTimeout(250)

      const results = await page.evaluate(collect)
      checked += results.length

      for (const r of results) {
        if (r.kind === 'gradient-text') gradientText.set(`${r.sel}|${r.text}`, true)
        if (r.pass) continue
        // Dedupe by the thing that is actually broken — the colour pair and
        // the size class — so one bad token does not print 400 times.
        const key = `${theme}|${r.kind}|${r.fg}|${r.bg}|${r.large}`
        if (!failures.has(key)) {
          failures.set(key, { ...r, theme, route, w, count: 1, samples: [`${route} @${w} <${r.sel}>`] })
        } else {
          const f = failures.get(key)
          f.count++
          if (f.samples.length < 4 && !f.samples.some((s) => s.startsWith(route + ' '))) {
            f.samples.push(`${route} @${w} <${r.sel}>`)
          }
        }
      }
    }
    await page.setViewportSize({ width: 1440, height: 900 })
  }
  await ctx.close()
}

await browser.close()

console.log(`\nMeasured ${checked} text nodes across ${ROUTES.length} routes x 2 themes x ${WIDTHS.length} widths.\n`)

const LABEL = {
  measured: 'text     ',
  'gradient-backed': 'on-grad  ',
  'gradient-text': 'grad-ink ',
}

console.log(`${gradientText.size} of them are gradient-clipped (glyphs painted with a ramp).\n`)

if (failures.size === 0) {
  console.log('PASS every text node meets WCAG AA in both themes')
} else {
  for (const f of [...failures.values()].sort((a, b) => a.ratio - b.ratio)) {
    fails++
    console.log(
      `FAIL ${f.theme.padEnd(5)} ${LABEL[f.kind]} ${String(f.ratio).padStart(5)}:1 ` +
      `(needs ${f.required}) ${f.size}px/${f.weight} ${f.large ? 'large' : 'body '} ` +
      `${f.fg} on ${f.bg}  x${f.count}`
    )
    if (f.gradient) console.log(`       ramp: ${f.gradient}`)
    f.samples.forEach((s) => console.log(`       ${s}`))
    console.log(`       e.g. "${f.text}"`)
  }
}

console.log(fails === 0 ? '\nALL CONTRAST CHECKS PASSED' : `\n${fails} CONTRAST PROBLEM(S)`)
process.exit(fails === 0 ? 0 : 1)
