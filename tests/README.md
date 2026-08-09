# Verification suites

Browser-driven checks that guard the two defects this rebuild exists to fix — off-centre
layout and a green-reading palette — plus the accessibility and motion behaviour that is
easy to regress silently.

## Setup

Playwright is **not** currently in `package.json`. Install it before the first run:

```bash
npm install -D playwright
npx playwright install chromium
```

## Running

```bash
npm run verify                 # build, start servers, run everything
npm run verify routes          # one suite (substring match on the filename)
npm run verify work motion     # several
```

`tests/run.mjs` builds, then starts the servers through Vite's Node API. It does not spawn
`npx vite`, because killing that process tree is unreliable on Windows and tends to leave
an orphan holding the port — which then makes the next run silently test stale output.

Two servers, because the suites need different things:

| Server | Port | Used by |
|---|---|---|
| preview (production build) | 4173 | everything except motion |
| dev | 5199 | `verify-motion` — it asserts against the dev-only `window.__SLX` handle exposed in `src/lib/gsap.js` |

Each script also honours a `URL` env var, so you can point one at an already-running
server: `URL=http://localhost:4173 node tests/verify-routes.mjs`.

## What each suite covers

| Suite | Checks |
|---|---|
| `verify-routes` | All 22 route patterns × 2 themes: title, description, canonical, exactly one `h1`, nav/footer/skip-link, zero overflow and zero container asymmetry at 375/768/1440/2560, plus client-side nav, scroll reset and focus handoff |
| `verify-services` | 7 service pages: section composition, word count, `Service` + `BreadcrumbList` schema, no stranded elements |
| `verify-work` | 5 case studies: composition, 4-stage diagram, `Article` schema, next-case wrap-around; index filtering, `aria-pressed`, live-region count, and that filtered results render **immediately** |
| `verify-pages` | `/about`, `/process`, `/pricing`, `/contact`, `/legal/*`, `/404`: section composition, schema, no leftover placeholder copy, pricing estimator arithmetic against the tier prices read off the same page, contact form labelling and validation, the legal draft notice, the privacy policy's four factual claims checked against the running page, and 404 search over the derived site index |
| `verify-insights` | Index filtering and immediate filtered render; 3 articles: derived reading time checked against the schema's own word count, contents list generated from and matching the body headings, `Article` + `BreadcrumbList` schema, code samples that scroll rather than widening the document, read-next wrap-around, and that a contents link actually scrolls under Lenis |
| `verify-interactions` | Mega-menu (hover/keyboard/Escape/navigate), theme toggle + persistence + no flash, FAQ accordion, mobile dialog focus trap and scroll lock |
| `verify-nogreen` | Samples 300 points across every approved gradient and fails on any green-hued pixel with real saturation |
| `sanity-green` | Proves the green detector is not vacuous by running it against v1's actual gradients — `cyan → lime` scores 205/300 |
| `verify-motion` | Lenis active and sharing one ticker with ScrollTrigger, no trigger leak across navigation, seamless marquee geometry, counters settling on authored values, nothing stranded below opacity 0.9, and full reduced-motion behaviour |

## Notes on the assertions

Several are deliberately tight and will look arbitrary otherwise:

- **`verify-work` waits only 250ms after clicking a filter.** Filtered results must appear
  at once. A longer wait would let the 1200ms `Reveal` failsafe mask a regression — which
  is exactly the bug this caught originally.
- **`verify-motion` proves the Lenis↔GSAP wiring functionally** by creating a real
  ScrollTrigger and scrolling with the wheel, rather than inspecting properties. If the two
  ran on separate clocks (as in v1) the trigger would receive no updates.
- **The "stranded elements" check** is the safety net for §5.4: no visible content may sit
  below opacity 0.9 after scrolling. An animation that fails is cosmetic; content that never
  appears is a broken page.
- **`sanity-green` exists because a passing test proves nothing if it cannot fail.** It runs
  the detector against known-bad input.
- **`verify-pages` compares the pricing estimator against prices it reads off the cards**,
  not against literals. Hardcoding £12k/£28k here would let a price change break the site
  and keep the suite green, which is the exact failure the shared `pricingTiers` prevents.
- **Word-count floors in `verify-pages` are per page and deliberately low.** `innerText`
  excludes collapsed accordion answers — those panels are unmounted while closed — so
  `/pricing` reads ~400 words under what it contains. The floors catch a page regressing to
  a stub; they are not a prose-length policy.
- **Assertions on section labels are case-insensitive.** `innerText` returns text as
  rendered, and every eyebrow on the site is `text-transform: uppercase`. A case-sensitive
  match there tests the stylesheet, not the content.
- **`verify-insights` checks derived values against what they are derived from.** Reading
  time is compared to the word count in the page's own `Article` schema, and the contents
  list is compared to the body's `h2` ids — never to a literal. Both are computed in
  `content/insights.js`; hardcoding either here would let them drift apart silently.
- **The privacy policy's factual claims are executed, not read.** `verify-pages` asserts
  `document.cookie` is empty and that the page issues zero third-party requests, because
  those are claims the policy makes in prose. Adding an analytics script must fail a test,
  not just contradict a paragraph nobody re-reads.
- **404 search is asserted to find content added after it was written** — a case study, an
  article, a service by its stack, a legal page. That is the property that matters: the
  index is derived from the content files, so it cannot go stale.

## `NODE_ENV` and the dev server

`run.mjs` resets `process.env.NODE_ENV = "development"` before creating the dev server.
This is load-bearing, not tidying: Vite's `build()` sets `NODE_ENV=production` on the
process and leaves it set, so a dev server created afterwards has `import.meta.env.DEV`
false. That strips the dev-only `window.__SLX` handle from `src/lib/gsap.js` and
`verify-motion` fails on a missing handle rather than on anything it is testing. It failed
this way from the moment the suite was written; the standalone form
(`URL=… node tests/verify-motion.mjs` against `npm run dev`) always passed, which is how it
went unnoticed.

`src/dev/LayoutProbe.jsx` is the original centring harness. It is no longer mounted —
`verify-routes` covers centring across every real route instead — but it can be rendered
from `main.jsx` if a layout problem needs isolating. Delete it at final cutover.
