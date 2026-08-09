import { chromium } from "playwright";
import { createRequire } from "node:module";

/**
 * axe-core sweep — every route, both themes, plus the three overlay states.
 *
 * `verify-a11y` is hand-written and checks the things this project specifically
 * gets wrong. This suite exists because a hand-written audit grades its own
 * homework: it can only fail on defects someone already thought of. axe encodes
 * several hundred rules maintained by people who do this full time, and it
 * caught two real defects on the first run that `verify-a11y` had no check for
 * (WCAG 2.5.3 Label in Name on both logo links).
 *
 * They overlap deliberately and neither replaces the other — axe cannot assert
 * that focus moves to the right place on a route change, and it cannot open a
 * mega-menu. It is run against the overlays here for exactly that reason: axe
 * only ever sees the DOM as it stands, so a dialog that is never opened is a
 * dialog that is never audited.
 *
 * Tags are limited to the WCAG 2.x A/AA success criteria plus axe's
 * "best-practice" set. Experimental rules are excluded: they change between
 * releases, and a suite that fails on a dependency bump gets disabled.
 */

const require = createRequire(import.meta.url);
const AXE_PATH = require.resolve("axe-core/axe.min.js");

const BASE = process.env.URL || "http://localhost:4173";

const ROUTES = [
  "/",
  "/services",
  "/services/saas",
  "/services/ai",
  "/services/enterprise",
  "/work",
  "/work/northwind-logistics",
  "/about",
  "/process",
  "/pricing",
  "/contact",
  "/insights",
  "/insights/evaluating-rag-honestly",
  "/legal/privacy",
  "/legal/terms",
  "/this-route-does-not-exist",
];

const TAGS = [
  "wcag2a",
  "wcag2aa",
  "wcag21a",
  "wcag21aa",
  "wcag22aa",
  "best-practice",
];

/**
 * Colour-contrast is owned by `verify-contrast`, which composites the whole
 * ancestor stack and enumerates gradient stops. axe reads `background-color`
 * off the nearest painted ancestor and gives up ("incomplete") on anything
 * behind a gradient or a backdrop-filter, which describes most of this site.
 * Two contrast reports that disagree are worse than one that is trusted.
 */
const DISABLED = { "color-contrast": { enabled: false } };

const browser = await chromium.launch();
const problems = [];
let passCount = 0;

async function run(page, label) {
  const results = await page.evaluate(
    async ([tags, rules]) => {
      // eslint-disable-next-line no-undef
      return await window.axe.run(document, {
        runOnly: { type: "tag", values: tags },
        rules,
        resultTypes: ["violations"],
      });
    },
    [TAGS, DISABLED],
  );

  if (results.violations.length === 0) {
    passCount++;
    process.stdout.write(".");
    return;
  }

  process.stdout.write("x");
  for (const v of results.violations) {
    problems.push({
      where: label,
      id: v.id,
      impact: v.impact,
      help: v.help,
      nodes: v.nodes.slice(0, 3).map((n) => ({
        target: n.target.join(" "),
        html: n.html.slice(0, 160),
        why: (n.failureSummary || "").replace(/\s+/g, " ").slice(0, 220),
      })),
      count: v.nodes.length,
    });
  }
}

for (const theme of ["dark", "light"]) {
  const context = await browser.newContext({
    colorScheme: theme,
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  console.log(`\n${theme}:`);
  for (const route of ROUTES) {
    await page.goto(BASE + route, { waitUntil: "networkidle" });
    // Reveal animations settle; auditing mid-transition reports elements that
    // are momentarily opacity-0 and produces failures that do not reproduce.
    await page.waitForTimeout(400);
    await page.addScriptTag({ path: AXE_PATH });
    await run(page, `${theme} ${route}`);
  }

  await context.close();
}

// ---- overlay states -------------------------------------------------------
// axe only sees the DOM in front of it. The mega-menu, the mobile dialog and
// the command palette are all closed on every page load above, so without this
// block they would never be audited at all.
{
  const context = await browser.newContext({
    colorScheme: "dark",
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  console.log("\noverlays:");

  // Mega-menu open. The trigger is a Link, not a button — see the note in
  // MegaMenu.jsx about hover and click contradicting each other.
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.addScriptTag({ path: AXE_PATH });
  await page
    .locator("header")
    .getByRole("link", { name: /^services$/i })
    .first()
    .hover();
  await page.waitForTimeout(350);
  await run(page, "mega-menu open");

  // Command palette open.
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.addScriptTag({ path: AXE_PATH });
  await page.keyboard.press("Control+k");
  await page.waitForTimeout(350);
  await run(page, "command palette open");

  // Command palette with results.
  await page.keyboard.type("cloud");
  await page.waitForTimeout(250);
  await run(page, "command palette results");

  await context.close();

  // Mobile dialog open, at a width where the trigger exists.
  const mobile = await browser.newContext({
    colorScheme: "dark",
    viewport: { width: 390, height: 844 },
  });
  const mpage = await mobile.newPage();
  await mpage.goto(BASE + "/", { waitUntil: "networkidle" });
  await mpage.addScriptTag({ path: AXE_PATH });
  await mpage.getByRole("button", { name: /open navigation/i }).click();
  await mpage.waitForTimeout(350);
  await run(mpage, "mobile menu open");
  await mobile.close();
}

await browser.close();

console.log("\n\n════════ axe-core (WCAG 2.x A/AA + best-practice)\n");

if (problems.length === 0) {
  console.log(`All ${passCount} states clean — 0 violations.\n`);
  process.exit(0);
}

// Group by rule: the same defect in the shared shell reports once per route,
// and 16 copies of one footer bug reads as 16 bugs.
const byRule = new Map();
for (const p of problems) {
  if (!byRule.has(p.id)) byRule.set(p.id, { ...p, where: [p.where] });
  else byRule.get(p.id).where.push(p.where);
}

for (const [id, p] of byRule) {
  console.log(`\n● ${id} — ${p.impact} — ${p.help}`);
  console.log(`  ${p.where.length} state(s): ${p.where.slice(0, 4).join(", ")}${p.where.length > 4 ? " …" : ""}`);
  for (const n of p.nodes) {
    console.log(`    ${n.target}`);
    console.log(`      ${n.html}`);
    console.log(`      → ${n.why}`);
  }
}

console.log(
  `\n${byRule.size} distinct rule(s) violated across ${problems.length} of ${problems.length + passCount} states.\n`,
);
process.exit(1);
