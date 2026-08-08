import { chromium } from 'playwright'
const BASE = process.env.URL || 'http://localhost:4173'

/**
 * Automated guard for the anti-green contract (spec §2.3).
 *
 * Renders each approved gradient in a wide strip, samples it across its full
 * width, and converts every sample to HSL. Any pixel with a green-ish hue and
 * meaningful saturation is a violation — that is exactly the olive band that
 * made v1 read green.
 */

const GRADIENTS = ['grad-primary', 'grad-primary-wide', 'grad-warm', 'grad-alert']
const GREEN_MIN = 75   // degrees
const GREEN_MAX = 165
const SAT_FLOOR = 0.18 // below this it is effectively grey, not a green cast

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1000, height: 900 } })
const page = await ctx.newPage()
await page.goto(BASE + '/', { waitUntil: 'networkidle' })

const results = await page.evaluate(
  ({ GRADIENTS, GREEN_MIN, GREEN_MAX, SAT_FLOOR }) => {
    const host = document.createElement('div')
    host.style.cssText = 'position:fixed;left:0;top:0;z-index:99999'
    document.body.appendChild(host)

    const rgbToHsl = (r, g, b) => {
      r /= 255; g /= 255; b /= 255
      const max = Math.max(r, g, b), min = Math.min(r, g, b)
      const l = (max + min) / 2
      const d = max - min
      if (!d) return [0, 0, l]
      const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      let h
      if (max === r) h = ((g - b) / d + (g < b ? 6 : 0))
      else if (max === g) h = (b - r) / d + 2
      else h = (r - g) / d + 4
      return [h * 60, s, l]
    }

    const out = []
    for (const cls of GRADIENTS) {
      const el = document.createElement('div')
      el.className = cls
      el.style.cssText = 'width:900px;height:24px'
      host.appendChild(el)
      const image = getComputedStyle(el).backgroundImage

      // Paint the same gradient into a canvas so we can read pixels.
      const cv = document.createElement('canvas')
      cv.width = 900; cv.height = 1
      const cx = cv.getContext('2d')
      // Re-parse the computed gradient stops.
      const stops = [...image.matchAll(/rgba?\(([^)]+)\)\s*(\d+(?:\.\d+)?)%/g)].map((m) => {
        const [r, g, b] = m[1].split(',').map((n) => parseFloat(n))
        return { r, g, b, pos: parseFloat(m[2]) / 100 }
      })
      if (stops.length < 2) { out.push({ cls, error: 'could not parse stops', image }); continue }
      const grad = cx.createLinearGradient(0, 0, 900, 0)
      for (const s of stops) grad.addColorStop(s.pos, `rgb(${s.r},${s.g},${s.b})`)
      cx.fillStyle = grad
      cx.fillRect(0, 0, 900, 1)
      const data = cx.getImageData(0, 0, 900, 1).data

      const violations = []
      for (let x = 0; x < 900; x += 3) {
        const i = x * 4
        const [h, s] = rgbToHsl(data[i], data[i + 1], data[i + 2])
        if (h >= GREEN_MIN && h <= GREEN_MAX && s >= SAT_FLOOR) {
          violations.push({ x, hue: Math.round(h), sat: +s.toFixed(2),
            rgb: `${data[i]},${data[i + 1]},${data[i + 2]}` })
        }
      }
      out.push({ cls, samples: 300, violations })
    }
    host.remove()
    return out
  },
  { GRADIENTS, GREEN_MIN, GREEN_MAX, SAT_FLOOR },
)

let fails = 0
for (const r of results) {
  if (r.error) { fails++; console.log(`ERROR ${r.cls}: ${r.error}`); continue }
  if (r.violations.length === 0) {
    console.log(`PASS  ${r.cls.padEnd(20)} 0 green pixels of ${r.samples} samples`)
  } else {
    fails++
    const w = r.violations
    console.log(`FAIL  ${r.cls.padEnd(20)} ${w.length}/${r.samples} green samples`)
    console.log(`        worst: hue ${w[Math.floor(w.length / 2)].hue}° sat ${w[Math.floor(w.length / 2)].sat} rgb(${w[Math.floor(w.length / 2)].rgb}) at x=${w[Math.floor(w.length / 2)].x}`)
  }
}

await browser.close()
console.log(fails === 0 ? '\nANTI-GREEN CONTRACT UPHELD' : `\n${fails} GRADIENT(S) VIOLATE THE CONTRACT`)
process.exit(fails ? 1 : 0)
