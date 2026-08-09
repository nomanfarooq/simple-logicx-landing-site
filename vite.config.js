import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { siteIndex } from './src/content/siteIndex.js'

/**
 * Emit sitemap.xml from the derived site index (§6 SEO).
 *
 * Generated rather than checked in, for the same reason the 404 search runs
 * off siteIndex: a hand-written sitemap of a growing site is a list of URLs
 * that used to exist. Adding a service or an article puts it in the sitemap
 * with no second edit, and no page can be in one and missing from the other.
 *
 * /404 is omitted — it is a reachable route but submitting a "not found" page
 * for indexing is pointless, and robots.txt disallows it.
 */
function sitemap({ baseUrl }) {
  return {
    name: 'slx-sitemap',
    apply: 'build',
    generateBundle() {
      // Ordered by depth then path so the file diffs cleanly when content
      // is added, rather than reshuffling with the content file's order.
      const urls = siteIndex
        .map((e) => e.path)
        .filter((p) => p !== '/404')
        .sort((a, b) => a.split('/').length - b.split('/').length || a.localeCompare(b))

      const body = urls
        .map((path) => {
          // The home page is the entry point; section indexes change as work
          // and articles are added; leaf pages are essentially static.
          const priority = path === '/' ? '1.0' : path.split('/').length === 2 ? '0.8' : '0.6'
          return `  <url>\n    <loc>${baseUrl}${path === '/' ? '/' : path}</loc>\n    <priority>${priority}</priority>\n  </url>`
        })
        .join('\n')

      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`,
      })
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    sitemap({ baseUrl: 'https://simplelogicx.com' }),
  ],
  build: {
    // Lighthouse's valid-source-maps audit fails without these, and more to the
    // point a production stack trace from this bundle is unreadable otherwise.
    // They cost download bandwidth only when devtools is open.
    sourcemap: true,
    rollupOptions: {
      output: {
        /**
         * Split the vendor layer out of the entry chunk.
         *
         * Measured before: one 680kB / 227kB-gzip entry chunk, with Lighthouse
         * reporting ~104kB of it unused on every route and LCP at 3.3s against
         * a 2.0s budget. Route splitting was already working — the pages are
         * their own chunks — but everything shared sat in one file that had to
         * parse before anything rendered.
         *
         * Split on cache lifetime, not on size. react/router change when the
         * framework is upgraded; framer-motion and gsap change when the
         * animation layer does; app code changes on every deploy. Bundling
         * them together means a copy edit invalidates 227kB of vendor code
         * that did not change.
         *
         * gsap is deliberately its own chunk: it is used by three components
         * and nothing on a first paint depends on it, so the browser can fetch
         * it in parallel rather than blocking on it.
         */
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (/[\\/]node_modules[\\/]gsap/.test(id)) return 'gsap'
          if (/[\\/]node_modules[\\/](framer-motion|motion-dom|motion-utils)/.test(id))
            return 'motion'
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler|react-router)/.test(id))
            return 'react'
          return 'vendor'
        },
      },
    },
  },
})
