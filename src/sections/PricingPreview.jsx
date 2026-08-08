import { Check } from "lucide-react";
import Section from "../components/ui/Section";
import SectionHeader from "../components/ui/SectionHeader";
import Button from "../components/ui/Button";
import { RevealGroup, RevealItem } from "../components/motion/Reveal";
import { pricingTiers } from "../content/pricing";
import { cn } from "../lib/cn";

export default function PricingPreview() {
  return (
    <Section>
      <SectionHeader
        eyebrow="Pricing"
        title="Priced by engagement, not by hour"
        lead="Hourly billing rewards slow work. We price the shape of the engagement so our incentives match yours."
      />

      <RevealGroup
        as="ul"
        className="mt-16 grid items-start gap-6 lg:grid-cols-3"
        stagger={0.1}
      >
        {pricingTiers.map((t) => (
          <RevealItem as="li" key={t.name} className="h-full">
            <div
              className={cn(
                "relative flex h-full flex-col rounded-(--radius-card) border p-8",
                t.featured
                  ? "border-accent/50 bg-surface-hover"
                  : "border-line bg-surface",
              )}
            >
              {t.featured && (
                <span className="grad-warm absolute -top-3 left-8 rounded-(--radius-pill) px-3 py-1 font-mono text-xs font-semibold uppercase tracking-wider text-[#3d2f00]">
                  Most chosen
                </span>
              )}
              <h3 className="font-display text-lg font-semibold text-ink">{t.name}</h3>
              <p className="mt-2 text-sm text-ink-muted">{t.blurb}</p>
              <p className="mt-6">
                <span className="font-display text-4xl font-bold text-ink">{t.price}</span>
                <span className="ml-2 text-sm text-ink-muted">{t.cadence}</span>
              </p>
              <ul className="mt-7 flex flex-1 flex-col gap-3">
                {t.features.map((f) => (
                  <li key={f} className="flex gap-3 text-sm text-ink-soft">
                    <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-accent" />
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
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  );
}
