import { contactEmail, privacyEmail } from "./contact";
import { offices } from "./navigation";

/**
 * Legal pages.
 *
 * Bodies use the same block types as articles (see components/ui/ArticleBody),
 * so legal copy gets the site's typography and heading levels for free and
 * there is no second content renderer to keep in step.
 *
 * IMPORTANT — these are drafts, and every page says so in a notice the reader
 * cannot miss. They describe what this site actually does, which makes them a
 * useful starting point for counsel; they have not been reviewed by a lawyer
 * and must not ship as though they have. Replacing the `notice` field with
 * null is the deliberate act that removes the banner.
 *
 * The privacy copy is written against the real implementation: no analytics,
 * no advertising cookies, self-hosted fonts, theme preference in
 * localStorage, and no backend behind the enquiry form (§1). If any of those
 * change, this file changes in the same commit.
 */

const DRAFT_NOTICE =
  "This copy is pending legal review. It describes how the site and the business actually operate and is intended as a starting point for counsel — it is not legal advice and has not been reviewed by a lawyer.";

const officeList = offices.map((o) => `${o.city}, ${o.region}`).join("; ");

export const legalDocs = {
  privacy: {
    title: "Privacy Policy",
    description:
      "What SimpleLogicX collects, why, how long it is kept, and the rights you have over it.",
    updated: "2026-08-09",
    notice: DRAFT_NOTICE,
    intro:
      "This policy covers simplelogicx.com and the enquiries we receive through it. Personal data handled inside a client engagement is governed by that engagement's contract and data processing agreement, not by this page.",
    body: [
      { type: "h2", text: "Who we are" },
      {
        type: "p",
        text: `SimpleLogicX is a product engineering studio operating from ${officeList}. For enquiries made through this website we are the data controller. On client engagements we are almost always a data processor acting on the client's instructions, and the relevant terms are in the engagement contract.`,
      },
      {
        type: "p",
        text: `Data protection questions go to ${privacyEmail}. General enquiries go to ${contactEmail}.`,
      },

      { type: "h2", text: "What we collect" },
      {
        type: "p",
        text: "Three categories, and no more than three. We do not buy contact lists, we do not enrich the data you send us against third-party databases, and we do not build behavioural profiles.",
      },
      {
        type: "list",
        items: [
          "What you type into the enquiry form: name, work email, company, enquiry type, budget band, timeline and your message. All of it is optional except name, email, enquiry type, budget, timeline and message, which the form requires in order to route the enquiry to the right engineer.",
          "Technical data our hosting produces in the ordinary course of serving a page: IP address, user agent, requested path, timestamp and response status. These are server logs, not tracking.",
          "Your theme preference, stored in your browser's local storage under a single key so the site does not flash the wrong colour scheme on your next visit. It is not a cookie, it is never transmitted to us, and clearing site data removes it.",
        ],
      },
      {
        type: "callout",
        title: "What we do not collect",
        body: "No analytics, no advertising or tracking cookies, no session recording, no heat mapping, and no third-party embeds. Fonts are served from our own domain rather than a font CDN, so loading a page on this site makes no requests to anyone else.",
      },

      { type: "h2", text: "Why we process it, and on what basis" },
      {
        type: "steps",
        items: [
          "Enquiry data — to reply to you and to scope possible work. Lawful basis: taking steps at your request prior to entering a contract, and our legitimate interest in responding to business enquiries.",
          "Server logs — to keep the site available and to investigate abuse or faults. Lawful basis: legitimate interests in the security and integrity of our systems.",
          "Theme preference — to render the site the way you last chose. Strictly necessary for a feature you asked for, and it never leaves your browser.",
        ],
      },
      {
        type: "p",
        text: "We do not use your data for automated decision-making or profiling, and we do not sell it under any definition of that word.",
      },

      { type: "h2", text: "How long we keep it" },
      {
        type: "list",
        items: [
          "Enquiries that do not become engagements: 24 months, then deleted. We keep them that long because buying cycles are long and people come back.",
          "Enquiries that become engagements: for the life of the engagement and seven years afterwards, which is the retention our accounting and professional indemnity obligations require.",
          "Server logs: 90 days, then rotated out.",
          "Marketing consent records, where you have given consent: for as long as the consent stands, plus two years, so we can evidence that it was given.",
        ],
      },

      { type: "h2", text: "Who else sees it" },
      {
        type: "p",
        text: "Only the processors we need to operate. Each is bound by a data processing agreement, and none of them are permitted to use your data for their own purposes.",
      },
      {
        type: "list",
        items: [
          "Our cloud hosting and CDN provider, which serves this site and produces the server logs described above.",
          "Our email provider, which carries your enquiry to the engineer who answers it.",
          "Our accounting and contract systems, but only once an enquiry becomes an engagement.",
        ],
      },
      {
        type: "p",
        text: "We disclose personal data to anyone else only where the law requires it, and we will tell you when that happens unless we are prohibited from doing so.",
      },

      { type: "h2", text: "International transfers" },
      {
        type: "p",
        text: `We operate from ${officeList}, so an enquiry may be read by a colleague outside the UK or the European Economic Area. Those transfers are covered by the UK International Data Transfer Addendum and the EU Standard Contractual Clauses, together with the internal access controls described below.`,
      },
      {
        type: "p",
        text: "On client engagements, data residency is a design decision we make with you during architecture rather than a default we impose. If your data must not leave a jurisdiction, say so in discovery and the architecture will reflect it.",
      },

      { type: "h2", text: "Your rights" },
      {
        type: "p",
        text: "Under the UK GDPR and the EU GDPR you can ask us to do all of the following, free of charge. We respond within one month, and in practice within a working week.",
      },
      {
        type: "list",
        items: [
          "Access — a copy of the personal data we hold about you.",
          "Rectification — correction of anything inaccurate or incomplete.",
          "Erasure — deletion, where we have no overriding obligation to keep it.",
          "Restriction — a pause on processing while a dispute is resolved.",
          "Portability — your data in a structured, machine-readable format.",
          "Objection — to any processing we base on legitimate interests, including a general objection to direct marketing, which we always honour.",
          "Withdrawal of consent — at any time, where consent is the basis we relied on.",
        ],
      },
      {
        type: "p",
        text: `Send any of these to ${privacyEmail}. If you are unhappy with how we handle it, you can complain to the Information Commissioner's Office in the UK, or to your local supervisory authority in the EEA. We would rather you raised it with us first, but that is your choice and not a precondition.`,
      },

      { type: "h2", text: "Cookies and local storage" },
      {
        type: "p",
        text: "This site sets no cookies. The only thing it writes to your browser is the theme preference described above, in local storage, and there is no consent banner because there is nothing to consent to. If that ever changes, this section changes first and a banner appears with it.",
      },

      { type: "h2", text: "Security" },
      {
        type: "list",
        items: [
          "Transport security on every request; the site is served over HTTPS only.",
          "Access to enquiry data limited to the engineers and principals who handle enquiries, on named accounts with multi-factor authentication.",
          "Background-checked staff on engagements that require it, and access reviews each quarter.",
          "Breach notification to the relevant supervisory authority within 72 hours, and directly to you where the risk to you is high.",
        ],
      },

      { type: "h2", text: "Changes to this policy" },
      {
        type: "p",
        text: "The date at the top of this page is the last substantive change. Material changes are announced on the page rather than applied quietly, and we keep the previous version available on request.",
      },
    ],
  },

  terms: {
    title: "Terms of Service",
    description:
      "The terms governing use of this website and the relationship between it and an actual engagement.",
    updated: "2026-08-09",
    notice: DRAFT_NOTICE,
    intro:
      "These terms govern your use of simplelogicx.com. They do not govern engagements — those are covered by a signed contract and a statement of work, which take precedence over everything on this page.",
    body: [
      { type: "h2", text: "Nothing here is an offer" },
      {
        type: "p",
        text: "The prices, timelines and engagement shapes described on this site are indicative. They are published because opaque pricing wastes everyone's time, not because they constitute an offer capable of acceptance. A binding commitment exists only in a signed contract.",
      },
      {
        type: "callout",
        title: "The estimator is an estimate",
        body: "The engagement estimator on the pricing page computes from published rates and stated assumptions. It does not know your constraints, your compliance obligations or your existing systems, and it is not a quote. Real numbers come out of discovery.",
      },

      { type: "h2", text: "Who these terms apply to" },
      {
        type: "p",
        text: "Anyone who visits simplelogicx.com, whether or not they contact us. If you are acting for an organisation, you confirm you are authorised to accept these terms on its behalf. If you are a client with a signed engagement contract, that contract governs the engagement and these terms cover only your use of this website.",
      },
      {
        type: "p",
        text: "This site is aimed at businesses. It is not intended for children, and we do not knowingly collect anything from them.",
      },

      { type: "h2", text: "Using this website" },
      {
        type: "p",
        text: "You may read it, share links to it, and quote it with attribution. You may not scrape it at a rate that degrades it for anyone else, misrepresent its content as your own, or use it to train a model that reproduces it verbatim and passes it off as original.",
      },
      {
        type: "list",
        items: [
          "Do not attempt to gain access to systems, data or accounts that are not published here.",
          "Do not introduce malware, or use the site to distribute it.",
          "Do not use automated tools in a way that degrades availability for other visitors. Ordinary crawling by search engines is welcome and does not need permission.",
          "Do not use the enquiry form to send unsolicited marketing. It reaches an engineer, not a mailbox anyone is paid to filter.",
        ],
      },
      {
        type: "p",
        text: "We may suspend access from an address that is doing any of the above, without notice and without it being a breach of these terms on our part.",
      },
      {
        type: "p",
        text: "We make no commitment about uptime for this website. It is a marketing site, not a service, and we will take it down for maintenance without notice if we need to.",
      },

      { type: "h2", text: "Accuracy of what you read here" },
      {
        type: "p",
        text: "Case studies describe engagements we delivered, and the figures in them are drawn from those engagements. They are not a prediction of your outcome — different constraints produce different results, and anyone who tells you otherwise is selling something.",
      },
      {
        type: "p",
        text: "Technical writing on the insights pages reflects our view at the time of publication. We do not silently revise articles when we change our minds; we publish a new one.",
      },

      { type: "h2", text: "Intellectual property" },
      {
        type: "list",
        items: [
          "The content, design and code of this website belong to SimpleLogicX.",
          "Client names, logos and trade marks shown in case studies belong to those clients and are used with permission.",
          "Work produced during an engagement belongs to the client, unconditionally, from the first commit. That is a term of every engagement contract we sign and is not negotiable in the other direction.",
        ],
      },

      { type: "h2", text: "Enquiries" },
      {
        type: "p",
        text: "Sending an enquiry creates no obligation on either side. Do not send confidential information through the form — if what you need to tell us is sensitive, say so and we will agree a mutual non-disclosure agreement before you send anything further.",
      },

      { type: "h2", text: "Third-party links" },
      {
        type: "p",
        text: "Where this site links to somewhere else, that link is a convenience and not an endorsement. We do not control those destinations and we are not responsible for what they do with your data once you arrive.",
      },

      { type: "h2", text: "Liability" },
      {
        type: "p",
        text: "To the extent the law allows, we exclude liability for loss arising from reliance on this website's content. Nothing here excludes liability for death or personal injury caused by negligence, for fraud, or for anything else that cannot lawfully be excluded. Liability arising from an engagement is governed by that engagement's contract, where it is capped and negotiated properly.",
      },

      { type: "h2", text: "Privacy" },
      {
        type: "p",
        text: "How we handle personal data collected through this site is set out in the privacy policy, which forms part of these terms. Where the two appear to conflict on a data protection question, the privacy policy governs.",
      },

      { type: "h2", text: "Severability and the whole agreement" },
      {
        type: "p",
        text: "If any part of these terms is found unenforceable, the rest continues to apply and the unenforceable part is read down to the narrowest form that works. These terms, together with the privacy policy, are the whole of the agreement covering your use of this website, and they replace anything said about it elsewhere.",
      },
      {
        type: "p",
        text: "Nobody other than you and us has any right to enforce these terms. A delay in enforcing something is not a waiver of it.",
      },

      { type: "h2", text: "Governing law" },
      {
        type: "p",
        text: "These terms are governed by the laws of England and Wales, and the courts of England and Wales have exclusive jurisdiction over any dispute arising from them. Engagement contracts may specify a different jurisdiction, and where they do, they win.",
      },

      { type: "h2", text: "Changes" },
      {
        type: "p",
        text: `We update these terms as the site changes. The date at the top is the last substantive revision. Questions about any of it go to ${contactEmail}.`,
      },
    ],
  },
};

export const legalSlugs = Object.keys(legalDocs);
