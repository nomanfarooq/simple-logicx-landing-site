import { useId, useMemo, useState } from "react";
import { Check, Minus } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Section from "../components/ui/Section";
import SectionHeader from "../components/ui/SectionHeader";
import Accordion from "../components/ui/Accordion";
import Button from "../components/ui/Button";
import Reveal, { RevealGroup, RevealItem } from "../components/motion/Reveal";
import CTA from "../sections/CTA";
import Seo, { breadcrumbJsonLd } from "../lib/seo";
import { cn } from "../lib/cn";
// Shared with the home preview and the /process engagement models, so the
// three can never quote different prices.
import {
  estimatorAssumptions,
  included,
  notIncluded,
  pricingFaqs,
  pricingTiers as tiers,
} from "../content/pricing";

export default function Pricing() {
  return (
    <>
      <Seo
        title="Pricing"
        description="Discovery, embedded product teams and enterprise programmes — transparent engagement pricing, with an estimator and the exclusions written down."
        path="/pricing"
        jsonLd={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Pricing", path: "/pricing" },
        ])}
      />

      <PageHeader
        eyebrow="Pricing"
        title="Priced by engagement, not by hour"
        lead="Hourly billing rewards slow work. We price the shape of the engagement so our incentives match yours."
      />

      <Section>
        <ul className="grid items-start gap-6 lg:grid-cols-3">
          {tiers.map((t) => (
            <li
              key={t.name}
              className={cn(
                "relative flex h-full flex-col rounded-(--radius-card) border p-8",
                t.featured
                  ? "border-accent/50 bg-surface-hover lg:-mt-4 lg:pb-12"
                  : "border-line bg-surface",
              )}
            >
              {t.featured && (
                <span className="grad-warm absolute -top-3 left-8 rounded-(--radius-pill) px-3 py-1 font-mono text-xs font-semibold uppercase tracking-wider text-[#3d2f00]">
                  Most chosen
                </span>
              )}
              <h2 className="font-display text-lg font-semibold text-ink">{t.name}</h2>
              <p className="mt-2 text-sm text-ink-muted">{t.blurb}</p>
              <p className="mt-6">
                <span className="font-display text-4xl font-bold text-ink">
                  {t.price}
                </span>
                <span className="ml-2 text-sm text-ink-muted">{t.cadence}</span>
              </p>
              <ul className="mt-7 flex flex-1 flex-col gap-3">
                {t.features.map((f) => (
                  <li key={f} className="flex gap-3 text-sm text-ink-soft">
                    <Check
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-accent"
                    />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                to="/contact"
                variant={t.featured ? "primary" : "secondary"}
                className="mt-8 w-full"
              >
                {t.price === "Custom" ? "Talk to us" : "Get started"}
              </Button>
            </li>
          ))}
        </ul>
      </Section>

      <Estimator />

      {/* Included / excluded */}
      <Section>
        <SectionHeader
          eyebrow="Scope"
          title="What the rate covers, and what it does not"
          lead="The right-hand column is the useful one. Every unpleasant surprise in an engagement budget lives in a line somebody assumed was included."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <Reveal className="rounded-(--radius-card) border border-line bg-surface p-8">
            <h3 className="font-display text-lg font-semibold text-ink">Included</h3>
            <ul className="mt-6 flex flex-col gap-3">
              {included.map((i) => (
                <li key={i} className="flex gap-3 text-ink-soft">
                  <Check
                    aria-hidden="true"
                    className="mt-1 size-4 shrink-0 text-accent"
                  />
                  {i}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal
            direction="right"
            delay={0.1}
            className="rounded-(--radius-card) border border-line bg-surface p-8"
          >
            <h3 className="font-display text-lg font-semibold text-ink">
              Billed elsewhere
            </h3>
            <ul className="mt-6 flex flex-col gap-5">
              {notIncluded.map((n) => (
                <li key={n.item} className="flex gap-3">
                  <Minus
                    aria-hidden="true"
                    className="mt-1 size-4 shrink-0 text-ink-muted"
                  />
                  <span>
                    <span className="block font-medium text-ink">{n.item}</span>
                    <span className="mt-1 block text-sm text-ink-muted">
                      {n.detail}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Section>

      <Section surface="raised" size="article">
        <SectionHeader
          eyebrow="Pricing FAQ"
          title="The commercial questions"
          lead="Including the one where the answer is that you should hire instead."
        />
        <Reveal className="mt-12">
          <Accordion items={pricingFaqs} />
        </Reveal>
      </Section>

      <CTA />
    </>
  );
}

/* -------------------------------------------------------------------------- */

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

const discoveryTier = tiers.find((t) => t.unit === "fixed");
const squadTier = tiers.find((t) => t.unit === "month");

const MONTH_MIN = 3;
const MONTH_MAX = 18;
/** Weeks per month, for the elapsed-time readout. 52 / 12. */
const WEEKS_PER_MONTH = 52 / 12;
/** Two-week increments per month. 26 fortnights / 12 months. */
const INCREMENTS_PER_MONTH = 26 / 12;

/**
 * Total cost of engagement estimator (§4.1).
 *
 * Deliberately not a "vs hiring in-house" comparison widget. Those need
 * invented salary, recruitment and attrition figures for a company we know
 * nothing about, and they are rigged by construction — nobody ships one whose
 * arrow points at the competitor. This computes the cost of the engagement
 * itself from the published tier prices, shows every assumption underneath,
 * and the pricing FAQ answers the hire-instead question honestly in words.
 *
 * Both rates come from `pricingTiers`, so the cards above and the number here
 * cannot disagree.
 *
 * Accessibility: the result is a live region, because the numbers change
 * without the focused control (a slider, a checkbox) announcing the outcome.
 */
function Estimator() {
  const [months, setMonths] = useState(6);
  const [squads, setSquads] = useState(1);
  const [withDiscovery, setWithDiscovery] = useState(true);
  const id = useId();

  const est = useMemo(() => {
    const monthly = squadTier.amount * squads;
    const discovery = withDiscovery ? discoveryTier.amount : 0;
    const total = discovery + monthly * months;
    // Discovery is two weeks, so half a month of elapsed time.
    const weeks = Math.round(months * WEEKS_PER_MONTH + (withDiscovery ? 2 : 0));
    return {
      total,
      monthly,
      discovery,
      weeks,
      perIncrement: Math.round(monthly / INCREMENTS_PER_MONTH),
    };
  }, [months, squads, withDiscovery]);

  return (
    <Section surface="raised">
      <SectionHeader
        eyebrow="Estimator"
        title="Total cost of an engagement"
        lead="Built from the rates above, not from a different set of numbers. Every assumption is listed underneath."
      />

      <div className="mt-14 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        {/* Controls */}
        <Reveal className="rounded-(--radius-card) border border-line bg-surface p-8">
          <fieldset>
            <legend className="font-display text-lg font-semibold text-ink">
              Shape the engagement
            </legend>

            {/* Duration */}
            <div className="mt-8">
              <div className="flex items-baseline justify-between gap-4">
                <label htmlFor={`${id}-months`} className="text-sm font-medium text-ink">
                  Months of embedded team
                </label>
                <span className="font-mono text-sm text-accent">{months}</span>
              </div>
              <input
                id={`${id}-months`}
                type="range"
                min={MONTH_MIN}
                max={MONTH_MAX}
                step={1}
                value={months}
                onChange={(e) => setMonths(Number(e.target.value))}
                className="mt-3 h-6 w-full accent-accent"
              />
              <div className="mt-1 flex justify-between font-mono text-xs text-ink-muted">
                <span>{MONTH_MIN} min</span>
                <span>{MONTH_MAX}</span>
              </div>
            </div>

            {/* Squads */}
            <div className="mt-8">
              <span id={`${id}-squads-label`} className="text-sm font-medium text-ink">
                Parallel squads
              </span>
              <div
                role="group"
                aria-labelledby={`${id}-squads-label`}
                className="mt-3 flex gap-2"
              >
                {[1, 2].map((n) => (
                  <button
                    key={n}
                    type="button"
                    aria-pressed={squads === n}
                    onClick={() => setSquads(n)}
                    className={cn(
                      "flex-1 rounded-(--radius-pill) border px-4 py-2.5 text-sm font-medium transition-colors",
                      squads === n
                        ? "border-accent bg-surface-hover text-accent"
                        : "border-line text-ink-soft hover:border-accent/40 hover:text-ink",
                    )}
                  >
                    {n === 1 ? "One squad" : "Two squads"}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-ink-muted">
                One squad is a {squadTier.name} as priced above. Two is the
                smallest {tiers.at(-1).name.toLowerCase()} shape.
              </p>
            </div>

            {/* Discovery */}
            <div className="mt-8 border-t border-line pt-6">
              <label
                htmlFor={`${id}-discovery`}
                className="flex items-start gap-3 text-sm"
              >
                <input
                  id={`${id}-discovery`}
                  type="checkbox"
                  checked={withDiscovery}
                  onChange={(e) => setWithDiscovery(e.target.checked)}
                  className="mt-0.5 size-4 shrink-0 accent-accent"
                />
                <span>
                  <span className="block font-medium text-ink">
                    Start with {discoveryTier.name} — {discoveryTier.price}{" "}
                    {discoveryTier.cadence}
                  </span>
                  <span className="mt-1 block text-ink-muted">
                    Skip it only if the architecture plan already exists and you
                    trust it.
                  </span>
                </span>
              </label>
            </div>
          </fieldset>
        </Reveal>

        {/* Result */}
        <Reveal direction="right" delay={0.1}>
          <div
            aria-live="polite"
            className="rounded-(--radius-card) border border-accent/40 bg-surface-hover p-8"
          >
            <p className="font-mono text-xs uppercase tracking-wider text-accent">
              Estimated total
            </p>
            <p className="mt-3 font-display text-5xl font-bold text-ink">
              {gbp.format(est.total)}
            </p>
            <p className="mt-2 text-sm text-ink-muted">
              over roughly {est.weeks} weeks, excluding VAT
            </p>

            <dl className="mt-8 divide-y divide-line border-t border-line">
              <Row label="Discovery, fixed">
                {est.discovery ? gbp.format(est.discovery) : "Not included"}
              </Row>
              <Row label={`Delivery, ${squads === 1 ? "1 squad" : "2 squads"}`}>
                {gbp.format(est.monthly)} / month
              </Row>
              <Row label="Per two-week increment">
                ≈ {gbp.format(est.perIncrement)}
              </Row>
              <Row label={`Delivery subtotal, ${months} months`}>
                {gbp.format(est.monthly * months)}
              </Row>
            </dl>

            <Button to="/contact" className="mt-8 w-full">
              Get this quoted properly
            </Button>
          </div>

          <p className="mt-4 text-xs text-ink-muted">
            An estimate, not a quote. Real numbers come out of discovery, where
            we have seen your constraints.
          </p>
        </Reveal>
      </div>

      <RevealGroup as="ul" className="mt-12 grid gap-3 md:grid-cols-2" stagger={0.05}>
        {estimatorAssumptions.map((a) => (
          <RevealItem
            as="li"
            key={a}
            className="flex gap-3 text-sm text-ink-muted"
          >
            <span aria-hidden="true" className="mt-2 size-1 shrink-0 rounded-full bg-accent" />
            {a}
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3">
      <dt className="text-sm text-ink-muted">{label}</dt>
      <dd className="font-mono text-sm text-ink">{children}</dd>
    </div>
  );
}
