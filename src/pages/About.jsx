import PageHeader from "../components/ui/PageHeader";
import Section from "../components/ui/Section";
import Seo from "../lib/seo";
import { offices } from "../content/navigation";

export default function About() {
  return (
    <>
      <Seo
        title="About"
        description="A product engineering studio of 40+ engineers across London, Lahore and Dubai."
        path="/about"
      />

      <PageHeader
        eyebrow="About"
        title="Engineers first, agency second"
        lead="We started in 2014 because too much software was being sold by people who would never have to operate it. Twelve years later that is still the whole idea."
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="max-w-xl">
            <h2 className="text-h3 text-ink">How we work</h2>
            <p className="mt-5 text-ink-soft">
              Small teams, senior by default, embedded with your people rather
              than behind an account manager. We write the runbook before we
              write the launch announcement, and we stay through the first
              quarter of real traffic.
            </p>
            <p className="mt-4 text-ink-soft">
              Full team, values and hiring detail land in step 8.
            </p>
          </div>

          <div>
            <h2 className="text-h3 text-ink">Where we are</h2>
            <ul className="mt-5 flex flex-col gap-3">
              {offices.map((o) => (
                <li
                  key={o.city}
                  className="flex items-center justify-between rounded-(--radius-card) border border-line bg-surface px-6 py-4"
                >
                  <span>
                    <span className="block font-medium text-ink">{o.city}</span>
                    <span className="text-sm text-ink-muted">{o.region}</span>
                  </span>
                  <span className="font-mono text-xs text-accent">{o.timezone}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>
    </>
  );
}
