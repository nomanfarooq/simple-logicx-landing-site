import { useId, useState } from "react";
import { Mail } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Section from "../components/ui/Section";
import SectionHeader from "../components/ui/SectionHeader";
import Button from "../components/ui/Button";
import Reveal, { RevealGroup, RevealItem } from "../components/motion/Reveal";
import Seo, { breadcrumbJsonLd } from "../lib/seo";
import { offices } from "../content/navigation";
import { pricingTiers } from "../content/pricing";
import {
  budgetBands,
  careersEmail,
  contactEmail,
  enquiryTypes,
  responseSla,
  timelines,
} from "../content/contact";

/**
 * Contact (§4.1): form, offices, booking, response SLA.
 *
 * A backend is an explicit non-goal for v2 (§1). `submitEnquiry` below is the
 * single seam where one would attach — everything else on the page is already
 * final, so wiring a real endpoint is a one-function change rather than a
 * refactor.
 *
 * Validation is native constraint validation, not a hand-rolled layer. The
 * browser already focuses the first invalid control, announces its message and
 * blocks submission, in every locale, with no JavaScript required — three
 * behaviours that custom validation usually loses at least one of.
 */

/**
 * Submit seam. Resolves the same shape a real endpoint would, so the call site
 * does not change when one exists.
 */
async function submitEnquiry(data) {
  if (import.meta.env.DEV) console.info("[contact] enquiry", data);
  return { ok: true };
}

export default function Contact() {
  return (
    <>
      <Seo
        title="Contact"
        description="Start a project with SimpleLogicX. Every enquiry is read by an engineer and answered within one working day."
        path="/contact"
        jsonLd={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ])}
      />

      <PageHeader
        eyebrow="Contact"
        title="Tell us what you are building"
        lead="Every enquiry is read by an engineer, not a sales desk. We reply within one working day."
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
          <EnquiryForm />

          <div className="flex flex-col gap-6">
            {/* Booking */}
            <Reveal
              direction="right"
              className="rounded-(--radius-card) border border-accent/40 bg-surface-hover p-7"
            >
              <h2 className="font-display text-lg font-semibold text-ink">
                Rather just talk?
              </h2>
              <p className="mt-3 text-sm text-ink-soft">
                Forty-five minutes with the principal engineer who would run the
                work — not a qualification call. Bring the architecture you are
                unsure about and we will spend the time on that.
              </p>
              <ul className="mt-5 flex flex-col gap-2 text-sm text-ink-muted">
                <li>No deck, no discovery questionnaire</li>
                <li>Whiteboard the problem, not the process</li>
                <li>You leave with an opinion, engagement or not</li>
              </ul>
              <Button
                href={`mailto:${contactEmail}?subject=Booking%20a%20technical%20call`}
                variant="secondary"
                className="mt-6 w-full"
              >
                <Mail aria-hidden="true" className="size-4" />
                {contactEmail}
              </Button>
            </Reveal>

            {/* Offices */}
            <Reveal
              direction="right"
              delay={0.1}
              className="rounded-(--radius-card) border border-line bg-surface p-7"
            >
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
              <p className="mt-4 border-t border-line pt-4 text-sm text-ink-muted">
                Hiring enquiries go to{" "}
                <a
                  href={`mailto:${careersEmail}`}
                  className="text-accent underline underline-offset-4"
                >
                  {careersEmail}
                </a>
                , or use the form and pick the job-application option.
              </p>
            </Reveal>
          </div>
        </div>
      </Section>

      {/* Response SLA */}
      <Section surface="raised">
        <SectionHeader
          eyebrow="Response times"
          title="What happens after you press send"
          lead="Working days, stated as a commitment. A number can be held against us; “fast response” cannot."
        />
        <RevealGroup
          as="ol"
          className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          stagger={0.08}
        >
          {responseSla.map((s, i) => (
            <RevealItem
              as="li"
              key={s.stage}
              className="flex h-full flex-col rounded-(--radius-card) border border-line bg-surface p-6"
            >
              <span className="font-mono text-xs text-accent">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 font-display text-base font-semibold text-ink">
                {s.stage}
              </h3>
              <p className="mt-2 font-mono text-sm text-accent">{s.time}</p>
              <p className="mt-3 flex-1 text-sm text-ink-muted">{s.detail}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>
    </>
  );
}

/* -------------------------------------------------------------------------- */

/** Below the smallest engagement we sell. Saying so beats two wasted calls. */
const TOO_SMALL = budgetBands[0].value;
/** Quoted from the tiers, so the form cannot name a price the page does not. */
const smallestTier = pricingTiers.find((t) => t.unit === "fixed");

function EnquiryForm() {
  const [status, setStatus] = useState("idle");
  const [budget, setBudget] = useState("");
  const id = useId();

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus("sending");
    const res = await submitEnquiry(Object.fromEntries(new FormData(form)));
    if (res.ok) {
      form.reset();
      setBudget("");
      setStatus("sent");
    } else {
      setStatus("error");
    }
  };

  return (
    <Reveal as="div">
      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id={`${id}-name`} name="name" label="Name" autoComplete="name" required />
          <Field
            id={`${id}-email`}
            name="email"
            label="Work email"
            type="email"
            autoComplete="email"
            required
          />
        </div>
        <Field
          id={`${id}-company`}
          name="company"
          label="Company"
          autoComplete="organization"
        />

        <Select
          id={`${id}-type`}
          name="enquiryType"
          label="What is this about?"
          options={enquiryTypes}
          required
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Select
            id={`${id}-budget`}
            name="budget"
            label="Budget"
            options={budgetBands}
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            required
          />
          <Select
            id={`${id}-timeline`}
            name="timeline"
            label="Timeline"
            options={timelines}
            required
          />
        </div>

        {/* Self-selection, not a funnel. */}
        {budget === TOO_SMALL && (
          <p className="rounded-(--radius-card) border border-line bg-surface p-4 text-sm text-ink-muted">
            Our smallest engagement is a {smallestTier.price} {smallestTier.name}
            , so we are probably the wrong shape for this — and we would
            rather say that now than after two calls. Send it anyway if you want a
            recommendation; we usually know someone better suited.
          </p>
        )}

        <div>
          <label
            htmlFor={`${id}-message`}
            className="block text-sm font-medium text-ink"
          >
            What are you trying to build?
            <span className="text-[color:var(--color-coral)]"> *</span>
          </label>
          <textarea
            id={`${id}-message`}
            name="message"
            required
            rows={6}
            className="mt-2 w-full rounded-(--radius-card) border border-line bg-base px-4 py-3 text-ink placeholder:text-ink-muted"
            placeholder="A few sentences about the problem, the constraint that makes it hard, and who is involved."
          />
          <p className="mt-2 text-xs text-ink-muted">
            The constraint is the useful part. “Cannot take downtime” or “must pass
            a clinical safety review” tells us more than a feature list.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Button
            as="button"
            type="submit"
            size="lg"
            disabled={status === "sending"}
            className="disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "sending" ? "Sending…" : "Send enquiry"}
          </Button>
          {/* Live region: the outcome is not attached to the focused control. */}
          <p role="status" className="text-sm text-ink-muted">
            {status === "sent"
              ? "Thanks — an engineer has it. We reply within one working day."
              : status === "error"
                ? `Something went wrong. Email ${contactEmail} and we will pick it up.`
                : "We never share your details."}
          </p>
        </div>
      </form>
    </Reveal>
  );
}

function Field({ id, name, label, type = "text", required, autoComplete }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
        {required && <span className="text-[color:var(--color-coral)]"> *</span>}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        className="mt-2 w-full rounded-(--radius-pill) border border-line bg-base px-4 py-2.5 text-ink placeholder:text-ink-muted"
      />
    </div>
  );
}

/**
 * Native <select>. A custom listbox would need to reimplement typeahead,
 * touch behaviour and the platform picker on mobile — all of which the native
 * control already does better than a div ever will.
 */
function Select({ id, name, label, options, required, value, onChange }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
        {required && <span className="text-[color:var(--color-coral)]"> *</span>}
      </label>
      <select
        id={id}
        name={name}
        required={required}
        value={value}
        onChange={onChange}
        defaultValue={value === undefined ? "" : undefined}
        className="mt-2 w-full rounded-(--radius-pill) border border-line bg-base px-4 py-2.5 text-ink"
      >
        <option value="" disabled>
          Select…
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
