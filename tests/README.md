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

`src/dev/LayoutProbe.jsx` is the original centring harness. It is no longer mounted —
`verify-routes` covers centring across every real route instead — but it can be rendered
from `main.jsx` if a layout problem needs isolating. Delete it at final cutover.
