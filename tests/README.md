# Verification suites

Browser-driven checks that guard the two defects this rebuild exists to fix — off-centre
layout and a green-reading palette — plus the accessibility and motion behaviour that is
easy to regress silently.

## Setup

`playwright`, `lighthouse` and `axe-core` are in `devDependencies`, so `npm install` covers
the packages. The browser binaries are separate and must be fetched once:

```bash
npx playwright install chromium firefox webkit
```

Chromium alone is enough for everything except `verify-cross-browser`, which needs all
three.

## Running

```bash
npm run verify                 # build, start servers, run everything
npm run verify routes          # one suite (substring match on the filename)
npm run verify work motion     # several
```

Lighthouse is deliberately **not** part of `npm run verify` — see the note below.

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
| `verify-contrast` | WCAG AA over every text node on 25 routes × 2 themes. Composites the whole ancestor stack rather than reading `color` against `background-color`, because the ink and surface tokens both carry alpha, and enumerates gradient stops so a ramp is measured at its worst point |
| `verify-a11y` | Names, roles, relationships, heading order, and the WCAG 2.2 additions that apply here (2.5.8 target size, 3.3.2 visible labels). Hand-written, and scoped to defects this project specifically has |
| `verify-axe` | axe-core over 16 routes × 2 themes plus the mega-menu, mobile dialog and command palette in their **open** states. Overlaps `verify-a11y` on purpose — see the note below |
| `verify-keyboard` | Every interaction driven by real key events only, with no `click()` anywhere, so a pass means the interaction genuinely works without a mouse |
| `verify-cross-browser` | Chromium + Firefox + WebKit: centring and overflow at 4 widths × 2 themes, `light-dark()` actually painting, cascade-layer precedence, skip-link focus handoff, smooth scroll settling, and the ⌘K palette keyboard path |
| `verify-reduced-motion` | All 25 routes under `prefers-reduced-motion`. Sweeps rather than samples, because the failure mode is silent and total: content that never becomes visible |
| `verify-nogreen` | Samples 300 points across every approved gradient and fails on any green-hued pixel with real saturation |
| `sanity-green` | Proves the green detector is not vacuous by running it against v1's actual gradients — `cyan → lime` scores 205/300 |
| `verify-motion` | Lenis active and sharing one ticker with ScrollTrigger, no trigger leak across navigation, seamless marquee geometry, counters settling on authored values, nothing stranded below opacity 0.9, and full reduced-motion behaviour |

## Lighthouse

Not part of `npm run verify`. Scores move with machine load, and a suite that fails
because something else was compiling is a suite people learn to ignore.

```bash
npm run build
npx vite preview --port 4173 &
node tests/lighthouse.mjs                        # mobile (default)
FORM=desktop node tests/lighthouse.mjs           # desktop
ROUTE=/pricing node tests/lighthouse-detail.mjs  # item-level detail for one route
```

`lighthouse.mjs` reports scores across six representative routes; `lighthouse-detail.mjs`
prints the audit items behind one route's failures — which element shifted, which bytes
went unused. That detail is what names a fix, and it is far too verbose to print for six
routes at once.

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
- **`verify-axe` and `verify-a11y` overlap on purpose, and neither replaces the other.**
  A hand-written audit grades its own homework: it can only fail on defects someone already
  thought of. axe encodes several hundred rules maintained by people who do this full time,
  and it found two real violations on its first run that `verify-a11y` had no check for.
  Going the other way, axe only ever sees the DOM in front of it — it cannot assert that
  focus moves to the right place on a route change, and it cannot open a mega-menu. That is
  why `verify-axe` explicitly drives the three overlays open before auditing them: a dialog
  that is never opened is a dialog that is never audited.
- **`verify-axe` has `color-contrast` disabled.** `verify-contrast` owns that, and it
  composites the whole ancestor stack. axe reads `background-color` off the nearest painted
  ancestor and returns "incomplete" for anything behind a gradient or a `backdrop-filter`,
  which describes most of this site. Two contrast reports that disagree are worse than one
  that is trusted.
- **`verify-cross-browser` measures against `documentElement.clientWidth`, never
  `window.innerWidth`.** `innerWidth` includes the scrollbar gutter, and WebKit reserves a
  classic 10px scrollbar where Chromium and Firefox use a zero-width overlay — so an
  `innerWidth` comparison reports a perfectly centred container as 10px off, in exactly one
  engine. That is the measurement being wrong, not the layout.
- **It focuses the skip link directly instead of pressing Tab.** WebKit does not put links
  in the sequential tab order by default — that is Safari's "Press Tab to highlight each
  item on a webpage" preference, which ships off. Asserting "the skip link is the first tab
  stop" would fail in WebKit on a correctly built page. What the suite asserts instead is
  the part that is ours: that activating it moves focus into `<main>`.
- **Its palette checks wait on state, never on a fixed delay.** The palette binds its
  Escape listener in an effect that runs when it opens, so pressing Escape before that
  commits is swallowed. A fixed 250ms wait passed standalone and failed under load, in one
  engine — a flake that looked exactly like a real bug.
- **Playwright's `webkit` is not Safari.** It shares WebCore and JavaScriptCore, so it
  catches engine-level differences, but a pass means "no engine-level defect found", not
  "verified on Safari". Real Safari on macOS/iOS is still a manual check.

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
