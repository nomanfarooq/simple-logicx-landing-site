# Resume log — SimpleLogicX v2 rebuild

**Paused after step 9 of 10.** Branch `rebuild/v2-foundation`, **not pushed**.

Read this first, then `docs/SimpleLogicX_Rebuild_Spec.md` — the spec is the authority on
what to build and why; this file is only the bookmark.

---

## Where things stand

```
(step 9)  Write insights, legal and 404 search                     (this commit)
3f5450a   Record the step 8 commit hash in the resume log
ce58769   Build About, Process, Pricing and Contact                (step 8)
a4f42ea   Add full case study narratives and filterable work index (step 7)
72509b2   Add service detail pages and two case studies            (step 6)
feaca8b   Rebuild site foundation: fix centring and palette, …     (steps 1–5)
5294b6b   initial commit landing site                              (v1, deleted in step 5)
```

| Step | Status |
|---|---|
| 1. Tokens, theme, fonts, no-flash, primitives | done |
| 2. Centring verified at 7 breakpoints | done |
| 3. Router, layouts, navbar, footer, theme toggle | done (except CommandPalette — see below) |
| 4. Motion infrastructure | done |
| 5. Home, section by section | done |
| 6. Services index + 7 detail pages | done |
| 7. Work index + 5 case studies | done |
| 8. About, Process, Pricing, Contact | done |
| 9. Insights, Legal, 404 | done |
| **10. Accessibility audit, Lighthouse, cross-browser, reduced-motion pass** | **next** |

All 9 suites green: routes, services, work, pages, insights, interactions, no-green,
sanity-green, motion.

**Every page on the site now has real content. No placeholder copy remains anywhere in
`src/`** — that was the precondition for step 10.

---

## Pick up here

**Step 10 — accessibility audit, Lighthouse, cross-browser, reduced-motion pass.**

The suites already cover a lot of this incidentally (focus handoff, live regions, labelled
controls, reduced motion, zero overflow at four widths in both themes). What step 10 adds
is the parts a DOM assertion cannot reach:

- **Contrast.** Nothing has measured `text-ink-muted` on `bg-surface` in either theme. That
  is the most likely real failure on the site.
- **Lighthouse**, on the production build, per route. The bundle is the known problem —
  see below.
- **Cross-browser.** Everything so far has run in Chromium on Windows only. Safari is the
  risk: `light-dark()`, `@layer` ordering and the Lenis/GSAP ticker wiring are all places
  where it differs.
- **Full keyboard pass** by hand, including the mega-menu, the mobile dialog, the pricing
  estimator slider and the 404 search.
- **Screen reader pass** on at least one of the long articles, which are the newest and
  least exercised markup on the site.

Three decisions are waiting and each needs approval, because each is a deletion:

- `src/dev/LayoutProbe.jsx` — unmounted since step 2, meant to be deleted at cutover.
- Four `site-*.png` screenshots sitting untracked in the repo root. Not committed by any
  step; decide whether they belong in the repo or in `.gitignore`.
- The `notice` field in `content/legal.js`, which is what removes the draft banner. That
  one is counsel's call, not an engineering decision.

---

## Things that will bite you if you forget them

**Never write an unlayered global reset.** `* { margin: 0 }` outside `@layer` beats every
Tailwind utility and was the entire cause of v1's off-centre layout. Global base rules go
in `@layer base`. Full evidence in spec §0.2 — and there is now an article about it at
`/insights/unlayered-css-resets`.

**Never build a cool→warm multi-hue gradient.** Cyan cannot reach the warm end of this
palette without crossing green or grey — measured, not aesthetic judgement. Headlines use
`grad-primary`. Spec §2.3 has the numbers.

**`light-dark()` is colour-only.** Using it for a number (`opacity`) silently falls back
to `1`. Numeric theme tokens use the explicit three-tier pattern. Spec §2.6.

**`Reveal` needs `disabled` when a list re-renders from a user action** (filter, sort,
tab) rather than from scrolling. Otherwise results start invisible and the 1200ms failsafe
becomes the primary path — the list sits blank for over a second. See `/work` and
`/insights`.

**Scroll must go through `useScrollTo`**, never `window.scrollTo` and never a bare `#`
anchor. Lenis holds its own target position and will animate back. The article and legal
contents rails are real anchors with a handler for exactly this reason.

**Sections must clip.** `Section` handles it, but any new section that renders decoration
outside that component can push the document wider than the viewport and break centring
everywhere. Code blocks scroll inside themselves for the same reason.

**One signature scroll effect per page** (pinned or scrubbed). Home's is the process
timeline spine; About's is the story timeline spine. More than one per page makes it feel
unresponsive.

**Prices are looked up, never restated.** `pricingTiers` carries a numeric `amount` and
derives its display string from it. `/process`, the pricing estimator and `/contact`'s
minimum-budget note all read from it. Do not type `£28k` into a page.

**Content that describes other content must be derived.** Reading time, article contents
lists, bylines, the 404 search index and the insights tag filter are all computed from
their source. Nothing in `src/content` restates a fact that lives in another file.

**`innerText` returns text as rendered.** Every eyebrow is `text-transform: uppercase`, so
a case-sensitive assertion on a section label tests the stylesheet. Collapsed accordion
panels are unmounted, so they do not count toward word totals either.

---

## Known open items

- **The ⌘K CommandPalette (§4.3) was never built.** It belonged to step 3 and was missed.
  `content/siteIndex.js` and its `searchSite()` are exactly the data and matcher it needs,
  so what remains is UI only: a dialog, a focus trap (copy `MobileMenu`'s) and a key
  binding.
- **Bundle is 681kB raw / 227kB gzip in one chunk** (framer-motion + GSAP + router).
  Flagged in step 5, deferred to step 10. GSAP is used by three components and could load
  lazily.
- **Legal copy is a draft.** Both documents carry a visible notice saying so. It is written
  against what the site actually does and is a real starting point for counsel, but it has
  not been reviewed by a lawyer and must not ship as though it has. Removing the `notice`
  field in `content/legal.js` is the deliberate act that drops the banner.
- **No backend for the contact form.** An explicit non-goal (§1). `submitEnquiry` in
  `src/pages/Contact.jsx` is the single seam. Do not add one without asking.
- **`ArchitectureDiagram`'s omitted-section branch is unreachable.** Every service now has
  a related case study, so the "no related work" path in `ServiceDetail` never runs.
- **Playwright is not in `package.json`.** `npm run verify` needs it. Installed for these
  sessions with `npm install --no-save playwright && npx playwright install chromium`,
  which deliberately leaves `package.json` alone. Add it properly when you want CI.
- **`src/dev/LayoutProbe.jsx` still exists** and is unmounted. Delete at final cutover.
- **Nothing is pushed.** Remote is `git@github.com:nomanfarooq/simple-logicx-landing-site.git`,
  default branch `main`.

---

## Fixed in step 8, worth knowing

**`verify-motion` had never passed under `npm run verify`.** `run.mjs` calls Vite's
`build()` first, which sets `NODE_ENV=production` on the process and leaves it there; the
dev server created afterwards therefore had `import.meta.env.DEV` false, which strips the
dev-only `window.__SLX` handle from `src/lib/gsap.js`. The suite failed on a missing handle
rather than on anything it tests. It passed standalone against `npm run dev`, which is how
the step-4 "12/12" reading was taken. `run.mjs` now resets `NODE_ENV` before
`createServer`. See `tests/README.md`.

---

## Running it

```bash
npm run dev        # http://localhost:5173
npm run build
npm run verify     # all suites (see tests/README.md for setup)
```

The verification suites in `tests/` are the main defence against regressing any of the
above. They were written alongside the fixes and encode the specific failure modes — read
`tests/README.md` before changing an assertion, because several are tight on purpose.
