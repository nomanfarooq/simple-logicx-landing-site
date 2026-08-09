import { faqs } from "../content/faq";

const SITE = "SimpleLogicX";
const BASE_URL = "https://simplelogicx.com";

/**
 * Per-route metadata (§6 SEO).
 *
 * React 19 hoists <title>, <meta> and <link> rendered anywhere in the tree into
 * <head>, so no helmet-style library is needed — this is plain JSX with no
 * runtime, no context and no extra dependency.
 */
export default function Seo({
  title,
  description,
  path = "/",
  type = "website",
  jsonLd,
}) {
  const fullTitle = path === "/" ? `${SITE} — ${title}` : `${title} — ${SITE}`;
  const url = `${BASE_URL}${path}`;

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      <meta property="og:site_name" content={SITE} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />

      {/* Accepts one object or an array of them, so a page can declare several
          schema types without nesting <Seo> elements. */}
      {jsonLd &&
        (Array.isArray(jsonLd) ? jsonLd : [jsonLd]).map((block, i) => (
          <script
            key={i}
            type="application/ld+json"
            // Content is authored by us in src/content, never user input.
            dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
          />
        ))}
    </>
  );
}

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE,
  url: BASE_URL,
  description:
    "SimpleLogicX builds SaaS platforms, applied AI, mobile apps and enterprise cloud infrastructure.",
};

/**
 * FAQPage schema. Generated from the same content the FAQ section renders, so
 * the structured data can never claim answers the page does not show — which
 * is both a ranking penalty and, arguably, lying to the crawler.
 */
export const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

/**
 * Service schema for a service detail page. Generated from the same content
 * the page renders, for the same reason as faqJsonLd.
 */
export function serviceJsonLd(service) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.tagline,
    url: `${BASE_URL}/services/${service.slug}`,
    provider: { "@type": "Organization", name: SITE, url: BASE_URL },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `${service.title} capabilities`,
      itemListElement: service.pillars.map((p) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: p.title, description: p.body },
      })),
    },
  };
}

/**
 * Case study schema. Article rather than CreativeWork so the headline,
 * publisher and description map onto fields search engines actually use.
 */
export function caseStudyJsonLd(study) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: study.title,
    description: study.summary,
    url: `${BASE_URL}/work/${study.slug}`,
    author: { "@type": "Organization", name: SITE, url: BASE_URL },
    publisher: { "@type": "Organization", name: SITE, url: BASE_URL },
    about: study.services.map((s) => ({ "@type": "Thing", name: s })),
    datePublished: `${study.year}-01-01`,
  };
}

/**
 * Article schema for an insights post. `wordCount` and `timeRequired` come
 * from the derived values in content/insights.js rather than being restated,
 * so the structured data cannot claim a length the page does not have.
 */
export function articleJsonLd(post) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    url: `${BASE_URL}/insights/${post.slug}`,
    datePublished: post.date,
    dateModified: post.date,
    articleSection: post.tag,
    wordCount: post.words,
    // ISO 8601 duration — "6 min" becomes "PT6M".
    timeRequired: `PT${parseInt(post.readingTime, 10)}M`,
    author: {
      "@type": "Person",
      name: post.author.name,
      jobTitle: post.author.role,
      worksFor: { "@type": "Organization", name: SITE, url: BASE_URL },
    },
    publisher: { "@type": "Organization", name: SITE, url: BASE_URL },
  };
}

export function breadcrumbJsonLd(trail) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      item: `${BASE_URL}${t.path}`,
    })),
  };
}
