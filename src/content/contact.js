import { services } from "./services";

/**
 * Contact-page content.
 *
 * The enquiry-type options are derived from `services` rather than typed out,
 * so a new service cannot appear in the mega-menu and be missing from the one
 * form that routes work to it.
 */

export const contactEmail = "hello@simplelogicx.com";
export const careersEmail = "careers@simplelogicx.com";

export const enquiryTypes = [
  ...services.map((s) => ({ value: s.slug, label: s.title })),
  { value: "hiring", label: "A job application" },
  { value: "other", label: "Something else / not sure yet" },
];

/**
 * Budget bands. The lowest band is below our smallest engagement on purpose —
 * it lets someone self-select out in ten seconds rather than after two calls,
 * and the form says so plainly rather than routing them into a funnel.
 */
export const budgetBands = [
  { value: "under-12k", label: "Under £12k" },
  { value: "12k-50k", label: "£12k – £50k" },
  { value: "50k-150k", label: "£50k – £150k" },
  { value: "150k-500k", label: "£150k – £500k" },
  { value: "500k-plus", label: "£500k+" },
  { value: "unknown", label: "Not established yet" },
];

export const timelines = [
  { value: "now", label: "Already started, need help now" },
  { value: "quarter", label: "This quarter" },
  { value: "next-quarter", label: "Next quarter" },
  { value: "exploring", label: "Exploring, no date" },
];

/**
 * Response commitments. Working days, stated as a promise rather than a
 * marketing "fast response" — a number can be held against us.
 */
export const responseSla = [
  {
    stage: "Enquiry acknowledged",
    time: "1 working day",
    detail: "By an engineer who has read it, with a first question or two.",
  },
  {
    stage: "Scoping call booked",
    time: "3 working days",
    detail: "Forty-five minutes with the principal who would run the engagement.",
  },
  {
    stage: "Written proposal",
    time: "5 working days",
    detail: "Shape, price, assumptions and what we would need from you.",
  },
  {
    stage: "Discovery can start",
    time: "2–3 weeks",
    detail: "From signature. Full product teams need four to six weeks of notice.",
  },
];
