import { Check, X } from "lucide-react";
import Section from "../components/ui/Section";
import SectionHeader from "../components/ui/SectionHeader";
import { RevealGroup, RevealItem } from "../components/motion/Reveal";
import { comparison } from "../content/comparison";

/**
 * Comparison table.
 *
 * A real <table> with proper headers, not a grid of divs. Screen-reader users
 * navigating this by cell need to know which column they are in — "Typical
 * agency" versus "SimpleLogicX" is the entire point of the section, and a div
 * grid throws that relationship away.
 *
 * On narrow viewports the same data re-renders as stacked cards, because a
 * three-column table at 375px is unreadable for everyone.
 */
export default function WhyChooseUs() {
  return (
    <Section surface="raised">
      <SectionHeader
        eyebrow="Why us"
        title="The difference is specific"
        lead="Not adjectives. Here is what actually differs, stated plainly enough that you could hold us to it."
      />

      {/* Desktop: real table */}
      <div className="mt-16 hidden overflow-hidden rounded-(--radius-card) border border-line md:block">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">
            Comparison of a typical agency engagement against a SimpleLogicX engagement
          </caption>
          <thead>
            <tr className="bg-surface">
              <th scope="col" className="px-6 py-5 font-display text-sm font-semibold text-ink">
                Dimension
              </th>
              <th scope="col" className="px-6 py-5 font-display text-sm font-semibold text-ink-muted">
                Typical agency
              </th>
              <th scope="col" className="px-6 py-5 font-display text-sm font-semibold text-accent">
                SimpleLogicX
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {comparison.map((row) => (
              <tr key={row.dimension} className="transition-colors hover:bg-surface">
                <th scope="row" className="px-6 py-5 align-top font-medium text-ink">
                  {row.dimension}
                </th>
                <td className="px-6 py-5 align-top text-ink-muted">
                  <span className="flex gap-3">
                    <X
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-danger"
                    />
                    {row.typical}
                  </span>
                </td>
                <td className="px-6 py-5 align-top text-ink-soft">
                  <span className="flex gap-3">
                    <Check
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-accent"
                    />
                    {row.ours}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: stacked cards */}
      <RevealGroup as="ul" className="mt-12 flex flex-col gap-4 md:hidden">
        {comparison.map((row) => (
          <RevealItem
            as="li"
            key={row.dimension}
            className="rounded-(--radius-card) border border-line bg-surface p-6"
          >
            <p className="font-display font-semibold text-ink">{row.dimension}</p>
            <p className="mt-4 flex gap-3 text-sm text-ink-muted">
              <X
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-danger"
              />
              <span>
                <span className="sr-only">Typical agency: </span>
                {row.typical}
              </span>
            </p>
            <p className="mt-3 flex gap-3 text-sm text-ink-soft">
              <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-accent" />
              <span>
                <span className="sr-only">SimpleLogicX: </span>
                {row.ours}
              </span>
            </p>
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  );
}
