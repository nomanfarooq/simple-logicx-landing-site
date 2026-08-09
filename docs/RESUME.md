# Resume log — SimpleLogicX v2 rebuild

**Paused after step 8 of 10.** Branch `rebuild/v2-foundation`, **not pushed**.

Read this first, then `docs/SimpleLogicX_Rebuild_Spec.md` — the spec is the authority on
what to build and why; this file is only the bookmark.

---

## Where things stand

```
ce58769   Build About, Process, Pricing and Contact                (step 8)
a4f42ea   Add full case study narratives and filterable work index (step 7)
bcd5077   Update spec: mark step 6 complete
72509b2   Add service detail pages and two case studies            (step 6)
feaca8b   Rebuild site foundation: fix centring and palette, …     (steps 1–5)
5294b6b   initial commit landing site                              (v1, deleted in step 5)
```

| Step | Status |
|---|---|
| 1. Tokens, theme, fonts, no-flash, primitives | done |
| 2. Centring verified at 7 breakpoints | done |
| 3. Router, layouts, navbar, footer, theme toggle | done |
| 4. Motion infrastructure | done |
| 5. Home, section by section | done |
| 6. Services index + 7 detail pages | done |
| 7. Work index + 5 case studies | done |
| 8. About, Process, Pricing, Contact | done |
| **9. Insights, Legal, 404** | **next** |
| 10. Accessibility audit, Lighthouse, cross-browser, reduced-motion pass | not started |

All 8 suites green: routes, services, work, **pages (new)**, interactions, no-green,
sanity-green, motion.

---

## Pick up here

**Step 9 — Insights, Legal, 404.**

- **Insights** is an index over `src/content/insights.js` with no article bodies. `Article.jsx`
  still carries a literal "authored in step 9" sentence in its copy, and the header comment
  in `insights.js` says the same. Both must be gone before step 10.
- **Legal** (`/legal/privacy`, `/legal/terms`) and **404** are the other two.
  §4.1 wants the 404 branded, with search and suggested routes.
- Article bodies are the real work here. The case studies in `caseStudies.js` are the
  model for how long-form content is structured and how specific the writing has to be.

Grep for `step 9` in `src/` — the placeholder pages say which step fills them in.

---

## Things that will bite you if you forget them

**Never write an unlayered global reset.** `* { margin: 0 }` outside `@layer` beats every
Tailwind utility and was the entire cause of v1's off-centre layout. Global base rules go
in `@layer base`. Full evidence in spec §0.2.

**Never build a cool→warm multi-hue gradient.** Cyan cannot reach the warm end of this
palette without crossing green or grey — measured, not aesthetic judgement. Headlines use
`grad-primary`. Spec §2.3 has the numbers.

**`light-dark()` is colour-only.** Using it for a number (`opacity`) silently falls back
to `1`. Numeric theme tokens use the explicit three-tier pattern. Spec §2.6.

**`Reveal` needs `disabled` when a list re-renders from a user action** (filter, sort,
tab) rather than from scrolling. Otherwise results start invisible and the 1200ms failsafe
becomes the primary path — the list sits blank for over a second. See `/work`.

**Scroll must go through `useScrollTo`**, never `window.scrollTo`. Lenis holds its own
target position and will animate back.

**Sections must clip.** `Section` handles it, but any new section that renders decoration
outside that component can push the document wider than the viewport and break centring
everywhere.

**One signature scroll effect per page** (pinned or scrubbed). Home's is the process
timeline spine; About's is the story timeline spine. More than one per page makes it feel
unresponsive.

**Prices are looked up, never restated.** `pricingTiers` carries a numeric `amount` and
derives its display string from it. `/process`, `/pricing`'s estimator and `/contact`'s
minimum-budget note all read from it. Do not type `£28k` into a page.

**`innerText` returns text as rendered.** Every eyebrow is `text-transform: uppercase`, so
a case-sensitive assertion on a section label tests the stylesheet. Collapsed accordion
panels are unmounted, so they do not count toward word totals either. Both bit me while
writing `verify-pages`.

---

## Known open items

- **Bundle is ~680kB raw / ~227kB gzip in one chunk** (framer-motion + GSAP + router).
  Flagged in step 5, deferred to step 10. GSAP is used by three components and could load
  lazily.
- **No backend for the contact form.** An explicit non-goal (§1). `submitEnquiry` in
  `src/pages/Contact.jsx` is the single seam — it resolves the shape a real endpoint would,
  so wiring one is a one-function change. Do not add one without asking.
- **`ArchitectureDiagram`'s omitted-section branch is unreachable.** Every service now has
  a related case study, so the "no related work" path in `ServiceDetail` never runs.
  Defensive code kept, but nothing exercises it.
- **Playwright is not in `package.json`.** `npm run verify` needs it. It was installed for
  this session with `npm install --no-save playwright && npx playwright install chromium`,
  which deliberately leaves `package.json` alone. Add it properly when you want the suites
  in CI.
- **`src/dev/LayoutProbe.jsx` still exists** and is unmounted. Delete at final cutover.
- **Four `site-*.png` screenshots sit untracked in the repo root.** Not mine, not
  committed — decide whether they belong in the repo or in `.gitignore`.
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
