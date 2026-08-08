import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Section from "../components/ui/Section";
import SectionHeader from "../components/ui/SectionHeader";
import Accordion from "../components/ui/Accordion";
import Button from "../components/ui/Button";
import Reveal, { RevealGroup, RevealItem } from "../components/motion/Reveal";
import Counter from "../components/motion/Counter";
import ProcessMini from "../sections/ProcessMini";
import CTA from "../sections/CTA";
import Seo, { breadcrumbJsonLd, serviceJsonLd } from "../lib/seo";
import { serviceBySlug, services } from "../content/services";
import { caseStudies } from "../content/caseStudies";
import { getIcon } from "../lib/icons";
import { cn } from "../lib/cn";

/**
 * Service detail page (§4.4).
 *
 * Composition: hero, overview + outcomes, pillars, stack, related work,
 * process strip, service FAQ, CTA.
 *
 * Related case studies are derived by filtering caseStudies on this service
 * slug rather than being listed on the service, so the two data sets cannot
 * contradict each other. If nothing matches, the section is omitted entirely
 * rather than rendered empty.
 */
export default function ServiceDetail() {
  const { slug } = useParams();
  const service = serviceBySlug[slug];

  // Unknown slug is a genuine 404, not an empty page.
  if (!service) return <Navigate to="/404" replace />;

  const Icon = getIcon(service.icon);
  const related = caseStudies.filter((c) => c.services.includes(service.slug));
  const others = services.filter((s) => s.slug !== service.slug).slice(0, 3);

  return (
    <>
      <Seo
        title={service.title}
        description={service.summary.slice(0, 155)}
        path={`/services/${service.slug}`}
        jsonLd={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Services", path: "/services" },
            { name: service.title, path: `/services/${service.slug}` },
          ]),
          serviceJsonLd(service),
        ]}
      />

      <PageHeader eyebrow="Service" title={service.title} lead={service.tagline}>
        <Button to="/contact" size="lg" className="group">
          Discuss a project
          <ArrowRight
            aria-hidden="true"
            className="size-4 transition-transform group-hover:translate-x-1"
          />
        </Button>
      </PageHeader>

      {/* Overview + proof metrics */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
          <Reveal>
            <span className="grid size-14 place-items-center rounded-2xl border border-line bg-surface text-accent">
              <Icon aria-hidden="true" className="size-7" />
            </span>
            <h2 className="mt-6 text-h3 text-ink">What this looks like</h2>
            <p className="mt-5 text-lg text-ink-soft">{service.summary}</p>
          </Reveal>

          <Reveal direction="right" delay={0.1}>
            <dl className="grid grid-cols-3 gap-4 lg:grid-cols-1 lg:gap-0 lg:divide-y lg:divide-line lg:rounded-(--radius-card) lg:border lg:border-line lg:bg-surface">
              {service.outcomes.map((o) => (
                <div
                  key={o.label}
                  className="rounded-(--radius-card) border border-line bg-surface p-5 text-center lg:rounded-none lg:border-0 lg:bg-transparent lg:p-7 lg:text-left"
                >
                  <dd>
                    <Counter
                      value={o.value}
                      className="grad-primary text-grad font-display text-2xl font-bold lg:text-3xl"
                    />
                  </dd>
                  <dt className="mt-1 text-sm text-ink-muted">{o.label}</dt>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-center text-xs text-ink-muted lg:text-left">
              Drawn from delivered engagements. Detail in the case studies.
            </p>
          </Reveal>
        </div>
      </Section>

      {/* Pillars */}
      <Section surface="raised">
        <SectionHeader
          eyebrow="Capabilities"
          title="What we actually do"
          lead="Four things, explained rather than listed."
        />
        <RevealGroup as="ul" className="mt-14 grid gap-5 md:grid-cols-2" stagger={0.08}>
          {service.pillars.map((p, i) => (
            <RevealItem
              as="li"
              key={p.title}
              className="rounded-(--radius-card) border border-line bg-surface p-7"
            >
              <span className="font-mono text-xs text-accent">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 font-display text-lg font-semibold text-ink">
                {p.title}
              </h3>
              <p className="mt-3 text-ink-muted">{p.body}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      {/* Stack */}
      <Section>
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center rounded-(--radius-pill) border border-line bg-surface px-3 py-1 font-mono text-xs uppercase tracking-wider text-accent">
            Stack
          </span>
          <h2 className="mt-5 text-h3 text-ink">What we build it with</h2>
          <ul className="mt-8 flex flex-wrap justify-center gap-3">
            {service.stack.map((tech) => (
              <li
                key={tech}
                className="rounded-(--radius-pill) border border-line bg-surface px-5 py-2.5 font-mono text-sm text-ink-soft"
              >
                {tech}
              </li>
            ))}
          </ul>
        </Reveal>
      </Section>

      {/* Related work — omitted entirely when there is none */}
      {related.length > 0 && (
        <Section surface="raised">
          <SectionHeader
            eyebrow="Related work"
            title="Where we have done this"
            lead="Engagements that leaned on this capability."
          />
          {/* Column count follows the data. Most services have exactly one
              related study, and a lone card in a two-column grid reads as a
              missing item rather than a deliberate layout. */}
          <RevealGroup
            as="ul"
            className={cn(
              "mt-14 grid gap-5",
              related.length > 1 ? "lg:grid-cols-2" : "mx-auto max-w-2xl",
            )}
            stagger={0.1}
          >
            {related.map((c) => (
              <RevealItem as="li" key={c.slug} className="h-full">
                <Link
                  to={`/work/${c.slug}`}
                  className="group flex h-full flex-col rounded-(--radius-card) border border-line bg-surface p-7 transition-colors hover:border-accent/40 hover:bg-surface-hover"
                >
                  <span className="font-mono text-xs uppercase tracking-wider text-accent">
                    {c.client} · {c.sector}
                  </span>
                  <h3 className="mt-3 font-display text-xl font-semibold text-ink">
                    {c.title}
                  </h3>
                  <p className="mt-3 flex-1 text-ink-muted">{c.summary}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-accent">
                    Read case study
                    <ArrowUpRight
                      aria-hidden="true"
                      className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </span>
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
        </Section>
      )}

      <ProcessMini surface="base" />

      {/* Service-specific FAQ */}
      <Section surface="raised" size="article">
        <SectionHeader
          eyebrow="FAQ"
          title={`${service.title}, specifically`}
          lead="The objections buyers actually raise for this kind of work."
        />
        <Reveal className="mt-12">
          <Accordion items={service.faqs} />
        </Reveal>
      </Section>

      {/* Onward navigation — never leave a leaf page as a dead end */}
      <Section>
        <Reveal>
          <h2 className="text-h3 text-ink">Other services</h2>
          <ul className="mt-8 grid gap-4 md:grid-cols-3">
            {others.map((s) => {
              const OtherIcon = getIcon(s.icon);
              return (
                <li key={s.slug}>
                  <Link
                    to={`/services/${s.slug}`}
                    className="group flex items-center gap-4 rounded-(--radius-card) border border-line bg-surface p-5 transition-colors hover:border-accent/40 hover:bg-surface-hover"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-line bg-base text-accent">
                      <OtherIcon aria-hidden="true" className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1 font-medium text-ink">{s.title}</span>
                    <ArrowRight
                      aria-hidden="true"
                      className="size-4 shrink-0 text-accent transition-transform group-hover:translate-x-1"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </Section>

      <CTA />
    </>
  );
}
