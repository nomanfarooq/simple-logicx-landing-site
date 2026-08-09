import { ArrowRight, Check, X } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Section from "../components/ui/Section";
import SectionHeader from "../components/ui/SectionHeader";
import Button from "../components/ui/Button";
import Reveal, { RevealGroup, RevealItem } from "../components/motion/Reveal";
import ProcessTimeline from "../sections/ProcessTimeline";
import CTA from "../sections/CTA";
import Seo, { breadcrumbJsonLd } from "../lib/seo";
import { clientCommitments, engagementModels, rituals } from "../content/process";
// Prices are looked up rather than restated, so /process and /pricing cannot
// quote different numbers for the same engagement model.
import { pricingTiers } from "../content/pricing";
import { cn } from "../lib/cn";

const tierByName = Object.fromEntries(pricingTiers.map((t) => [t.name, t]));

/**
 * Process (§4.1): engagement model, timeline, deliverables.
 *
 * The timeline section is shared with the home page rather than duplicated,
 * so the process described in both places is the same process. Everything
 * else on this page answers the questions the timeline raises: what shape do
 * I buy, what lands in my diary, and what do you need from me.
 */
export default function Process() {
  return (
    <>
      <Seo
        title="Process"
        description="Discovery, architecture, build, harden, operate — the five phases, the three engagement models, and the delivery rhythm behind them."
        path="/process"
        jsonLd={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Process", path: "/process" },
        ])}
      />

      <PageHeader
        eyebrow="Process"
        title="Five phases, no surprises"
        lead="Every engagement runs the same shape. You always know what happens next and what it costs."
      />

      <ProcessTimeline showHeader={false} />

      {/* Engagement models */}
      <Section surface="raised">
        <SectionHeader
          eyebrow="Engagement models"
          title="Three shapes the phases run inside"
          lead="The phases never change. What changes is how much of the team you have, for how long, and under what commercial agreement."
        />
        <RevealGroup
          as="ul"
          className="mt-14 grid items-start gap-5 lg:grid-cols-3"
          stagger={0.1}
        >
          {engagementModels.map((m) => {
            const tier = tierByName[m.tier];
            return (
              <RevealItem
                as="li"
                key={m.tier}
                className="flex h-full flex-col rounded-(--radius-card) border border-line bg-surface p-7"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h3 className="font-display text-xl font-semibold text-ink">
                    {m.tier}
                  </h3>
                  <span className="font-mono text-sm text-accent">
                    {tier.price}
                    <span className="text-ink-muted"> · {tier.cadence}</span>
                  </span>
                </div>

                <p className="mt-4 text-ink-soft">{m.shape}</p>

                <dl className="mt-6 flex flex-1 flex-col gap-4 border-t border-line pt-5 text-sm">
                  <div>
                    <dt className="font-mono text-xs uppercase tracking-wider text-ink-muted">
                      Rhythm
                    </dt>
                    <dd className="mt-1 text-ink-muted">{m.rhythm}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-xs uppercase tracking-wider text-ink-muted">
                      What you end up with
                    </dt>
                    <dd className="mt-1 text-ink-muted">{m.ends}</dd>
                  </div>
                </dl>

                <ul className="mt-6 flex flex-col gap-3 border-t border-line pt-5 text-sm">
                  <li className="flex gap-3 text-ink-soft">
                    <Check
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-accent"
                    />
                    <span>
                      <span className="sr-only">Best for: </span>
                      {m.bestFor}
                    </span>
                  </li>
                  {/* Naming who should not buy this is the point of the card. */}
                  <li className="flex gap-3 text-ink-muted">
                    <X
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-danger"
                    />
                    <span>
                      <span className="sr-only">Not for: </span>
                      {m.notFor}
                    </span>
                  </li>
                </ul>
              </RevealItem>
            );
          })}
        </RevealGroup>

        <Reveal className="mt-10 text-center">
          <Button to="/pricing" variant="secondary" className="group">
            See what each model includes
            <ArrowRight
              aria-hidden="true"
              className="size-4 transition-transform group-hover:translate-x-1"
            />
          </Button>
        </Reveal>
      </Section>

      {/* Rituals */}
      <Section>
        <SectionHeader
          eyebrow="Cadence"
          title="What actually lands in your diary"
          lead="Five recurring commitments. Everything else we do is asynchronous and written down."
        />
        <RevealGroup as="ol" className="mt-14 flex flex-col" stagger={0.06}>
          {rituals.map((r, i) => (
            <RevealItem
              as="li"
              key={r.cadence}
              className={cn(
                "grid gap-2 border-line py-6 md:grid-cols-[140px_1fr] md:gap-8",
                i === 0 ? "border-y" : "border-b",
              )}
            >
              <span className="font-mono text-xs uppercase tracking-wider text-accent">
                {r.cadence}
              </span>
              <div>
                <h3 className="font-display text-lg font-semibold text-ink">
                  {r.title}
                </h3>
                <p className="mt-2 text-ink-muted">{r.body}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      {/* What we need from the client */}
      <Section surface="raised">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <Reveal>
            <span className="inline-flex items-center rounded-(--radius-pill) border border-line bg-surface px-3 py-1 font-mono text-xs uppercase tracking-wider text-accent">
              Your side
            </span>
            <h2 className="mt-5 text-h2 text-ink">Four things we need from you</h2>
            <p className="mt-5 text-lg text-ink-soft">
              Stated before the contract rather than discovered in week three.
              Every engagement that has gone badly went badly here first.
            </p>
          </Reveal>

          <RevealGroup as="ul" className="grid gap-5 sm:grid-cols-2" stagger={0.08}>
            {clientCommitments.map((c) => (
              <RevealItem
                as="li"
                key={c.title}
                className="rounded-(--radius-card) border border-line bg-surface p-6"
              >
                <h3 className="font-display text-base font-semibold text-ink">
                  {c.title}
                </h3>
                <p className="mt-3 text-sm text-ink-muted">{c.body}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </Section>

      <CTA />
    </>
  );
}
