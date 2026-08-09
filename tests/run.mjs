import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { build, preview, createServer } from "vite";

/**
 * Verification runner.
 *
 * Servers are started through Vite's Node API rather than by spawning `npx
 * vite` — killing a spawned npm/npx process tree is unreliable on Windows and
 * tends to leave an orphaned server holding the port, which then makes the
 * next run fail against stale output.
 *
 * Two servers because the suites need different things:
 *   preview (4173) — production build, which is what most suites should test
 *   dev     (5199) — needed by verify-motion, which asserts against the
 *                    dev-only window.__SLX handle exposed in lib/gsap.js
 */

const here = dirname(fileURLToPath(import.meta.url));

const PREVIEW_SUITES = [
  "verify-routes.mjs",
  "verify-services.mjs",
  "verify-work.mjs",
  "verify-pages.mjs",
  "verify-interactions.mjs",
  "verify-nogreen.mjs",
  "sanity-green.mjs",
];
const DEV_SUITES = ["verify-motion.mjs"];

const only = process.argv.slice(2).filter((a) => !a.startsWith("-"));
const match = (name) =>
  only.length === 0 || only.some((o) => name.includes(o.replace(/\.mjs$/, "")));

function runSuite(file, url) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [join(here, file)], {
      stdio: "inherit",
      env: { ...process.env, URL: url },
    });
    child.on("exit", (code) => resolve({ file, ok: code === 0 }));
  });
}

const results = [];

console.log("\nBuilding…");
await build({ logLevel: "warn" });

const previewSuites = PREVIEW_SUITES.filter(match);
if (previewSuites.length) {
  const server = await preview({ preview: { port: 4173, strictPort: true } });
  const url = server.resolvedUrls.local[0].replace(/\/$/, "");
  console.log(`\nPreview server: ${url}\n`);
  for (const file of previewSuites) {
    console.log(`\n──────── ${file}`);
    results.push(await runSuite(file, url));
  }
  await server.close();
}

const devSuites = DEV_SUITES.filter(match);
if (devSuites.length) {
  // Vite's build() sets process.env.NODE_ENV = "production" on this process and
  // leaves it there. A dev server created afterwards inherits it, so
  // import.meta.env.DEV is false, the dev-only window.__SLX handle in
  // lib/gsap.js is stripped, and verify-motion fails on a handle that is
  // missing for build-order reasons rather than for anything it is testing.
  process.env.NODE_ENV = "development";

  const server = await createServer({
    server: { port: 5199, strictPort: true },
    logLevel: "warn",
  });
  await server.listen();
  const url = server.resolvedUrls.local[0].replace(/\/$/, "");
  console.log(`\nDev server: ${url}\n`);
  for (const file of devSuites) {
    console.log(`\n──────── ${file}`);
    results.push(await runSuite(file, url));
  }
  await server.close();
}

console.log("\n════════ summary");
for (const r of results) {
  console.log(`${r.ok ? "  ok  " : " FAIL "} ${r.file}`);
}
const failed = results.filter((r) => !r.ok);
console.log(
  failed.length === 0
    ? `\nAll ${results.length} suites passed.\n`
    : `\n${failed.length} of ${results.length} suites failed.\n`,
);
process.exit(failed.length ? 1 : 0);
