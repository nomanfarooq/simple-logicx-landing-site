import { chromium } from 'playwright'
import lighthouse from 'lighthouse'

/**
 * Lighthouse against the production build — spec §6 (Performance), which asks
 * for >=95 in all four categories and LCP <2.0s / CLS <0.05.
 *
 * NOT part of `npm run verify`. Lighthouse scores move with machine load, and
 * a suite that fails because something else was compiling is a suite people
 * learn to ignore. This is run deliberately, and the numbers it prints are
 * recorded in the resume log with the machine they came from.
 *
 * Run:  npm run build && node tests/lighthouse.mjs
 *       URL=http://localhost:4173 node tests/lighthouse.mjs   (existing server)
 *       FORM=desktop node tests/lighthouse.mjs                (desktop profile)
 *       ROUTES=/,/pricing node tests/lighthouse.mjs           (subset)
 *
 * Chrome comes from Playwright's bundled Chromium rather than a system
 * install, launched with a remote debugging port for Lighthouse to attach to,
 * so this needs no browser beyond what the other suites already require.
 */

const BASE = process.env.URL || 'http://localhost:4173'
const PORT = 9222

// One representative of each page shape rather than all 25 — a full run is
// ~40s per route and the shapes are what differ.
const ROUTES = process.env.ROUTES?.split(',') ?? [
  '/',                              // hero, marquee, pinned timeline — heaviest
  '/services/saas',                 // service detail
  '/work/northwind-logistics',      // case study, diagram, counters
  '/pricing',                       // interactive estimator
  '/insights/evaluating-rag-honestly', // long article, code blocks
  '/contact',                       // form
]

const THRESHOLDS = {
  performance: 95,
  accessibility: 95,
  'best-practices': 95,
  seo: 95,
}

/**
 * Mobile is the default and the harsher of the two: 1.6Mbps down, 150ms RTT
 * and a 4x CPU slowdown. Desktop is reported separately rather than instead,
 * because the two answer different questions and the gap between them is
 * itself the finding — a client-rendered SPA is gated on shipping and
 * executing its bundle, which desktop hardware hides and a throttled phone
 * does not.
 */
const DESKTOP = process.env.FORM === 'desktop'

const EMULATION = DESKTOP
  ? {
      formFactor: 'desktop',
      screenEmulation: { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false },
      throttling: { rttMs: 40, throughputKbps: 10240, cpuSlowdownMultiplier: 1 },
    }
  : {
      formFactor: 'mobile',
      screenEmulation: { mobile: true, width: 412, height: 823, deviceScaleFactor: 1.75, disabled: false },
    }

const browser = await chromium.launch({
  args: [`--remote-debugging-port=${PORT}`],
})

const results = []

for (const route of ROUTES) {
  process.stdout.write(`\n${route} … `)

  const runnerResult = await lighthouse(
    BASE + route,
    {
      port: PORT,
      output: 'json',
      logLevel: 'error',
      throttlingMethod: 'simulate',
      ...EMULATION,
    },
  )

  const lhr = runnerResult.lhr
  const scores = Object.fromEntries(
    Object.entries(lhr.categories).map(([k, v]) => [k, Math.round(v.score * 100)]),
  )
  const audits = lhr.audits
  const metric = (id) => audits[id]?.numericValue ?? null

  const row = {
    route,
    scores,
    lcp: metric('largest-contentful-paint'),
    cls: metric('cumulative-layout-shift'),
    tbt: metric('total-blocking-time'),
    fcp: metric('first-contentful-paint'),
    si: metric('speed-index'),
    // The opportunities that actually name a fix, biggest first.
    opportunities: Object.values(audits)
      .filter((a) => a.details?.type === 'opportunity' && a.numericValue > 100)
      .sort((a, b) => b.numericValue - a.numericValue)
      .slice(0, 4)
      .map((a) => `${a.title} (${Math.round(a.numericValue)}ms)`),
    failedAudits: Object.values(audits)
      .filter((a) => a.score !== null && a.score < 0.9 && a.scoreDisplayMode !== 'informative')
      .map((a) => a.id),
  }
  results.push(row)
  process.stdout.write(
    `perf ${scores.performance} a11y ${scores.accessibility} bp ${scores['best-practices']} seo ${scores.seo}`,
  )
}

await browser.close()

console.log(
  `\n\n════════ Lighthouse (${DESKTOP ? 'desktop' : 'mobile'}, simulated throttling)\n`,
)
console.log(
  'route'.padEnd(38) + 'perf  a11y  bp   seo  |  LCP     CLS    TBT',
)
console.log('─'.repeat(88))

let fails = 0
for (const r of results) {
  const s = r.scores
  const bad = Object.entries(THRESHOLDS).filter(([k, min]) => s[k] < min)
  if (bad.length) fails++
  console.log(
    r.route.padEnd(38) +
      String(s.performance).padEnd(6) +
      String(s.accessibility).padEnd(6) +
      String(s['best-practices']).padEnd(5) +
      String(s.seo).padEnd(5) +
      '|  ' +
      `${(r.lcp / 1000).toFixed(2)}s`.padEnd(8) +
      r.cls.toFixed(3).padEnd(7) +
      `${Math.round(r.tbt)}ms`,
  )
}

console.log('\n──────── notes')
for (const r of results) {
  if (r.opportunities.length || r.failedAudits.length) {
    console.log(`\n${r.route}`)
    r.opportunities.forEach((o) => console.log(`  opportunity: ${o}`))
    if (r.failedAudits.length) {
      console.log(`  failing audits: ${r.failedAudits.slice(0, 10).join(', ')}`)
    }
  }
}

const worstLcp = Math.max(...results.map((r) => r.lcp))
const worstCls = Math.max(...results.map((r) => r.cls))
console.log(
  `\nworst LCP ${(worstLcp / 1000).toFixed(2)}s (budget 2.00s) · ` +
    `worst CLS ${worstCls.toFixed(3)} (budget 0.050)`,
)

console.log(
  fails === 0
    ? `\nAll ${results.length} routes meet the >=95 bar in all four categories.`
    : `\n${fails} route(s) below the >=95 bar.`,
)
process.exit(fails === 0 ? 0 : 1)
