import { Link, Navigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Section from "../components/ui/Section";
import ArticleBody, { headings } from "../components/ui/ArticleBody";
import Reveal from "../components/motion/Reveal";
import Seo, { breadcrumbJsonLd } from "../lib/seo";
import { useScrollTo } from "../hooks/useLenisInstance";
import { legalDocs, legalSlugs } from "../content/legal";

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/**
 * Legal pages share one component, selected by an explicit `doc` prop from the
 * route config rather than a URL param — the set is closed and known, so an
 * unknown legal slug should not be reachable in the first place.
 *
 * Bodies render through ArticleBody, the same renderer the insights pages use.
 * Legal copy is long-form prose with headings and lists; giving it a second
 * renderer would mean two places to keep the typography correct.
 *
 * The draft notice is rendered from content, not hardcoded here. Removing it
 * is then a deliberate edit to `notice` in content/legal.js — the moment
 * counsel has actually signed the copy off — rather than something that can
 * happen by accident during a layout change.
 */
export default function Legal({ doc }) {
  const scrollTo = useScrollTo();
  const meta = legalDocs[doc];

  // Defensive: the router only ever passes a known slug, but a typo in a new
  // route should land on 404 rather than silently render the privacy policy
  // under a terms URL.
  if (!meta) return <Navigate to="/404" replace />;

  const toc = headings(meta.body);

  return (
    <>
      <Seo
        title={meta.title}
        description={meta.description}
        path={`/legal/${doc}`}
        jsonLd={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: meta.title, path: `/legal/${doc}` },
        ])}
      />

      <PageHeader
        eyebrow="Legal"
        title={meta.title}
        lead={meta.intro}
      >
        <p className="font-mono text-xs text-ink-muted">
          Last updated{" "}
          <time dateTime={meta.updated}>
            {dateFmt.format(new Date(meta.updated))}
          </time>
        </p>
      </PageHeader>

      <Section>
        <div className="grid gap-12 lg:grid-cols-[240px_1fr] lg:gap-16">
          <Reveal
            as="nav"
            aria-label="On this page"
            className="lg:sticky lg:top-28 lg:self-start"
          >
            <h2 className="font-mono text-xs uppercase tracking-wider text-accent">
              On this page
            </h2>
            <ol className="mt-4 flex flex-col gap-3 border-l border-line">
              {toc.map((h) => (
                <li key={h.id}>
                  {/* Real anchor, JS handler — a native hash jump sets
                      scrollTop directly and Lenis animates straight back. */}
                  <a
                    href={`#${h.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollTo(`#${h.id}`);
                    }}
                    className="-ml-px block border-l border-transparent pl-4 text-sm text-ink-muted transition-colors hover:border-accent hover:text-accent"
                  >
                    {h.text}
                  </a>
                </li>
              ))}
            </ol>

            <ul className="mt-8 flex flex-col gap-2 border-t border-line pt-6">
              {legalSlugs
                .filter((s) => s !== doc)
                .map((s) => (
                  <li key={s}>
                    <Link
                      to={`/legal/${s}`}
                      className="text-sm text-ink-muted transition-colors hover:text-accent"
                    >
                      {legalDocs[s].title}
                    </Link>
                  </li>
                ))}
            </ul>
          </Reveal>

          <Reveal delay={0.1} className="min-w-0 max-w-3xl">
            {meta.notice && (
              <p
                role="note"
                className="flex gap-3 rounded-(--radius-card) border border-[color:var(--color-coral)]/40 bg-surface p-5 text-sm text-ink-soft"
              >
                <AlertTriangle
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-[color:var(--color-coral)]"
                />
                <span>
                  <span className="font-medium text-ink">Draft. </span>
                  {meta.notice}
                </span>
              </p>
            )}

            <ArticleBody body={meta.body} className={meta.notice ? "mt-10" : ""} />
          </Reveal>
        </div>
      </Section>
    </>
  );
}
