import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Section from "../components/ui/Section";
import Seo, { breadcrumbJsonLd } from "../lib/seo";
import { caseStudies } from "../content/caseStudies";

export default function Work() {
  return (
    <>
      <Seo
        title="Case Studies"
        description="Selected engagements: supply chain, healthcare AI and fintech ledger migration."
        path="/work"
        jsonLd={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Work", path: "/work" },
        ])}
      />

      <PageHeader
        eyebrow="Work"
        title="Projects that went to production"
        lead="Three engagements, described the way engineers would describe them — including what was hard and what we would do differently."
      />

      <Section>
        <ul className="flex flex-col gap-5">
          {caseStudies.map((c) => (
            <li key={c.slug}>
              <Link
                to={`/work/${c.slug}`}
                className="group grid gap-6 rounded-(--radius-card) border border-line bg-surface p-7 transition-colors hover:border-accent/40 hover:bg-surface-hover lg:grid-cols-[1.6fr_1fr] lg:items-center"
              >
                <div>
                  <span className="font-mono text-xs uppercase tracking-wider text-accent">
                    {c.client} · {c.sector}
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
                      <dd className="grad-primary text-grad mt-1 font-display text-xl font-bold">
                        {m.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </Link>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
