import { useState } from "react";
import PageHeader from "../components/ui/PageHeader";
import Section from "../components/ui/Section";
import Button from "../components/ui/Button";
import Seo from "../lib/seo";
import { offices } from "../content/navigation";

/**
 * Contact form.
 *
 * Ships as a validated UI with a pluggable submit handler — a backend is an
 * explicit non-goal for v2 (§1). Validation is native constraint validation
 * plus a submitted-state message, so it degrades correctly without JS.
 */
export default function Contact() {
  const [sent, setSent] = useState(false);

  return (
    <>
      <Seo
        title="Contact"
        description="Start a project with SimpleLogicX. We reply to every enquiry within one working day."
        path="/contact"
      />

      <PageHeader
        eyebrow="Contact"
        title="Tell us what you are building"
        lead="Every enquiry is read by an engineer, not a sales desk. We reply within one working day."
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr]">
          <form
            noValidate={false}
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
            className="flex flex-col gap-5"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="name" label="Name" autoComplete="name" required />
              <Field
                id="email"
                label="Work email"
                type="email"
                autoComplete="email"
                required
              />
            </div>
            <Field id="company" label="Company" autoComplete="organization" />

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-ink">
                What are you trying to build?
                <span className="text-[color:var(--color-coral)]"> *</span>
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={6}
                className="mt-2 w-full rounded-(--radius-card) border border-line bg-base px-4 py-3 text-ink placeholder:text-ink-muted"
                placeholder="A few sentences about the problem, the timeline and who is involved."
              />
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Button as="button" type="submit" size="lg">
                Send enquiry
              </Button>
              {/* role=status announces the result to screen readers. */}
              <p role="status" className="text-sm text-ink-muted">
                {sent
                  ? "Thanks — your message is queued. We reply within one working day."
                  : "We never share your details."}
              </p>
            </div>
          </form>

          <div className="flex flex-col gap-6">
            <div className="rounded-(--radius-card) border border-line bg-surface p-7">
              <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-ink">
                Offices
              </h2>
              <ul className="mt-4 flex flex-col gap-3">
                {offices.map((o) => (
                  <li key={o.city} className="flex justify-between text-sm">
                    <span className="text-ink">{o.city}</span>
                    <span className="font-mono text-ink-muted">{o.timezone}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-(--radius-card) border border-line bg-surface p-7">
              <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-ink">
                Response time
              </h2>
              <p className="mt-3 text-sm text-ink-muted">
                One working day for new enquiries. Existing clients reach their
                team directly on a shared channel.
              </p>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}

function Field({ id, label, type = "text", required, autoComplete }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
        {required && <span className="text-[color:var(--color-coral)]"> *</span>}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        required={required}
        autoComplete={autoComplete}
        className="mt-2 w-full rounded-(--radius-pill) border border-line bg-base px-4 py-2.5 text-ink placeholder:text-ink-muted"
      />
    </div>
  );
}
