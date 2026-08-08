import { chromium } from 'playwright'
const BASE = process.env.URL || 'http://localhost:4173'
const b = await chromium.launch()
let fail = 0
const ok = (c, m) => { if (c) console.log('PASS ' + m); else { fail++; console.log('FAIL ' + m) } }

// --- desktop: mega menu hover / keyboard / escape ---
let ctx = await b.newContext({ viewport: { width: 1440, height: 900 } })
let p = await ctx.newPage()
await p.goto(BASE + '/', { waitUntil: 'networkidle' })

const trigger = p.locator('header a[aria-expanded]').first()
await trigger.hover()
await p.waitForTimeout(350)
ok((await trigger.getAttribute('aria-expanded')) === 'true', 'mega menu opens on hover')
ok(await p.locator('header a[href="/services/saas"]').isVisible(), 'mega menu shows service links')

await p.keyboard.press('Escape')
await p.waitForTimeout(300)
ok((await trigger.getAttribute('aria-expanded')) === 'false', 'Escape closes mega menu')
ok(
  await p.evaluate(() => document.activeElement?.hasAttribute('aria-expanded')),
  'Escape returns focus to trigger',
)

// keyboard focus (no pointer) also opens it
await p.mouse.move(700, 600)
await p.evaluate(() => document.activeElement?.blur())
await p.waitForTimeout(300)
await p.evaluate(() => document.querySelector('header a[aria-expanded]').focus())
await p.waitForTimeout(350)
ok((await trigger.getAttribute('aria-expanded')) === 'true', 'mega menu opens on keyboard focus')

// clicking the trigger navigates to the index instead of fighting the hover
await trigger.click()
await p.waitForTimeout(800)
ok(await p.evaluate(() => location.pathname) === '/services', 'trigger click navigates to /services')

// --- theme toggle + persistence ---
await p.goto(BASE + '/', { waitUntil: 'networkidle' })
const before = await p.evaluate(() => getComputedStyle(document.body).backgroundColor)
await p.locator('header button[aria-pressed]').click()
await p.waitForTimeout(400)
const after = await p.evaluate(() => getComputedStyle(document.body).backgroundColor)
ok(before !== after, `theme toggle changes background (${before} -> ${after})`)
const stored = await p.evaluate(() => localStorage.getItem('slx-theme'))
ok(stored === 'light' || stored === 'dark', `theme persisted to localStorage (${stored})`)
await p.reload({ waitUntil: 'networkidle' })
await p.waitForTimeout(300)
ok(
  (await p.evaluate(() => getComputedStyle(document.body).backgroundColor)) === after,
  'theme survives reload (no flash back)',
)
// --- FAQ accordion a11y ---
await p.goto(BASE + '/', { waitUntil: 'networkidle' })
const faqBtn = p.locator('button[aria-controls]:has-text("How quickly can you start?")').first()
await faqBtn.scrollIntoViewIfNeeded()
await p.waitForTimeout(400)
ok((await faqBtn.getAttribute('aria-expanded')) === 'false', 'accordion starts collapsed')
const panelId = await faqBtn.getAttribute('aria-controls')
ok((await p.locator(`#${panelId}`).count()) === 0, 'collapsed panel is not in the DOM (no phantom tab stops)')
await faqBtn.click()
await p.waitForTimeout(500)
ok((await faqBtn.getAttribute('aria-expanded')) === 'true', 'accordion opens')
ok(await p.locator(`#${panelId}[role="region"]`).isVisible(), 'panel exposed as a labelled region')
// single-open behaviour
const faqBtn2 = p.locator('button[aria-controls]:has-text("Who owns the intellectual property?")').first()
await faqBtn2.click()
await p.waitForTimeout(500)
ok((await faqBtn.getAttribute('aria-expanded')) === 'false', 'opening another item closes the first')
await ctx.close()

// --- mobile menu: open, focus trap, escape, scroll lock ---
ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true })
p = await ctx.newPage()
await p.goto(BASE + '/', { waitUntil: 'networkidle' })
const burger = p.locator('header button[aria-label="Open navigation"]')
ok(await burger.isVisible(), 'burger visible on mobile')
await burger.click()
await p.waitForTimeout(450)
ok(await p.locator('[role="dialog"]').isVisible(), 'mobile menu opens as dialog')
ok(await p.evaluate(() => document.body.style.overflow === 'hidden'), 'body scroll locked')
ok(
  await p.evaluate(() =>
    document.querySelector('[role=dialog]')?.contains(document.activeElement),
  ),
  'focus moved into dialog',
)
await p.keyboard.press('Escape')
await p.waitForTimeout(450)
ok((await p.locator('[role="dialog"]').count()) === 0, 'Escape closes mobile menu')
ok(await p.evaluate(() => document.body.style.overflow !== 'hidden'), 'body scroll restored')
await ctx.close()

// --- screenshots ---
for (const [theme, w, h, name] of [
  ['dark', 1440, 1000, 'home-dark'],
  ['light', 1440, 1000, 'home-light'],
  ['dark', 390, 844, 'home-mobile'],
]) {
  const c = await b.newContext({ colorScheme: theme, viewport: { width: w, height: h } })
  const pg = await c.newPage()
  await pg.goto(BASE + '/', { waitUntil: 'networkidle' })
  await pg.waitForTimeout(900)
  await pg.screenshot({ path: `site-${name}.png` })
  await c.close()
}

// mega menu open, for the screenshot record
{
  const c = await b.newContext({ colorScheme: 'dark', viewport: { width: 1440, height: 800 } })
  const pg = await c.newPage()
  await pg.goto(BASE + '/', { waitUntil: 'networkidle' })
  await pg.locator('header a[aria-expanded]').first().hover()
  await pg.waitForTimeout(600)
  await pg.screenshot({ path: 'site-megamenu.png' })
  await c.close()
}

await b.close()
console.log(fail === 0 ? '\nALL INTERACTION CHECKS PASSED' : `\n${fail} FAILED`)
process.exit(fail ? 1 : 0)
