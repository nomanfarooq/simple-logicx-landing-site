import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import Section from "../components/ui/Section";
import SectionHeader from "../components/ui/SectionHeader";
import Button from "../components/ui/Button";
import ArchitectureDiagram from "../components/ui/ArchitectureDiagram";
import Reveal, { RevealGroup, RevealItem } from "../components/motion/Reveal";
import Counter from "../components/motion/Counter";
import AuroraBackdrop from "../components/motion/AuroraBackdrop";
import CTA from "../sections/CTA";
import Seo, { breadcrumbJsonLd, caseStudyJsonLd } from "../lib/seo";
import { caseStudies, caseStudyBySlug } from "../content/caseStudies";
import { serviceBySlug } from "../content/services";

/**
 * Case study (§4.4): hero with metrics, challenge, approach, architecture,
 * results, testimonial, next case, CTA.
 *
 * "Next case" wraps around the array rather than stopping at the end, so the
 * last study is not a dead end.
 */
export default function CaseStudy() {
  const { slug } = useParams();
  const study = caseStudyBySlug[slug];
  if (!study) return <Navigate to="/404" replace />;

  const index = caseStudies.findIndex((c) => c.slug === study.slug);
  const next = caseStudies[(index + 1) % caseStudies.length];

  return (
    <>
      <Seo
        title={study.title}
        description={study.summary}
        path={`/work/${study.slug}`}
        type="article"
        jsonLd={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Work", path: "/work" },
            { name: study.client, path: `/work/${study.slug}` },
          ]),
          caseStudyJsonLd(study),
        ]}
      />

      {/* Hero */}
      <Section
        surface="raised"
        className="border-b border-line"
        decoration={<AuroraBackdrop count={1} />}
      >
        <Reveal>
          <Link
            to="/work"
            className="group inline-flex min-h-6 items-center gap-2 text-sm font-medium text-accent"
          >
            <ArrowLeft
              aria-hidden="true"
              className="size-4 transition-transform group-hover:-translate-x-1"
            />
            All case studies
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-xs uppercase tracking-wider text-ink-muted">
            <span className="text-accent">{study.client}</span>
            <span aria-hidden="true">·</span>
            <span>{study.sector}</span>
            <span aria-hidden="true">·</span>
            <span>{study.year}</span>
          </div>

          <h1 className="mt-5 max-w-4xl text-h1 text-ink">{study.title}</h1>
          <p className="mt-6 max-w-2xl text-lg text-ink-soft">{study.summary}</p>

          <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4 border-t border-line pt-6 text-sm">
            <div>
              <dt className="text-ink-muted">Duration</dt>
              <dd className="mt-1 font-medium text-ink">{study.duration}</dd>
            </div>
            <div>
              <dt className="text-ink-muted">Team</dt>
              <dd className="mt-1 font-medium text-ink">{study.team}</dd>
            </div>
            <div>
              <dt className="text-ink-muted">Services</dt>
              <dd className="mt-1 flex flex-wrap gap-2">
                {study.services.map((s) => (
                  <Link
                    key={s}
                    to={`/services/${s}`}
                    className="font-medium text-accent hover:underline"
                  >
                    {serviceBySlug[s]?.title ?? s}
                  </Link>
                ))}
              </dd>
            </div>
          </dl>
        </Reveal>
      </Section>

      {/* Headline metrics */}
      <Section>
        <RevealGroup as="dl" className="grid gap-5 sm:grid-cols-3" stagger={0.1}>
          {study.metrics.map((m) => (
            <RevealItem
              key={m.label}
              className="rounded-(--radius-card) border border-line bg-surface p-8 text-center"
            >
              <dd>
                <Counter
                  value={m.value}
                  className="grad-ink text-grad font-display text-4xl font-bold"
                />
              </dd>
              <dt className="mt-2 text-sm text-ink-muted">{m.label}</dt>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      {/* Challenge */}
      <Section surface="raised" size="article">
        <Reveal>
          <span className="inline-flex items-center rounded-(--radius-pill) border border-line bg-surface px-3 py-1 font-mono text-xs uppercase tracking-wider text-accent">
            The challenge
          </span>
          <p className="mt-6 text-xl text-ink">{study.challenge.lead}</p>
          {study.challenge.body.map((para) => (
            <p key={para.slice(0, 40)} className="mt-5 text-ink-soft">
              {para}
            </p>
          ))}
        </Reveal>
      </Section>

      {/* Approach */}
      <Section>
        <SectionHeader
          eyebrow="Approach"
          title="What we did about it"
          lead="Four decisions, and why each one was made that way."
        />
        <RevealGroup as="ol" className="mt-14 flex flex-col gap-4" stagger={0.08}>
          {study.approach.map((step, i) => (
            <RevealItem
              as="li"
              key={step.title}
              className="grid gap-5 rounded-(--radius-card) border border-line bg-surface p-7 md:grid-cols-[auto_1fr] md:gap-8"
            >
              <span className="grad-ink text-grad font-display text-3xl font-bold">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-display text-lg font-semibold text-ink">
                  {step.title}
                </h3>
                <p className="mt-2 text-ink-muted">{step.body}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      {/* Architecture */}
      <Section surface="raised">
        <SectionHeader
          eyebrow="Architecture"
          title="How it fits together"
          lead="The shape of the system, stage by stage."
        />
        <div className="mt-14">
          <ArchitectureDiagram
            layers={study.architecture.layers}
            caption={study.architecture.caption}
          />
        </div>

        <Reveal className="mt-12">
          <h3 className="font-mono text-xs uppercase tracking-wider text-ink-muted">
            Built with
          </h3>
          <ul className="mt-4 flex flex-wrap gap-2.5">
            {study.stack.map((tech) => (
              <li
                key={tech}
                className="rounded-(--radius-pill) border border-line bg-base px-4 py-2 font-mono text-sm text-ink-soft"
              >
                {tech}
              </li>
            ))}
          </ul>
        </Reveal>
      </Section>

      {/* Results */}
      <Section>
        <SectionHeader eyebrow="Results" title="What changed" />
        <Reveal className="mx-auto mt-12 max-w-3xl">
          <p className="text-lg text-ink-soft">{study.results.body}</p>
          <ul className="mt-8 flex flex-col gap-3">
            {study.results.extra.map((r) => (
              <li key={r} className="flex gap-3 text-ink-soft">
                <Check aria-hidden="true" className="mt-1 size-4 shrink-0 text-accent" />
                {r}
              </li>
            ))}
          </ul>
        </Reveal>
      </Section>

      {/* Testimonial */}
      <Section surface="raised" size="article">
        <Reveal>
          <figure className="rounded-(--radius-card) border border-line bg-surface p-8 md:p-10">
            <blockquote className="text-xl text-ink">
              <p>“{study.testimonial.quote}”</p>
            </blockquote>
            <figcaption className="mt-7 flex items-center gap-4 border-t border-line pt-6">
              <span
                aria-hidden="true"
                className="grad-cta grid size-12 shrink-0 place-items-center rounded-full font-mono text-sm font-bold text-accent-ink"
              >
                {study.testimonial.initials}
              </span>
              <span className="min-w-0">
                <span className="block font-medium text-ink">
                  {study.testimonial.name}
                </span>
                <span className="block text-sm text-ink-muted">
                  {study.testimonial.role}
                </span>
              </span>
            </figcaption>
          </figure>
        </Reveal>
      </Section>

      {/* Next case — wraps, so the last study is not a dead end */}
      <Section>
        <Reveal>
          <span className="font-mono text-xs uppercase tracking-wider text-ink-muted">
            Next case study
          </span>
          <Link
            to={`/work/${next.slug}`}
            className="group mt-5 flex flex-col gap-6 rounded-(--radius-card) border border-line bg-surface p-8 transition-colors hover:border-accent/40 hover:bg-surface-hover md:flex-row md:items-center md:justify-between"
          >
            <span className="min-w-0">
              <span className="font-mono text-xs uppercase tracking-wider text-accent">
                {next.client} · {next.sector}
              </span>
              <span className="mt-2 block font-display text-2xl font-semibold text-ink">
                {next.title}
              </span>
            </span>
            <ArrowRight
              aria-hidden="true"
              className="size-6 shrink-0 text-accent transition-transform group-hover:translate-x-1"
            />
          </Link>
        </Reveal>
      </Section>

      <CTA />
    </>
  );
}
