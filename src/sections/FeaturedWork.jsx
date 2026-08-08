import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Section from "../components/ui/Section";
import SectionHeader from "../components/ui/SectionHeader";
import Button from "../components/ui/Button";
import Reveal from "../components/motion/Reveal";
import Counter from "../components/motion/Counter";
import { caseStudies } from "../content/caseStudies";

export default function FeaturedWork() {
  return (
    <Section surface="raised">
      <SectionHeader
        eyebrow="Work"
        title="Projects that went to production"
        lead="Described the way engineers would describe them — including what was hard."
      />

      <ul className="mt-16 flex flex-col gap-5">
        {caseStudies.map((c, i) => (
          <li key={c.slug}>
            <Reveal direction={i % 2 === 0 ? "left" : "right"} amount={0.2}>
              <Link
                to={`/work/${c.slug}`}
                className="group grid gap-6 rounded-(--radius-card) border border-line bg-surface p-7 transition-colors hover:border-accent/40 hover:bg-surface-hover lg:grid-cols-[1.6fr_1fr] lg:items-center"
              >
                <div>
                  <span className="font-mono text-xs uppercase tracking-wider text-accent">
                    {c.client} · {c.sector}
                  </span>
                  <h3 className="mt-3 font-display text-2xl font-semibold text-ink">
                    {c.title}
                  </h3>
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

      <div className="mt-12 text-center">
        <Button to="/work" variant="secondary" size="lg">
          All case studies
        </Button>
      </div>
    </Section>
  );
}
