import { chromium, firefox, webkit } from "playwright";

/**
 * Cross-browser pass (§11 step 10).
 *
 * Everything else in tests/ runs in Chromium only. This suite re-runs the
 * assertions whose outcome genuinely differs by engine, in all three.
 *
 * What is checked here is not arbitrary — each one is a place this codebase
 * has a documented reason to expect divergence:
 *
 *   layout          The defect the whole rebuild exists to fix (§0.2). It was
 *                   caused by cascade-layer precedence, and @layer support is
 *                   the single most engine-dependent thing in the stylesheet.
 *   light-dark()    Used for every colour token (§2.6). Shipped in Safari 17.5
 *                   and Firefox 120 — recent enough that an unsupported build
 *                   would render every token as its fallback and the site
 *                   would be unreadable rather than subtly wrong.
 *   skip link       Step 10 part 1 made <main> focusable specifically because
 *                   Chromium moves the sequential focus starting point to a
 *                   fragment target and Firefox and Safari do not. That fix is
 *                   untestable in the browser it was not written for.
 *   Lenis + GSAP    One shared ticker (§5.2). Asserted functionally — scroll
 *                   the page and require that it actually moved — because the
 *                   dev-only handle the motion suite uses is stripped from the
 *                   production build this runs against.
 *   ⌘K palette      Keyboard-only, and modifier-key handling is the classic
 *                   place WebKit differs.
 *
 * A caveat that must not be lost: Playwright's `webkit` is a Playwright build
 * of WebKit, not shipping Safari. It shares WebCore and JavaScriptCore, so it
 * catches engine-level differences, but it is not proof about Safari on macOS
 * or iOS. Treat a pass here as "no engine-level defect found", not as
 * "verified on Safari".
 */

const BASE = process.env.URL || "http://localhost:4173";

const WIDTHS = [375, 768, 1440, 2560];

const ENGINES = [
  ["chromium", chromium],
  ["firefox", firefox],
  ["webkit", webkit],
];

let failures = 0;
let checks = 0;

function check(engine, name, ok, detail = "") {
  checks++;
  if (!ok) {
    failures++;
    console.log(`   FAIL  [${engine}] ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

for (const [engineName, launcher] of ENGINES) {
  console.log(`\n──────── ${engineName}`);
  const browser = await launcher.launch();

  // ---- layout: zero overflow and symmetric gutters -----------------------
  // The v1 bug was invisible below 1280px, so the wide widths are the ones
  // that matter. Both themes, because the token layer differs between them.
  for (const theme of ["dark", "light"]) {
    const context = await browser.newContext({ colorScheme: theme });
    const page = await context.newPage();

    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
      await page.waitForTimeout(250);

      const m = await page.evaluate(() => {
        const doc = document.documentElement;
        // clientWidth, not window.innerWidth. innerWidth includes the
        // scrollbar gutter, and WebKit reserves a classic 10px scrollbar
        // where Chromium and Firefox use an overlay of zero width — so an
        // innerWidth-based comparison reports a perfectly centred container
        // as 10px off, in exactly one engine. That is the measurement being
        // wrong, not the layout.
        const vw = doc.clientWidth;
        const containers = [...document.querySelectorAll("main .w-full")]
          .filter((el) => {
            const s = getComputedStyle(el);
            return s.marginInlineStart === "auto" || s.marginLeft !== "0px";
          })
          .slice(0, 12);
        const worst = containers.reduce((acc, el) => {
          const r = el.getBoundingClientRect();
          const delta = Math.abs(r.left - (vw - r.right));
          return Math.max(acc, delta);
        }, 0);
        return { overflow: doc.scrollWidth - vw, worstDelta: worst };
      });

      check(
        engineName,
        `overflow ${theme} @${width}`,
        m.overflow <= 0,
        `scrollWidth exceeds viewport by ${m.overflow}px`,
      );
      check(
        engineName,
        `gutters ${theme} @${width}`,
        m.worstDelta <= 1,
        `asymmetry ${m.worstDelta.toFixed(1)}px`,
      );
    }

    // ---- light-dark() token resolution ----------------------------------
    // If the function is unsupported the declaration is invalid and the token
    // falls back — which shows up as the wrong theme's ink on this theme's
    // background, i.e. an unreadable page rather than a subtle shift.
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    const tokens = await page.evaluate(() => {
      // Read the RESOLVED paint, not the custom property.
      //
      // getPropertyValue('--bg-base') returns the *specified* value — every
      // engine hands back the literal "light-dark(#fff,#050505)", because
      // custom properties substitute at use time, not at computed-value time.
      // Reading the token therefore tells you nothing about whether the engine
      // understands the function. Reading `background-color` off an element
      // that consumes it does: an engine without light-dark() drops the
      // declaration and paints transparent or the inherited colour.
      const body = getComputedStyle(document.body);
      const ink = body.color;
      const bg = body.backgroundColor;
      const lum = (v) => {
        const c = (v.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
        if (c.length !== 3) return null;
        // Alpha 0 means nothing was painted — the failure mode we are looking
        // for, not a valid colour.
        const a = (v.match(/[\d.]+/g) || [])[3];
        if (a !== undefined && Number(a) === 0) return null;
        return (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) / 255;
      };
      return { bg: lum(bg), ink: lum(ink), rawBg: bg, rawInk: ink };
    });

    check(
      engineName,
      `light-dark() paints ${theme}`,
      tokens.bg !== null && tokens.ink !== null,
      `body background-color "${tokens.rawBg}", color "${tokens.rawInk}"`,
    );
    if (tokens.bg !== null && tokens.ink !== null) {
      const correct = theme === "dark" ? tokens.ink > tokens.bg : tokens.ink < tokens.bg;
      check(
        engineName,
        `token polarity ${theme}`,
        correct,
        `bg lum ${tokens.bg?.toFixed(2)} vs ink lum ${tokens.ink?.toFixed(2)} — theme inverted`,
      );
    }

    await context.close();
  }

  // ---- cascade layers: utilities beat the base reset ---------------------
  // This is the exact mechanism of the v1 bug. If an engine ordered @layer
  // differently, margin-inline:auto would lose and centring would break.
  {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.setViewportSize({ width: 1920, height: 900 });
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    const margins = await page.evaluate(() => {
      const el = document.querySelector("main .w-full");
      if (!el) return null;
      const s = getComputedStyle(el);
      return { l: parseFloat(s.marginLeft), r: parseFloat(s.marginRight) };
    });
    check(
      engineName,
      "layered utilities win over base",
      margins !== null && margins.l > 0 && Math.abs(margins.l - margins.r) <= 1,
      margins ? `margins ${margins.l}/${margins.r}` : "no container found",
    );
    await context.close();
  }

  // ---- skip link ---------------------------------------------------------
  {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });

    // The skip link is focused directly rather than by pressing Tab.
    //
    // WebKit does not put links in the sequential tab order by default —
    // that is Safari's "Press Tab to highlight each item on a webpage"
    // preference, which ships off. So Tab lands on the first *button*
    // instead, and asserting "the skip link is the first tab stop" would
    // fail in WebKit on a correctly built page. That is a browser
    // preference, not a site defect, and it is not ours to fix.
    //
    // What IS ours is the part step 10 fixed: that activating the link
    // actually moves focus into <main>. That works identically in every
    // engine once <main> is focusable, and it is what this asserts.
    await page.evaluate(() => {
      const link = [...document.querySelectorAll("a")].find((a) =>
        /skip to content/i.test(a.textContent || ""),
      );
      link?.focus();
    });
    const skipFocused = await page.evaluate(
      () => document.activeElement?.textContent?.trim(),
    );
    check(
      engineName,
      "skip link exists and is focusable",
      /skip to content/i.test(skipFocused || ""),
      `focused "${skipFocused}"`,
    );

    await page.keyboard.press("Enter");
    await page.waitForTimeout(200);
    const landed = await page.evaluate(() => {
      const el = document.activeElement;
      return { id: el?.id, tag: el?.tagName };
    });
    check(
      engineName,
      "skip link moves focus into main",
      landed.id === "main" || landed.tag === "MAIN",
      `focus landed on <${landed.tag}${landed.id ? "#" + landed.id : ""}>`,
    );
    await context.close();
  }

  // ---- smooth scroll actually scrolls ------------------------------------
  // Functional, not structural: if Lenis and the GSAP ticker were not sharing
  // a clock the page would either not move or snap back.
  {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await page.waitForTimeout(300);
    await page.mouse.move(700, 500);
    for (let i = 0; i < 8; i++) await page.mouse.wheel(0, 400);
    await page.waitForTimeout(900);
    const y1 = await page.evaluate(() => window.scrollY);
    await page.waitForTimeout(600);
    const y2 = await page.evaluate(() => window.scrollY);
    check(engineName, "wheel scrolls the page", y1 > 200, `scrollY ${y1}`);
    check(
      engineName,
      "scroll settles (no fight between Lenis and native)",
      Math.abs(y2 - y1) < 60,
      `drifted ${Math.abs(y2 - y1).toFixed(0)}px after settling`,
    );
    await context.close();
  }

  // ---- command palette, keyboard only ------------------------------------
  {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await page.waitForTimeout(200);

    // Waits are on state, never on a fixed delay. The palette binds its
    // Escape listener in an effect that runs when it opens, so pressing
    // Escape before the open has committed is swallowed — which produced a
    // failure that reproduced only under load, in one engine. Waiting for the
    // dialog to exist makes the sequence deterministic instead of racing it.
    const DIALOG = '[role="dialog"][aria-label="Search the site"]';

    await page.keyboard.press("Control+k");
    const opened = await page
      .waitForSelector(DIALOG, { timeout: 5000 })
      .then(() => true)
      .catch(() => false);
    check(engineName, "Ctrl+K opens the palette", opened);

    if (opened) {
      // Focus moves in on a rAF after mount, so this waits for it rather than
      // sampling once. Bounded at 2s: if focus genuinely never arrives — the
      // real defect, a dialog you cannot type into — this still fails.
      const focusedInput = await page
        .waitForFunction(
          () => document.activeElement?.getAttribute("role") === "combobox",
          null,
          { timeout: 2000 },
        )
        .then(() => true)
        .catch(() => false);
      check(engineName, "focus lands in the combobox", focusedInput);

      await page.keyboard.type("pricing");
      await page.waitForTimeout(250);
      const first = await page.evaluate(() => {
        const opt = document.querySelector('[role="option"][aria-selected="true"]');
        return opt?.textContent || "";
      });
      check(
        engineName,
        "typing filters and selects a result",
        /pricing/i.test(first),
        `active option "${first.slice(0, 40)}"`,
      );

      await page.keyboard.press("Enter");
      await page.waitForTimeout(600);
      const url = page.url();
      check(
        engineName,
        "Enter navigates to the result",
        url.endsWith("/pricing"),
        `landed on ${url}`,
      );

      await page.keyboard.press("Control+k");
      await page.waitForSelector(DIALOG, { timeout: 5000 });
      await page.keyboard.press("Escape");
      const closed = await page
        .waitForSelector(DIALOG, { state: "detached", timeout: 5000 })
        .then(() => true)
        .catch(() => false);
      check(engineName, "Escape closes the palette", closed);
    }
    await context.close();
  }

  await browser.close();
  console.log(`   ${engineName} done`);
}

console.log("\n════════ cross-browser\n");
console.log(
  failures === 0
    ? `All ${checks} checks passed across chromium, firefox and webkit.\n`
    : `${failures} of ${checks} checks failed.\n`,
);
process.exit(failures ? 1 : 0);
