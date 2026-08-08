# Resume log — SimpleLogicX v2 rebuild

**Paused after step 7 of 10.** Branch `rebuild/v2-foundation`, **not pushed**.

Read this first, then `docs/SimpleLogicX_Rebuild_Spec.md` — the spec is the authority on
what to build and why; this file is only the bookmark.

---

## Where things stand

```
a4f42ea  Add full case study narratives and filterable work index      (step 7)
bcd5077  Update spec: mark step 6 complete
72509b2  Add service detail pages and two case studies                 (step 6)
feaca8b  Rebuild site foundation: fix centring and palette, …          (steps 1–5)
5294b6b  initial commit landing site                                   (v1, deleted in step 5)
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
| **8. About, Process, Pricing, Contact** | **next** |
| 9. Insights, Legal, 404 | not started |
| 10. Accessibility audit, Lighthouse, cross-browser, reduced-motion pass | not started |

All suites currently green: 46/46 routes, 14/14 work, 7/7 services, 20/20 interactions,
12/12 motion, 4/4 gradients.

---

## Pick up here

**Step 8 — About, Process, Pricing, Contact.** These are the thinnest pages on the site.

- **About** is the weakest: a two-paragraph placeholder with a literal "land in step 8"
  sentence in the copy. Needs story timeline, values, team grid, locations, careers.
  Content should go in `src/content/team.js` (does not exist yet), following the pattern
  of the other content files.
- **Process** and **Pricing** already reuse shared sections (`ProcessTimeline`,
  `pricingTiers`) and are in reasonable shape. Pricing could use the TCO calculator the
  spec mentions in §4.1; Process could use engagement-model detail.
- **Contact** ships a validated form with a pluggable submit handler. A backend is an
  explicit non-goal (§1) — do not add one without asking.

Grep for `step 8` and `step 9` in `src/pages/` — the placeholder pages say which step
fills them in, and those sentences must all be gone before step 10.

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
timeline spine. More than one makes a page feel unresponsive.

---

## Known open items

- **Bundle is ~642kB raw / ~200kB gzip in one chunk** (framer-motion + GSAP + router).
  Flagged in step 5, deferred to step 10. GSAP is used by two components and could load
  lazily.
- **`ArchitectureDiagram`'s omitted-section branch is unreachable.** Every service now has
  a related case study, so the "no related work" path in `ServiceDetail` never runs.
  Defensive code kept, but nothing exercises it.
- **Playwright is not in `package.json`.** `npm run verify` needs
  `npm install -D playwright && npx playwright install chromium` first. Left out
  deliberately — add it when you want the suites in CI.
- **`src/dev/LayoutProbe.jsx` still exists** and is unmounted. Delete at final cutover.
- **Nothing is pushed.** Remote is `git@github.com:nomanfarooq/simple-logicx-landing-site.git`,
  default branch `main`.

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
