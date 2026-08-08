import { chromium } from 'playwright'
const BASE = process.env.URL || 'http://localhost:4173'
const b = await chromium.launch()
const p = await (await b.newContext({ viewport:{width:1440,height:900} })).newPage()
let fail = 0
const ok = (c,m) => { if(c) console.log('PASS '+m); else { fail++; console.log('FAIL '+m) } }

const SLUGS = ['saas','ai','mobile','web','cloud','iot','enterprise']
const WITH_RELATED = ['saas','ai','mobile','web','cloud','iot','enterprise']

for (const slug of SLUGS) {
  await p.goto(`${BASE}/services/${slug}`, { waitUntil:'networkidle' })
  const h = await p.evaluate(() => document.body.scrollHeight)
  for (let y=0;y<h;y+=800){ await p.evaluate(v=>window.scrollTo(0,v),y); await p.waitForTimeout(90) }
  await p.waitForTimeout(500)

  const r = await p.evaluate(() => {
    const txt = document.querySelector('main').innerText
    return {
      pillars: document.querySelectorAll('main ol li, main ul li').length,
      hasRelated: /Where we have done this/.test(txt),
      hasStack: /What we build it with/.test(txt),
      hasProcess: /The same five phases/.test(txt),
      hasFaq: /objections buyers actually raise/.test(txt),
      hasOther: /Other services/.test(txt),
      faqButtons: document.querySelectorAll('button[aria-controls]').length,
      jsonLd: [...document.querySelectorAll('script[type="application/ld+json"]')]
        .map(s => JSON.parse(s.textContent)['@type']),
      words: txt.trim().split(/\s+/).length,
      hidden: [...document.querySelectorAll('main *')]
        .filter(e => parseFloat(getComputedStyle(e).opacity) < 0.9 && e.getBoundingClientRect().height > 4)
        .filter(e => !e.closest('[aria-hidden="true"]')).length,
    }
  })

  const shouldHaveRelated = WITH_RELATED.includes(slug)
  const problems = []
  if (!r.hasStack) problems.push('no stack')
  if (!r.hasProcess) problems.push('no process')
  if (!r.hasFaq) problems.push('no faq')
  if (!r.hasOther) problems.push('no onward nav')
  if (r.faqButtons < 3) problems.push(`faq buttons=${r.faqButtons}`)
  if (r.hasRelated !== shouldHaveRelated) problems.push(`related=${r.hasRelated} expected=${shouldHaveRelated}`)
  if (!r.jsonLd.includes('Service')) problems.push('no Service schema')
  if (!r.jsonLd.includes('BreadcrumbList')) problems.push('no breadcrumb')
  if (r.words < 380) problems.push(`thin content (${r.words} words)`)
  if (r.hidden > 0) problems.push(`${r.hidden} stranded elements`)

  ok(problems.length === 0,
    `${slug.padEnd(11)} ${String(r.words).padStart(4)} words | related=${r.hasRelated ? 'yes' : 'no '} | ld=[${r.jsonLd.join(',')}]` +
    (problems.length ? `\n       ${problems.join(', ')}` : ''))
}
await b.close()
console.log(fail === 0 ? '\nALL SERVICE PAGE CHECKS PASSED' : `\n${fail} FAILED`)
process.exit(fail ? 1 : 0)
