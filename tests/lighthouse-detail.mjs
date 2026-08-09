import { chromium } from "playwright";
import lighthouse from "lighthouse";

/**
 * Single-route Lighthouse drill-down.
 *
 * `lighthouse.mjs` reports scores across routes; this prints the item-level
 * detail behind one route's failing audits — which element shifted, which
 * control's name mismatches its label, which bytes went unused. That detail is
 * what actually names a fix, and it is far too verbose to print for six routes.
 *
 * Run:  ROUTE=/pricing node tests/lighthouse-detail.mjs
 *       ROUTE=/ AUDITS=layout-shifts,unused-javascript node tests/lighthouse-detail.mjs
 *
 * Needs a server on URL (default http://localhost:4173).
 */

const BASE = process.env.URL || "http://localhost:4173";
const ROUTE = process.env.ROUTE || "/";
const PORT = 9223;

const AUDITS = process.env.AUDITS?.split(",") ?? [
  "layout-shifts",
  "cumulative-layout-shift",
  "largest-contentful-paint-element",
  "label-content-name-mismatch",
  "aria-prohibited-attr",
  "robots-txt",
  "unused-javascript",
  "render-blocking-resources",
];

const browser = await chromium.launch({
  args: [`--remote-debugging-port=${PORT}`],
});

const { lhr } = await lighthouse(BASE + ROUTE, {
  port: PORT,
  output: "json",
  logLevel: "error",
  formFactor: "mobile",
  screenEmulation: {
    mobile: true,
    width: 412,
    height: 823,
    deviceScaleFactor: 1.75,
    disabled: false,
  },
  throttlingMethod: "simulate",
});

await browser.close();

console.log(`\n════════ ${ROUTE}\n`);
for (const id of AUDITS) {
  const a = lhr.audits[id];
  if (!a) {
    console.log(`\n### ${id} — not present in this run`);
    continue;
  }
  console.log(`\n### ${id} — score ${a.score} ${a.displayValue ?? ""}`);
  const items = a.details?.items ?? [];
  if (!items.length) {
    console.log("  (no items)");
    continue;
  }
  console.log(JSON.stringify(items.slice(0, 8), null, 1).slice(0, 4000));
}
