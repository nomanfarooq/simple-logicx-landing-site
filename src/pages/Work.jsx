import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Section from "../components/ui/Section";
import Counter from "../components/motion/Counter";
import Reveal from "../components/motion/Reveal";
import CTA from "../sections/CTA";
import Seo, { breadcrumbJsonLd } from "../lib/seo";
import { caseStudies } from "../content/caseStudies";
import { serviceBySlug } from "../content/services";
import { cn } from "../lib/cn";

/**
 * Work index with service filtering.
 *
 * The filter is a group of toggle buttons rather than a <select>: there are
 * few options, they benefit from being visible, and each carries a count so
 * the user knows what a filter will yield before pressing it.
 *
 * Filtering is client-side over a small in-memory list, so it does not touch
 * the URL. If this grows to the point where a filtered view is worth sharing
 * or indexing, it should move to a search param.
 *
 * The result count is announced via a live region — a visual list changing
 * length is silent to a screen reader otherwise.
 */
export default function Work() {
  const [active, setActive] = useState("all");
  // Scroll-reveal is right for the first paint and wrong for filtering: results
  // the user explicitly asked for should appear at once, not fade in. Once the
  // filter has been touched, the list renders immediately.
  const [hasFiltered, setHasFiltered] = useState(false);

  const selectFilter = (slug) => {
    setHasFiltered(true);
    setActive(slug);
  };

  // Only offer filters that actually match something.
  const filters = useMemo(() => {
    const counts = new Map();
    for (const c of caseStudies) {
      for (const s of c.services) counts.set(s, (counts.get(s) ?? 0) + 1);
    }
    return [
      { slug: "all", label: "All work", count: caseStudies.length },
      ...[...counts.entries()]
        .map(([slug, count]) => ({
          slug,
          label: serviceBySlug[slug]?.title ?? slug,
          count,
        }))
        .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label)),
    ];
  }, []);

  const visible = useMemo(
    () =>
      active === "all"
        ? caseStudies
        : caseStudies.filter((c) => c.services.includes(active)),
    [active],
  );

  return (
    <>
      <Seo
        title="Case Studies"
        description="Selected engagements across supply chain, healthcare AI, fintech, retail and utilities — with the architecture and the numbers."
        path="/work"
        jsonLd={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Work", path: "/work" },
        ])}
      />

      <PageHeader
        eyebrow="Work"
        title="Projects that went to production"
        lead="Described the way engineers would describe them — including what was hard, what we decided, and what we would do differently."
      />

      <Section>
        {/* Filter */}
        <Reveal>
          <div
            role="group"
            aria-label="Filter case studies by service"
            className="flex flex-wrap gap-2"
          >
            {filters.map((f) => {
              const selected = active === f.slug;
              return (
                <button
                  key={f.slug}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => selectFilter(f.slug)}
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
          {visible.length} case {visible.length === 1 ? "study" : "studies"} shown
        </p>

        <ul className="mt-10 flex flex-col gap-5">
          {visible.map((c, i) => (
            <li key={c.slug}>
              <Reveal
                direction="up"
                delay={hasFiltered ? 0 : i * 0.05}
                disabled={hasFiltered}
              >
                <Link
                  to={`/work/${c.slug}`}
                  className="group grid gap-6 rounded-(--radius-card) border border-line bg-surface p-7 transition-colors hover:border-accent/40 hover:bg-surface-hover lg:grid-cols-[1.6fr_1fr] lg:items-center"
                >
                  <div>
                    <span className="font-mono text-xs uppercase tracking-wider text-accent">
                      {c.client} · {c.sector} · {c.year}
                    </span>
                    <h2 className="mt-3 font-display text-2xl font-semibold text-ink">
                      {c.title}
                    </h2>
                    <p className="mt-3 text-ink-muted">{c.summary}</p>
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-accent">
                      Read case study
                      <ArrowRight
                        aria-hidden="true"
                        className="size-4 transition-transform group-hover:translate-x-1"
                      />
                    </span>
                  </div>

                  <dl className="grid grid-cols-3 gap-4 border-t border-line pt-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
                    {c.metrics.map((m) => (
                      <div key={m.label}>
                        <dt className="text-xs text-ink-muted">{m.label}</dt>
                        <dd className="mt-1">
                          <Counter
                            value={m.value}
                            className="grad-primary text-grad font-display text-xl font-bold"
                          />
                        </dd>
                      </div>
                    ))}
                  </dl>
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
