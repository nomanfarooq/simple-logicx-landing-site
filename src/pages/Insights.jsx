import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Section from "../components/ui/Section";
import Reveal from "../components/motion/Reveal";
import CTA from "../sections/CTA";
import Seo, { breadcrumbJsonLd } from "../lib/seo";
import { insights, insightTags } from "../content/insights";
import { cn } from "../lib/cn";

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/**
 * Insights index.
 *
 * The filter follows /work: visible toggle buttons with counts rather than a
 * <select>, filtering client-side over a small in-memory list, and a live
 * region announcing the result count — a list changing length is silent to a
 * screen reader otherwise.
 *
 * The newest post gets a wider card. That is the only editorial hierarchy
 * here; with three articles, anything more elaborate is decoration.
 */
export default function Insights() {
  const [active, setActive] = useState("all");
  // See /work: scroll-reveal is right for the first paint and wrong for a
  // filter. Once the filter has been touched, results render immediately
  // rather than starting invisible and waiting on a scroll trigger.
  const [hasFiltered, setHasFiltered] = useState(false);

  const selectFilter = (tag) => {
    setHasFiltered(true);
    setActive(tag);
  };

  const filters = useMemo(
    () => [
      { tag: "all", label: "Everything", count: insights.length },
      ...insightTags.map((tag) => ({
        tag,
        label: tag,
        count: insights.filter((i) => i.tag === tag).length,
      })),
    ],
    [],
  );

  const visible = useMemo(
    () => (active === "all" ? insights : insights.filter((i) => i.tag === active)),
    [active],
  );

  return (
    <>
      <Seo
        title="Insights"
        description="Engineering writing from the SimpleLogicX team on frontend cascade layers, honest RAG evaluation and zero-downtime migration strategy."
        path="/insights"
        jsonLd={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Insights", path: "/insights" },
        ])}
      />

      <PageHeader
        eyebrow="Insights"
        title="Notes from the build"
        lead="Written by the engineers doing the work, about problems we actually hit. No thought leadership, no predictions for next year."
      />

      <Section>
        <Reveal>
          <div
            role="group"
            aria-label="Filter articles by topic"
            className="flex flex-wrap gap-2"
          >
            {filters.map((f) => {
              const selected = active === f.tag;
              return (
                <button
                  key={f.tag}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => selectFilter(f.tag)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-(--radius-pill) border px-4 py-2 text-sm font-medium transition-colors",
                    selected
                      ? "border-accent bg-surface-hover text-accent"
                      : "border-line text-ink-soft hover:border-accent/40 hover:text-ink",
                  )}
                >
                  {f.label}
                  <span
                    className={cn(
                      "font-mono text-xs",
                      selected ? "text-accent" : "text-ink-muted",
                    )}
                  >
                    {f.count}
                  </span>
                </button>
              );
            })}
          </div>
        </Reveal>

        <p aria-live="polite" className="sr-only">
          {visible.length} {visible.length === 1 ? "article" : "articles"} shown
        </p>

        <ul className="mt-10 flex flex-col gap-4">
          {visible.map((post, i) => (
            <li key={post.slug}>
              <Reveal
                direction="up"
                delay={hasFiltered ? 0 : i * 0.05}
                disabled={hasFiltered}
              >
                <Link
                  to={`/insights/${post.slug}`}
                  className={cn(
                    "group block rounded-(--radius-card) border border-line bg-surface p-7 transition-colors hover:border-accent/40 hover:bg-surface-hover",
                    // Newest post only, and only when nothing is filtered out —
                    // a "latest" treatment inside a filtered view is a lie.
                    i === 0 && active === "all" && "sm:p-10",
                  )}
                >
                  <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-ink-muted">
                    <span className="rounded-(--radius-pill) border border-line px-2.5 py-1 text-accent">
                      {post.tag}
                    </span>
                    <time dateTime={post.date}>
                      {dateFmt.format(new Date(post.date))}
                    </time>
                    <span>{post.readingTime} read</span>
                    <span>{post.author.name}</span>
                  </div>
                  <h2
                    className={cn(
                      "mt-4 font-display font-semibold text-ink transition-colors group-hover:text-accent",
                      i === 0 && active === "all" ? "text-2xl sm:text-3xl" : "text-2xl",
                    )}
                  >
                    {post.title}
                  </h2>
                  <p className="mt-2 max-w-3xl text-ink-muted">{post.excerpt}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-accent">
                    Read article
                    <ArrowRight
                      aria-hidden="true"
                      className="size-4 transition-transform group-hover:translate-x-1"
                    />
                  </span>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </Section>

      <CTA />
    </>
  );
}
