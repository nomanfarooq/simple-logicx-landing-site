import { services } from "./services";
import { caseStudies } from "./caseStudies";
import { insights } from "./insights";
import { legalDocs } from "./legal";

/**
 * Flat, searchable index of every reachable route.
 *
 * Derived from the content files rather than hand-listed, which is the whole
 * point: a hand-written index of a growing site is a list of things that used
 * to exist. Adding a service or an article puts it in search automatically.
 *
 * Used by the 404 page's search (§4.1). It is also the data a ⌘K command
 * palette would need — §4.3 asks for one and it has not been built.
 */

/** Routes with no content file behind them. The only hand-written part. */
const staticRoutes = [
  {
    title: "Home",
    path: "/",
    kind: "Page",
    keywords: "product engineering studio saas ai mobile cloud",
  },
  {
    title: "Services",
    path: "/services",
    kind: "Page",
    keywords: "capabilities what we do",
  },
  { title: "Work", path: "/work", kind: "Page", keywords: "case studies portfolio clients" },
  { title: "About", path: "/about", kind: "Page", keywords: "team story values careers hiring jobs locations offices" },
  { title: "Process", path: "/process", kind: "Page", keywords: "engagement model discovery build cadence deliverables" },
  { title: "Pricing", path: "/pricing", kind: "Page", keywords: "cost rates estimator budget tiers discovery product team enterprise" },
  { title: "Contact", path: "/contact", kind: "Page", keywords: "enquiry email get in touch book a call" },
  { title: "Insights", path: "/insights", kind: "Page", keywords: "blog articles writing engineering" },
];

export const siteIndex = [
  ...staticRoutes,

  ...services.map((s) => ({
    title: s.title,
    path: `/services/${s.slug}`,
    kind: "Service",
    keywords: `${s.tagline} ${s.stack.join(" ")}`,
  })),

  ...caseStudies.map((c) => ({
    title: c.title,
    path: `/work/${c.slug}`,
    kind: "Case study",
    keywords: `${c.client} ${c.sector} ${c.summary} ${c.stack.join(" ")}`,
  })),

  ...insights.map((i) => ({
    title: i.title,
    path: `/insights/${i.slug}`,
    kind: "Article",
    keywords: `${i.tag} ${i.excerpt} ${i.author.name}`,
  })),

  ...Object.entries(legalDocs).map(([slug, d]) => ({
    title: d.title,
    path: `/legal/${slug}`,
    kind: "Legal",
    keywords: d.description,
  })),
];

/**
 * Substring match over title and keywords, ranked so a title hit beats a
 * keyword hit and an earlier match beats a later one.
 *
 * Deliberately not fuzzy. A fuzzy matcher on ~20 entries returns something for
 * every query, including nonsense, which on a 404 page reads as the site
 * guessing rather than answering. An empty result that says so is more useful.
 */
export function searchSite(query, limit = 6) {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];

  return siteIndex
    .map((entry) => {
      const title = entry.title.toLowerCase();
      const inTitle = title.indexOf(q);
      if (inTitle === 0) return { entry, score: 0 };
      if (inTitle > 0) return { entry, score: 1 + inTitle / 100 };
      const inKeywords = `${entry.kind} ${entry.keywords}`.toLowerCase().indexOf(q);
      if (inKeywords >= 0) return { entry, score: 10 + inKeywords / 100 };
      return null;
    })
    .filter(Boolean)
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)
    .map((r) => r.entry);
}
