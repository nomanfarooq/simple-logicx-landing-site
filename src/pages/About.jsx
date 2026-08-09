import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Section from "../components/ui/Section";
import SectionHeader from "../components/ui/SectionHeader";
import Button from "../components/ui/Button";
import Reveal, { RevealGroup, RevealItem } from "../components/motion/Reveal";
import Counter from "../components/motion/Counter";
import CTA from "../sections/CTA";
import Seo, { breadcrumbJsonLd, organizationJsonLd } from "../lib/seo";
import { gsap, useGSAP } from "../lib/gsap";
import { usePrefersReducedMotion } from "../hooks/useMediaQuery";
import { offices } from "../content/navigation";
import { careers, milestones, team, values } from "../content/team";

/**
 * About (§4.4): hero, story timeline, values, team grid, locations, careers, CTA.
 *
 * The story timeline is this page's one signature scroll effect (§5.5 allows
 * exactly one). It reuses the spine pattern from ProcessTimeline rather than
 * inventing a second scrubbed effect — same mechanism, different content.
 */
export default function About() {
  return (
    <>
      <Seo
        title="About"
        description="A product engineering studio of 40+ people across London, Lahore and Dubai, building software the people who sold it would have to operate."
        path="/about"
        jsonLd={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "About", path: "/about" },
          ]),
          organizationJsonLd,
        ]}
      />

      <PageHeader
        eyebrow="About"
        title="Engineers first, agency second"
        lead="We started in 2014 because too much software was being sold by people who would never have to operate it. Twelve years later that is still the whole idea."
      >
        {/* Years are deliberately not a Counter — a founding date animating up
            from zero reads as a bug, not a flourish. */}
        <dl className="flex flex-wrap gap-x-10 gap-y-5">
          {[
            { label: "People across three offices", value: "44" },
            { label: "Engineers at senior level or above", value: "100%" },
            { label: "Average engagement", value: "7 months" },
            { label: "Daily timezone overlap", value: "4 hours" },
          ].map((s) => (
            <div key={s.label}>
              <dd>
                <Counter
                  value={s.value}
                  className="grad-ink text-grad font-display text-3xl font-bold"
                />
              </dd>
              <dt className="mt-1 max-w-[15ch] text-sm text-ink-muted">{s.label}</dt>
            </div>
          ))}
        </dl>
      </PageHeader>

      <StoryTimeline />

      {/* Values */}
      <Section surface="raised">
        <SectionHeader
          eyebrow="Values"
          title="Five commitments, and what each one costs us"
          lead="A value that costs nothing is a slogan. These are the ones we can show you the invoice for."
        />
        <RevealGroup as="ul" className="mt-14 grid gap-5 md:grid-cols-2" stagger={0.08}>
          {values.map((v, i) => (
            <RevealItem
              as="li"
              key={v.title}
              className={cardClass(i === values.length - 1 && values.length % 2 === 1)}
            >
              <span className="font-mono text-xs text-accent">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 font-display text-lg font-semibold text-ink">
                {v.title}
              </h3>
              <p className="mt-3 text-ink-muted">{v.body}</p>
              <p className="mt-5 border-t border-line pt-4 text-sm text-ink-soft">
                <span className="font-mono text-xs uppercase tracking-wider text-accent">
                  What it costs us ·{" "}
                </span>
                {v.cost}
              </p>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      {/* Team */}
      <Section>
        <SectionHeader
          eyebrow="Team"
          title="The people who would be on your engagement"
          lead="Not a leadership page. These are practice leads who sit on delivery, and you will meet the ones relevant to your work during discovery."
        />
        <RevealGroup
          as="ul"
          className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          stagger={0.06}
        >
          {team.map((m) => (
            <RevealItem
              as="li"
              key={m.name}
              className="flex h-full flex-col rounded-(--radius-card) border border-line bg-surface p-6"
            >
              {/* Initials rather than a stock portrait: an invented photo of an
                  invented person is worse than no photo. */}
              <span
                aria-hidden="true"
                className="grid size-12 place-items-center rounded-full border border-line bg-base font-display text-sm font-semibold text-accent"
              >
                {m.initials}
              </span>
              <h3 className="mt-5 font-display text-lg font-semibold text-ink">
                {m.name}
              </h3>
              <p className="mt-1 text-sm text-accent">{m.role}</p>
              <p className="mt-3 flex-1 text-sm text-ink-muted">{m.focus}</p>
              <p className="mt-5 font-mono text-xs uppercase tracking-wider text-ink-muted">
                {m.location}
              </p>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      {/* Locations */}
      <Section surface="raised">
        <SectionHeader
          eyebrow="Locations"
          title="Three offices, one working day"
          lead="London, Lahore and Dubai overlap for at least four hours every day, which is why the delivery model works without anyone keeping unreasonable hours."
        />
        <RevealGroup as="ul" className="mt-14 grid gap-5 lg:grid-cols-3" stagger={0.1}>
          {offices.map((o) => (
            <RevealItem
              as="li"
              key={o.city}
              className="flex h-full flex-col rounded-(--radius-card) border border-line bg-surface p-7"
            >
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="font-display text-xl font-semibold text-ink">{o.city}</h3>
                <span className="font-mono text-xs text-accent">{o.timezone}</span>
              </div>
              <p className="mt-1 text-sm text-ink-muted">{o.region}</p>
              <p className="mt-5 flex-1 text-ink-muted">{o.role}</p>
              <dl className="mt-6 flex gap-8 border-t border-line pt-5 text-sm">
                <div>
                  <dt className="text-xs text-ink-muted">Open since</dt>
                  <dd className="mt-1 font-mono text-ink">{o.since}</dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-muted">Headcount</dt>
                  <dd className="mt-1 font-mono text-ink">{o.headcount}</dd>
                </div>
              </dl>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      {/* Careers */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <Reveal>
            <span className="inline-flex items-center rounded-(--radius-pill) border border-line bg-surface px-3 py-1 font-mono text-xs uppercase tracking-wider text-accent">
              Careers
            </span>
            <h2 className="mt-5 text-h2 text-ink">Hiring is the whole business</h2>
            <p className="mt-5 text-lg text-ink-soft">{careers.blurb}</p>

            <ol className="mt-8 flex flex-col gap-5">
              {careers.hiring.map((h, i) => (
                <li key={h.title} className="flex gap-4">
                  <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border border-line bg-surface font-mono text-xs text-accent">
                    {i + 1}
                  </span>
                  <span>
                    <span className="block font-medium text-ink">{h.title}</span>
                    <span className="mt-1 block text-sm text-ink-muted">{h.body}</span>
                  </span>
                </li>
              ))}
            </ol>
          </Reveal>

          <Reveal direction="right" delay={0.1}>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-ink">
              Open roles
            </h3>
            <ul className="mt-5 divide-y divide-line border-y border-line">
              {careers.openings.map((o) => (
                <li
                  key={o.role}
                  className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-5"
                >
                  <span className="font-medium text-ink">{o.role}</span>
                  <span className="text-sm text-ink-muted">
                    {o.location} · {o.type}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-ink-muted">
              No applicant tracking system and no portal. Send working code or a
              system you are proud of to the contact form and mark it for hiring —
              an engineer reads it.
            </p>
            <Button to="/contact" variant="secondary" className="group mt-6">
              Apply through contact
              <ArrowRight
                aria-hidden="true"
                className="size-4 transition-transform group-hover:translate-x-1"
              />
            </Button>
          </Reveal>
        </div>
      </Section>

      <CTA />
    </>
  );
}

/** Odd-count grids leave a hole in the last row; the final card spans it. */
function cardClass(spans) {
  return spans
    ? "rounded-(--radius-card) border border-line bg-surface p-7 md:col-span-2"
    : "rounded-(--radius-card) border border-line bg-surface p-7";
}

/**
 * Story timeline with the same scroll-drawn spine as ProcessTimeline.
 *
 * Not extracted into a shared component: the two render different data shapes
 * (year/title/body vs numbered phases with deliverables) and share only the
 * decorative line. Abstracting over that would produce a component with more
 * configuration than content.
 */
function StoryTimeline() {
  const scope = useRef(null);
  const line = useRef(null);
  const reduceMotion = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (reduceMotion || !line.current) return;
      gsap.fromTo(
        line.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: scope.current,
            start: "top 65%",
            end: "bottom 75%",
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        },
      );
    },
    { scope, dependencies: [reduceMotion] },
  );

  return (
    <Section>
      <SectionHeader
        eyebrow="Story"
        title="Twelve years, seven decisions"
        lead="Not a funding history. These are the years the way we work actually changed."
      />

      <div ref={scope} className="relative mt-16 md:mt-20">
        {/* Decorative spine, clipped by the section and hidden from AT. */}
        <div
          aria-hidden="true"
          className="absolute left-[31px] top-2 hidden h-[calc(100%-1rem)] w-px bg-line md:block"
        >
          <div
            ref={line}
            className="grad-primary h-full w-full origin-top"
            style={{ transform: reduceMotion ? "scaleY(1)" : "scaleY(0)" }}
          />
        </div>

        <ol className="flex flex-col gap-10">
          {milestones.map((m) => (
            <li key={m.year}>
              <Reveal direction="up" amount={0.3}>
                <div className="grid gap-4 md:grid-cols-[64px_1fr] md:gap-8">
                  <span className="relative z-10 grid h-8 w-16 place-items-center rounded-(--radius-pill) border border-line bg-base font-mono text-xs font-semibold text-accent">
                    {m.year}
                  </span>
                  <div className="rounded-(--radius-card) border border-line bg-surface p-7">
                    <h3 className="font-display text-xl font-semibold text-ink">
                      {m.title}
                    </h3>
                    <p className="mt-3 text-ink-muted">{m.body}</p>
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
