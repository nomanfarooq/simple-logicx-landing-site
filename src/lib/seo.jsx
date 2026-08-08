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
