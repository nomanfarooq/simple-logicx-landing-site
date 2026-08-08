# SimpleLogicX — Rebuild & Fix Specification (v2)

**Status:** Spec only. No code is to be written until this document is approved.
**Supersedes:** `SimpleLogicX_Landing_Prompt.md` (that prompt produced v1; this document
corrects it and expands the scope from one page to a multi-page site).

---

## 0. Why v1 Failed — Audit of the Existing Build

This section is based on a read of the actual v1 source, not assumptions. Fixing the
right thing depends on it.

### 0.1 The "greenish" problem — CONFIRMED, root cause identified

The site does not look green because of one bad colour. It looks green because **the
primary brand gradient is literally a green ramp**, and it is repeated on every
high-attention element.

Evidence from v1 source:

| Gradient | Occurrences | Where |
|---|---|---|
| `from-cyan to-lime` | 10 | Navbar logo mark, navbar CTA, every primary button, stat counters, all section headings, footer logo |
| `from-cyan via-lime to-gold` | 3 | Hero H1, CTA H2, Process H2 |
| `from-lime` (various) | 6 | Section eyebrow badges |

Cyan `#44C5D8` interpolated to Lime `#94BC43` passes directly through the green band of
sRGB. There is no midpoint of that ramp that is not green. Because it is applied to the
logo, the H1, and every button, green becomes the site's perceived primary colour — even
though the palette also contains coral, gold and amber.

Compounding factors:
- `--color-cyan: #44C5D8` and `--color-lime: #94BC43` in v1 do not match the real logo
  values (`#35CCD9`, `#8FB641`). The v1 lime is duller and more olive, which reads as
  muddier green than the actual brand lime.
- The deep blue `#0A5A7E` — the anchor of the real logo — **does not appear anywhere in
  the v1 codebase.** The palette was used without its darkest, most stabilising hue,
  leaving cyan as the coolest colour on the page with nothing to ground it.

**The fix is not "use less green." It is: re-anchor every gradient on the blue axis
(`#0A5A7E → #35CCD9`), and demote lime to a sparse, isolated accent that never appears in
a gradient alongside cyan.** Full rules in §2.3. Gradients stay — the user likes them —
they just stop ramping through green.

### 0.2 The "left floated / not centred" problem — ROOT CAUSE CONFIRMED

> **RESOLVED.** This section originally listed three candidates. The bug has since been
> reproduced and root-caused in a headless browser. The answer is below; the original
> diagnostic is kept because it is still the right first move on any future recurrence.

**Root cause: v1's `src/index.css` opens with an unlayered universal reset.**

```css
* {
  margin: 0;            /*  <-- this line broke every container on the site  */
  padding: 0;
  box-sizing: border-box;
}
```

Tailwind v4 emits its utilities inside `@layer utilities`. This reset is written **outside
any layer**, and in the CSS cascade *unlayered styles beat layered styles regardless of
specificity or source order*. So `* { margin: 0 }` overrides `.mx-auto { margin-inline:
auto }` on every element, on every page. **Every `mx-auto` in v1 was dead.**

Measured at 1440px, before the fix — note `marginL/R` is `0px/0px` on elements that all
carry `mx-auto`:

```
delta  width  gapL  gapR   marginL/R    owner    class
 -160   1280     0   160   0px/0px      nav      max-w-7xl mx-auto px-6 py-4 …
 -160   1280     0   160   0px/0px      section  max-w-7xl mx-auto px-6
 -672    768     0   672   0px/0px      section  max-w-3xl mx-auto
 -288   1152     0   288   0px/0px      section  grid md:grid-cols-3 … max-w-6xl mx-auto
 -160   1280     0   160   0px/0px      footer   max-w-7xl mx-auto px-6 py-20
```

Every container is flush left (`gapL=0`) with all the slack dumped on the right — which is
exactly "left floated, not centred". Neutralising *only* that reset (`* { margin:
revert-layer }`) immediately restored `margin: 346.281px / 346.266px` and perfect
centring, with no other change. That is the whole bug.

Two things worth noting, because they explain why this was so hard to spot:

- **It is invisible below 1280px.** At 375/768/1024 the container fills the viewport, so
  `mx-auto` has no free space to distribute and its absence changes nothing. The bug only
  appears once the viewport exceeds `max-w-7xl` — i.e. on the developer's large monitor,
  and nowhere in the responsive checks.
- **It is a Tailwind v3 → v4 migration trap.** This exact reset was harmless in v3, where
  utilities were effectively unlayered and won on source order. v4's real `@layer`
  architecture silently inverted the outcome. The markup, the classes and the config are
  all correct; only the cascade changed.

**The v2 fix:** the reset is gone. `styles/index.css` sets only `min-width: 0` on `*`
(which collides with no utility), and lets Tailwind's own Preflight — correctly placed in
`@layer base` — handle margin normalisation, so utilities still win. Verified: 14/14
breakpoint × theme combinations pass with `overflow=0` and `Δ=0` on all nine containers.

**Rule going forward:** never write unlayered global resets in a Tailwind v4 project. If a
global base rule is genuinely needed, put it in `@layer base`.

---

*Original diagnostic, retained for future use:*

Every section in v1 does use `max-w-7xl mx-auto px-6`, and all four sections that carry
absolutely-positioned blur orbs do have `relative` on the section. Both marquees are
correctly wrapped in `overflow-hidden`. So the markup is not obviously wrong, and the
cause could not be pinned statically. **Run the diagnostic below to identify which
candidate is live.** Then apply §3, which eliminates all of them regardless.

Paste into the browser console on the running v1 site:

```js
// 1. Is the document wider than the viewport? (If yes → horizontal overflow.)
console.log('doc:', document.documentElement.scrollWidth, 'vw:', window.innerWidth)

// 2. If yes, name the offending elements:
[...document.querySelectorAll('*')].filter(el => {
  const r = el.getBoundingClientRect()
  return r.right > window.innerWidth + 1 || r.left < -1
}).slice(0, 20).forEach(el => console.log(el.className || el.tagName, el.getBoundingClientRect()))

// 3. Is the centred box actually centred in the viewport?
const c = document.querySelector('.max-w-7xl')
const r = c.getBoundingClientRect()
console.log('gap left:', r.left, 'gap right:', window.innerWidth - r.right)
```

Interpretation:
- **`scrollWidth > innerWidth`** → horizontal overflow. Some element bleeds past the
  right edge; `mx-auto` then centres inside the *wider document*, which visually shifts
  content left and leaves dead space on the right. This is the classic signature of the
  reported symptom. Check #2's output for the culprit.
- **Left gap ≈ right gap, but content still feels left** → not a bug; it is
  `max-w-7xl` (1280px) on an ultrawide display. The content block is genuinely centred but
  is a narrow column in a very wide window. Fix by widening the container scale (§3.2).
- **Left gap ≠ right gap with no overflow** → a `position: fixed` ancestor or a
  transform-created containing block is offsetting the box.

Contributing weaknesses found in v1 that the rebuild must not repeat:

1. `overflow-x: hidden` is declared on `body` only, never on `html`. This is fragile —
   it depends on overflow propagation and breaks in several browser/scroll-library
   combinations. Use `overflow-x: clip` on **both** `html` and `body`.
2. Four sections carry blur orbs with **no `overflow-hidden` on the section**:
   `Services.jsx`, `Testimonials.jsx`, `Pricing.jsx`, `ProcessTimeline.jsx`. On narrow and
   mid-width viewports a `w-[600px]` orb will bleed. Every section must clip.
3. The container string `max-w-7xl mx-auto px-6` is retyped in 12 places. One typo in one
   section produces exactly this bug and is invisible in review. Replace with a single
   `<Container>` component (§3.1).

### 0.3 Other defects to correct in the rebuild

- **Lenis stylesheet never imported.** `useLenis.jsx` imports the JS but not
  `lenis/dist/lenis.css`. Required in Lenis 1.x.
- **Lenis and GSAP ScrollTrigger are not connected.** Lenis drives scroll on its own RAF
  loop while ScrollTrigger listens to native scroll events. They will drift, and
  scroll-triggered animations will fire at the wrong positions. They must be wired
  together (§5.2).
- **`useLenis` returns `lenisRef.current`**, which is `null` on first render and never
  triggers a re-render. The value is unusable by consumers.
- **`useReducedMotion.jsx` exists but is imported by nothing.** All animation is
  unconditional. This is an accessibility failure and must be enforced globally (§5.4).
- **Hero's counter effect queries `document.querySelectorAll('[data-counter]')` globally**
  and creates ScrollTriggers that are never reverted on unmount.
- **`App.jsx` drives animations by querying hardcoded DOM ids** (`#process-step-0`,
  `#faq-list`, …) from a central `useEffect`. This breaks the moment a section is lazy
  loaded or reordered, and it is why the animation layer is brittle. Animations must live
  with the component that owns the element (§5.3).
- **Anchor `<a href="#x">` handlers call `window.scrollTo`**, bypassing Lenis entirely, so
  in-page navigation is not smooth-scrolled.
- **No `prefers-color-scheme` support, no theme token layer** — colours are hardcoded hex
  in `@theme` and raw `rgba()` in inline styles, so light mode is impossible without a
  rewrite. Hence §2.
- **Dependency drift:** the original prompt specified `framer-motion ^12`, `gsap ^3.15`,
  `lenis ^1.3`, `lucide-react ^1.26`, `react ^19.2`. The installed `package.json` has
  `framer-motion ^11.18`, `gsap ^3.12`, `lenis ^1.1`, `lucide-react ^0.469`, `react ^19.0`.
  Resolve deliberately (§7) — note `framer-motion` v12 is published as `motion`.

---

## 1. Scope of v2

Build a **multi-page** marketing site to international standard, replacing the current
single-scroll page.

Hard requirements:

1. Multi-page with real routing and per-page SEO — not anchor sections.
2. Layout is centred and symmetrical at every breakpoint, 320px → 2560px.
3. Dark **and** light mode, user-toggleable, respecting `prefers-color-scheme`, persisted.
4. Colour scheme re-anchored on the real logo palette; gradients retained, green demoted.
5. Scroll animations throughout (GSAP ScrollTrigger + Framer Motion + Lenis).
6. Built on the dependency set in `package.json` (plus the additions in §7).

Non-goals for v2: CMS integration, i18n, blog authoring pipeline, backend contact form
(the form ships as a validated UI with a pluggable submit handler).

---

## 2. Design System

### 2.1 Brand palette (authoritative)

Taken from the logo. These replace the v1 values.

| Token | Hex | Role |
|---|---|---|
| Deep Blue | `#0A5A7E` | **Primary anchor.** Gradient base, light-mode primary, headings, depth. |
| Cyan | `#35CCD9` | **Primary accent.** Interactive, links, focus, gradient head. |
| Lime | `#8FB641` | Restricted accent — success/positive only. Never gradient-paired with cyan. |
| Coral | `#F53F61` | Alert, "problem" side of comparisons, one CTA per page maximum. |
| Gold | `#E2C550` | Premium markers — ratings, popular plan, awards. |
| Amber | `#FCC653` | Warm secondary, pairs with gold only. |

### 2.2 Token architecture

Two layers. **Components must only ever reference semantic tokens**, never brand hex.
This is what makes light mode a config change rather than a rewrite.

Layer 1 — brand constants (theme-invariant):

```css
@theme {
  --color-blue-deep: #0A5A7E;
  --color-cyan:      #35CCD9;
  --color-lime:      #8FB641;
  --color-coral:     #F53F61;
  --color-gold:      #E2C550;
  --color-amber:     #FCC653;
}
```

Layer 2 — semantic tokens that flip per theme:

| Semantic token | Dark | Light |
|---|---|---|
| `--bg-base` | `#050505` | `#FFFFFF` |
| `--bg-raised` | `#0B0F12` | `#F6F9FB` |
| `--bg-sunken` | `#000000` | `#EDF3F6` |
| `--surface` | `rgb(255 255 255 / 0.04)` | `rgb(10 90 126 / 0.04)` |
| `--surface-hover` | `rgb(255 255 255 / 0.07)` | `rgb(10 90 126 / 0.07)` |
| `--border` | `rgb(255 255 255 / 0.10)` | `rgb(10 90 126 / 0.14)` |
| `--border-strong` | `rgb(255 255 255 / 0.18)` | `rgb(10 90 126 / 0.26)` |
| `--text-primary` | `#F2F7F9` | `#06222E` |
| `--text-secondary` | `rgb(242 247 249 / 0.72)` | `rgb(6 34 46 / 0.72)` |
| `--text-muted` | `rgb(242 247 249 / 0.48)` | `rgb(6 34 46 / 0.52)` |
| `--accent` | `#35CCD9` | `#0A5A7E` |
| `--accent-contrast` | `#04141B` | `#FFFFFF` |
| `--glow` | `rgb(53 204 217 / 0.22)` | `rgb(10 90 126 / 0.14)` |

Note the `--accent` flip: cyan is legible on near-black but fails contrast on white, so
light mode promotes deep blue to the interactive colour. Same brand, correct contrast.

Implementation: define light values on bare `:root`; override inside
`@media (prefers-color-scheme: dark)` guarded as `:root:not([data-theme="light"])`; then
override again under `:root[data-theme="dark"]` so an explicit toggle wins in both
directions. Never let a colour be defined *only* inside a media query.

### 2.3 Gradient rules — the anti-green contract

This is the single most important section for fixing the reported look.

**Approved gradients:**

| Name | Ramp | Use |
|---|---|---|
| `grad-primary` | `#0A5A7E → #35CCD9` | Logo mark, primary buttons, H1 keyword, stat counters, active states. **This is the workhorse — it replaces every `from-cyan to-lime` in v1.** |
| `grad-primary-wide` | `#062F42 → #0A5A7E → #35CCD9` | Large hero washes, aurora orbs, section backdrops. |
| `grad-warm` | `#E2C550 → #FCC653` | Premium/pricing highlights, rating stars. |
| `grad-alert` | `#F53F61 → #FCC653` | Comparison "before" column, urgency accents. Sparing. |

**`grad-spectrum` was specified, built, measured and removed.** The original plan
called for a four-stop cool→warm hero gradient. It cannot be built from this palette
without looking bad, and that is a property of the colours rather than a matter of taste.
Sampling 300 points across each rendered ramp (hue in degrees, saturation 0–1):

| Ramp | Green samples | Min saturation |
|---|---|---|
| `blue → cyan → amber → coral` | **42 / 300** (olive band) | 0.10 |
| `blue → cyan → coral → amber` | 0 | **0.10** (grey band) |
| `blue → cyan` (`grad-primary`) | 0 | **0.62** |

Cyan and the warm hues sit on opposite sides of the wheel, so a straight interpolation
between them must pass through either green (going via yellow) or grey (going via the
complementary axis). There is no third path in sRGB. Headlines use `grad-primary`, which
stays vivid across its whole length. **Do not reintroduce a multi-hue cool→warm ramp.**

**Forbidden:**
- Any gradient with lime as a stop. Lime is flat-fill only.
- `cyan → lime`, `cyan → gold`, `cyan → amber` (all traverse green/yellow-green).
- Any multi-hue cool→warm ramp, per the measurements above.

**Lime budget:** at most **two** lime elements per page, and only for genuinely positive
semantics — a checkmark in a feature list, a "live"/"available" status dot. Never on the
logo, never on a heading, never on a button. In v1 lime appeared 35 times; the target is
≤2 per page.

### 2.4 Typography

- Display / headings: **Space Grotesk** (600, 700) — geometric, technical, distinct from
  the Inter used by half the sites in the reference set.
- Body / UI: **Inter** (400, 500, 600) — variable font, `font-feature-settings: 'cv11', 'ss01'`.
- Mono: **JetBrains Mono** (400, 500) — code, metrics, technical labels.

Self-host via `@fontsource` or subset locally. Do **not** ship the v1 render-blocking
Google Fonts `<link>`; it costs ~300ms of LCP.

Fluid scale using `clamp()` so type never needs breakpoint overrides:

```
--text-hero:  clamp(2.75rem, 1.5rem + 5.5vw, 6.5rem)   /* line-height 0.95, ls -0.03em */
--text-h1:    clamp(2.25rem, 1.4rem + 3.6vw, 4.5rem)
--text-h2:    clamp(1.875rem, 1.3rem + 2.4vw, 3.25rem)
--text-h3:    clamp(1.375rem, 1.1rem + 1.1vw, 2rem)
--text-body:  clamp(1rem, 0.96rem + 0.2vw, 1.125rem)   /* line-height 1.65 */
```

### 2.5 Surface treatment

Retain the v1 aesthetic direction — it was the part that worked:
glassmorphism (`backdrop-blur-xl` + `--surface` + `--border`), aurora blur orbs, noise
overlay, large radii (`--radius-card: 1.5rem`, `--radius-pill: 999px`).

Two corrections for light mode:
- Noise overlay opacity: `0.035` dark, `0.02` light (it reads as dirt on white above that).
- Aurora orbs: `opacity 0.20` dark, `0.10` light, and they must use `grad-primary-wide`.

### 2.6 Verified implementation notes

Traps hit and resolved while building the token layer. All three were silent — nothing
warned, the build passed, and only measurement caught them.

**`light-dark()` is colour-only.** The semantic tokens in §2.2 use CSS `light-dark()`,
which gives all three theme states from one definition per token and keeps every value on
bare `:root`. But it resolves to a `<color>` and is *invalid anywhere a `<number>` is
expected*. `opacity: light-dark(0.012, 0.022)` is dropped at computed-value time and falls
back to `1` — which rendered the noise grain at full strength and turned `#050505` into
mid-grey. **Numeric tokens (`--noise-opacity`, `--orb-opacity`) must use the explicit
three-tier pattern**, not `light-dark()`. Colour tokens may use it freely.

**`--container-prose` does not override `max-w-prose`.** Tailwind ships a core
`max-w-prose` utility hardcoded to `65ch`; a same-named theme token does not win. The
container silently came out ~30px narrow *and* font-dependent. The token is therefore
named `--container-article` / `max-w-article`. Check the compiled CSS before assuming any
`--container-*` name is free.

**Noise must be desaturated.** Raw `feTurbulence` generates independent R/G/B channels —
i.e. coloured speckle. It scattered random green and magenta pixels over every surface,
which is actively counterproductive on a brand we are pulling away from green. Add
`<feColorMatrix type="saturate" values="0"/>` for true monochrome grain, and keep opacity
at or below ~0.025.

---

## 3. Layout System — the centring fix

### 3.1 One container component, used everywhere

Delete every hand-typed `max-w-7xl mx-auto px-6`. Replace with:

```
<Container size="default | wide | narrow | prose">
```

| Size | Max width | Use |
|---|---|---|
| `narrow` | 42rem / 672px | FAQ, legal, forms |
| `prose` | 48rem / 768px | Article body |
| `default` | 80rem / 1280px | Standard sections |
| `wide` | 96rem / 1536px | Hero, portfolio grids, full-bleed feature rows |

Internally: `width: 100%; margin-inline: auto; padding-inline: clamp(1.25rem, 4vw, 2.5rem)`.
`margin-inline: auto` (not `mx-auto` on an arbitrary div) plus an explicit `width: 100%`
guarantees symmetric centring even inside flex/grid parents — which is one of the
candidate causes in §0.2.

### 3.2 Global overflow guards

```css
html, body { overflow-x: clip; }   /* clip, not hidden — does not create a scroll container */
* { min-width: 0; }                /* prevents flex/grid children from refusing to shrink */
```

`min-width: 0` on all elements is the fix for the single most common source of unexplained
horizontal overflow in flex layouts, and v1 has no equivalent.

### 3.3 Section contract

Every `<Section>` must:
1. Be `position: relative` **and** `overflow: hidden` (fixes the four v1 sections that clip
   nothing — Services, Testimonials, Pricing, ProcessTimeline).
2. Get vertical rhythm from a token, not ad-hoc `py-32`:
   `--section-y: clamp(5rem, 10vw, 9rem)`.
3. Contain decorative orbs as `aria-hidden` siblings *inside* the clipped box.
4. Render children through `<Container>`.

### 3.4 Ultrawide behaviour

If the diagnostic in §0.2 shows content is centred but simply feels left-heavy, the cause
is a 1280px column on a 2560px display. Remedy: hero and portfolio use `size="wide"`
(1536px), and above 1920px the grid gains a column rather than growing gutters.

### 3.5 Breakpoints

`sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1536 · 3xl 1920`.
Verify centring at **320, 375, 768, 1024, 1440, 1920, 2560**.

---

## 4. Site Architecture — Multi-Page

### 4.1 Routes

| Route | Page | Purpose |
|---|---|---|
| `/` | Home | Positioning, proof, conversion |
| `/services` | Services index | All 7 capabilities |
| `/services/:slug` | Service detail | 7 pages: saas, ai, mobile, web, cloud, iot, enterprise |
| `/work` | Portfolio index | Filterable case studies |
| `/work/:slug` | Case study | Problem → approach → architecture → outcome |
| `/about` | About | Team, story, values, locations |
| `/process` | Process | Engagement model, timeline, deliverables |
| `/pricing` | Pricing | Tiers, engagement models, TCO calculator |
| `/contact` | Contact | Form, offices, booking, response SLA |
| `/insights` | Insights index | Article listing |
| `/insights/:slug` | Article | Long-form technical writing |
| `/legal/privacy`, `/legal/terms` | Legal | Compliance |
| `*` | 404 | Branded, with search + suggested routes |

### 4.2 Routing

`react-router-dom` v7 with `createBrowserRouter`. Every route lazy-loaded via
`React.lazy` + `Suspense`, except Home, which is eagerly bundled for LCP.

Required behaviours:
- **ScrollRestoration** — on route change, reset Lenis to `0` with `{ immediate: true }`.
  Using native `window.scrollTo` here will fight Lenis (a v1 bug).
- **Route transitions** — Framer Motion `AnimatePresence mode="wait"`, 220ms out / 320ms
  in, opacity + 12px Y. Must be skipped under reduced motion.
- **Focus management** — move focus to `<h1>` on navigation for screen readers.

### 4.3 Shared shell

- **Navbar** — sticky, transparent → glass on scroll, mega-menu for Services on desktop,
  full-screen overlay on mobile, theme toggle, active-route indicator.
- **Footer** — 4 columns, newsletter, social, locations, legal, status indicator.
- **CommandPalette** (`⌘K`) — route search. A strong differentiator for a technical
  audience and cheap to build with the existing deps.

### 4.4 Page composition

Sections are reusable and composed per page — not copy-pasted.

**Home:** Hero · TrustedBy · ServicesGrid · WhyChooseUs · ProcessTimeline · FeaturedWork ·
TechMarquee · Testimonials · PricingPreview · FAQ · CTA

**Service detail:** ServiceHero · Overview · Capabilities · TechStack · RelatedWork ·
ProcessMini · ServiceFAQ · CTA

**Case study:** CaseHero (metrics) · Challenge · Approach · ArchitectureDiagram · Results
(animated counters) · Testimonial · NextCase · CTA

**About:** AboutHero · Story timeline · Values · Team grid · Locations map · Careers · CTA

All copy must be professional and specific. No lorem ipsum. Case studies must be plausible
and internally consistent — named metrics, real-sounding stacks, believable timelines.

---

## 5. Motion System

### 5.1 Principles

- Every animation is entry-only and plays **once** — no replay on scroll-back.
- Durations 0.4–0.8s; easing `power3.out` (GSAP) / `[0.22, 1, 0.36, 1]` (Framer).
- Animate `transform` and `opacity` only. Never `top`/`left`/`width`/`height`.
- Target 60fps. Budget: ≤3 concurrently animating blur orbs per viewport.

### 5.2 Lenis ↔ GSAP wiring (v1 got this wrong)

They must share one RAF loop and one ticker, or scroll triggers fire at the wrong offsets:

```js
lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add((time) => lenis.raf(time * 1000))
gsap.ticker.lagSmoothing(0)
```

Lenis must be a singleton in a React context provider, exposed via `useLenisInstance()`,
and must import `lenis/dist/lenis.css`. All anchor navigation goes through
`lenis.scrollTo(target, { offset: -80 })`, never `window.scrollTo`.

### 5.3 Colocation

Each section owns its own animations in a `useGSAP`-style effect scoped with
`gsap.context(fn, scopeRef)` and reverted on unmount. **Delete the centralised
`useEffect` in `App.jsx` that queries hardcoded ids** — it is incompatible with lazy
loading and route changes.

### 5.4 Reduced motion — globally enforced

`useReducedMotion` exists in v1 and is used nowhere. In v2:
- Wrap the app in Framer's `MotionConfig` with `reducedMotion="user"`.
- Guard all GSAP with `ScrollTrigger.matchMedia` / `gsap.matchMedia()`.
- Disable Lenis smoothing entirely when the query matches.
- Under reduced motion, elements start at their final state — never invisible.

**Critical:** every scroll-reveal must have a fallback that guarantees visibility if JS
fails or a trigger never fires. Opacity-0-by-default with no fallback is how content
silently disappears.

### 5.5 Effect inventory

Retained from v1: mouse-follow glow, animated grid, floating aurora, infinite marquee,
counters, text reveal, magnetic buttons.

Added: horizontal-scroll case studies, card stacking on process, sticky storytelling on
service pages, morphing SVG blobs, page transitions, scroll-progress bar, image reveal
with clip-path.

Per-page cap: **one** signature scroll effect (pinning or horizontal scroll). More than
one makes the page feel unresponsive to input.

---

## 6. Quality Bar

**Accessibility (WCAG 2.2 AA):**
- Body text ≥4.5:1, large text ≥3:1 — **verify in both themes**. Cyan `#35CCD9` on white
  is ~1.9:1 and must never be body text in light mode (this is why `--accent` flips).
- Visible focus ring: `2px solid var(--accent)`, `outline-offset: 2px`. Never `outline: none`.
- Full keyboard operability; focus trap in mobile menu and command palette; skip link.
- Semantic landmarks, one `<h1>` per page, no heading level skips.
- All decorative orbs/noise `aria-hidden="true"`.

**Performance:**
- Lighthouse ≥95 across all four categories.
- LCP <2.0s, CLS <0.05, INP <200ms.
- Route-level code splitting; self-hosted subset fonts with `font-display: swap`.
- Images: AVIF/WebP, explicit dimensions, `loading="lazy"` below fold.
- `will-change` applied only during animation, removed on completion.

**SEO:** per-route `<title>`/meta/canonical/OG/Twitter; JSON-LD (`Organization`,
`Service`, `BreadcrumbList`, `FAQPage`, `Article`); `sitemap.xml`; `robots.txt`.

---

## 7. Dependencies

Multi-page routing is not possible with the current `package.json`. Additions:

```
react-router-dom   ^7      routing (required)
@fontsource-variable/inter, @fontsource/space-grotesk, @fontsource/jetbrains-mono
clsx + tailwind-merge      class composition
@gsap/react                useGSAP hook, correct cleanup
```

**Resolved as installed:** `gsap ^3.15.0`, `lenis ^1.3.26`, `@gsap/react ^2.1.2`,
`react-router-dom ^7.18.2` — the gsap and lenis versions match what the original prompt
asked for. **Staying on `framer-motion@11`** by decision: v12+ ships under the package
name `motion`, and mixing both is not an option. Revisit only if a v12-only feature is
genuinely needed.

---

## 8. Project Structure

```
src/
  app/            router.jsx, providers.jsx, layouts/
  pages/          Home/ Services/ Work/ About/ Process/ Pricing/ Contact/ Insights/ Legal/ NotFound/
  components/
    ui/           Button, Card, Badge, Container, Section, Heading, Input, Accordion, Tabs
    layout/       Navbar, Footer, MegaMenu, MobileMenu, ThemeToggle, CommandPalette, ScrollProgress
    motion/       Reveal, TextReveal, Magnetic, Counter, Marquee, ParallaxLayer, AuroraBackdrop
  sections/       composable, page-agnostic
  hooks/          useLenisInstance, useTheme, useReducedMotion, useMediaQuery, useScrollProgress
  lib/            gsap.js (single registration point), seo.jsx, cn.js
  content/        services.js, caseStudies.js, testimonials.js, pricing.js, faq.js, team.js
  styles/         index.css, theme.css, fonts.css
```

Content lives in `content/` as typed data, never inline in JSX — this is what makes 7
service pages and N case studies maintainable.

---

## 9. Theme Toggle Specification

1. On first load, read `localStorage.theme`; if absent, fall back to
   `matchMedia('(prefers-color-scheme: dark)')`.
2. Apply as `data-theme="dark|light"` on `<html>`.
3. **Inject a blocking inline script in `index.html` `<head>` that sets the attribute
   before first paint.** Without this there is a white flash on every load in dark mode.
4. Toggle in navbar: sun/moon icon, `aria-label`, morph transition.
5. On change, write to `localStorage` and update `<meta name="theme-color">`.
6. Add `color-scheme: dark light` so form controls and scrollbars follow the theme.
7. Suppress transitions during the switch by adding a `.theme-transition-off` class for
   one frame — otherwise every element animates its colour at once and it looks broken.

---

## 10. Acceptance Criteria

Layout
- [ ] `document.documentElement.scrollWidth === window.innerWidth` at 320/375/768/1024/1440/1920/2560
- [ ] Left and right gutters equal (±1px) on every page at every breakpoint
- [ ] No horizontal scrollbar anywhere, including during animations
- [ ] Every section clips its own decorative elements

Colour
- [ ] Zero occurrences of `cyan → lime` gradients in the codebase
- [ ] Deep Blue `#0A5A7E` is present and load-bearing
- [ ] ≤2 lime elements per page
- [ ] No multi-hue cool→warm gradient anywhere (§2.3)
- [ ] Every approved gradient passes the pixel-sampling green check
- [ ] Components reference semantic tokens only — no raw brand hex outside the theme layer

Theme
- [ ] No flash of wrong theme on load, in either mode
- [ ] Preference persists across reloads and routes
- [ ] AA contrast verified in **both** themes
- [ ] Every colour has a value defined on bare `:root`

Motion
- [ ] Lenis and ScrollTrigger share one ticker; triggers fire at correct offsets
- [ ] All GSAP contexts reverted on unmount; no leaked ScrollTriggers across routes
- [ ] `prefers-reduced-motion` honoured everywhere
- [ ] All content visible with JS disabled or animations failed
- [ ] Sustained 60fps while scrolling

Pages
- [ ] All 13 route patterns render with real content
- [ ] Per-route SEO metadata and JSON-LD present
- [ ] 404 handles unknown routes
- [ ] Route transitions do not break scroll position or focus

---

## 11. Build Order

1. ~~Tokens, theme layer, fonts, no-flash script, `Container`/`Section` primitives~~ **DONE**
2. ~~**Verify centring at all 7 widths before building anything else**~~ **DONE — 14/14
   pass (7 widths × 2 themes), `overflow=0`, `Δ=0` on all nine containers.** Harness lives
   at `src/dev/LayoutProbe.jsx`; delete at cutover. Root cause of the v1 bug recorded in
   §0.2.
3. ~~Router, layouts, navbar, footer, theme toggle~~ **DONE — 13 route patterns live,
   30/30 route checks and 15/15 interaction checks pass in both themes.** Includes
   mega-menu, mobile dialog, theme toggle with no-flash, route transitions, focus
   sentinel + live-region announcer, error boundary, per-route SEO and JSON-LD.
4. ~~Motion infrastructure (Lenis provider, GSAP registration, `Reveal` primitives)~~
   **DONE — 12/12 motion checks pass.** Lenis singleton with the stylesheet imported and
   sharing one ticker with ScrollTrigger (verified functionally: a live trigger receives
   updates from wheel-driven Lenis scroll). Primitives: `Reveal`/`RevealGroup`/`RevealItem`,
   `TextReveal`, `Counter`, `Magnetic`, `Marquee`, `ParallaxLayer`, `AuroraBackdrop`,
   `ScrollProgress`. Verified: no ScrollTrigger leak across nav cycles, seamless marquee
   geometry, zero content stranded below opacity 0.9, and Lenis fully disabled under
   reduced motion.
5. ~~Home page, section by section~~ **DONE — all 11 sections live; routes, interaction,
   motion and gradient suites all pass.** Sections are page-agnostic and shared:
   `ProcessTimeline` and `ServicesGrid` render on both Home and their own pages behind a
   `showHeader` prop, and `CTA` is reused across pages, so the two can never describe
   different content. Content moved to `src/content/*` (process, pricing, testimonials,
   faq, technologies, comparison). **The v1 tree was deleted at this point** — recoverable
   via `git checkout 5294b6b -- <path>`.
6. ~~Services index + 7 detail pages~~ **DONE — 7/7 service pages pass (382–472 words
   each, `Service` + `BreadcrumbList` schema).** Composition per §4.4: overview + proof
   metrics, four explained capabilities, stack, related work, process strip, service FAQ,
   onward navigation, CTA. Related case studies are derived from `caseStudies.js` by slug
   rather than listed on the service, so the two data sets cannot contradict each other.
   Two case studies added (Vantage Retail, Halden Energy) because mobile and web had no
   related work and `/work` was thin at three.
7. Work index + case studies
8. About, Process, Pricing, Contact
9. Insights, Legal, 404
10. Accessibility audit, Lighthouse, cross-browser, reduced-motion pass

---

## 12. Prompt for the Build Agent

> Build the SimpleLogicX website exactly as specified in
> `docs/SimpleLogicX_Rebuild_Spec.md`. Read the entire document first.
>
> This is a rebuild that corrects two confirmed defects in the previous version:
> content is not horizontally centred, and the palette reads green because the primary
> gradient ramps cyan→lime. §0 documents the evidence; §2.3 and §3 define the fixes.
> Both are non-negotiable.
>
> Run the diagnostic in §0.2 against the existing build first and report which candidate
> is live before writing layout code.
>
> Build in the order given in §11. Establish the token and layout primitives first and
> verify centring at all seven breakpoints before building any page. Use semantic tokens
> only — no raw brand hex in components. Every gradient must come from the approved list
> in §2.3.
>
> Produce complete, production-ready files. No placeholders, no lorem ipsum, no TODOs.
> All copy is professional marketing content written for a real audience.
>
> Every item in §10 must pass.
