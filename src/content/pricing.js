/**
 * Engagement tiers. Shared by the /pricing page, the /process engagement
 * models and the home preview.
 *
 * Prices exist twice — once as a number the estimator computes with, once as
 * the string the cards display — so they are derived from a single constant
 * rather than typed twice. A card that says £28k next to a calculator that
 * charges £30k is the kind of defect nobody notices until a client does.
 */

const AMOUNT = {
  discovery: 12_000,
  productTeam: 28_000,
};

const gbpShort = (n) => `£${Math.round(n / 1000)}k`;

export const pricingTiers = [
  {
    name: "Discovery",
    price: gbpShort(AMOUNT.discovery),
    amount: AMOUNT.discovery,
    unit: "fixed",
    cadence: "fixed, 2 weeks",
    blurb: "Scope a problem properly before committing a budget to it.",
    features: [
      "Technical and product discovery",
      "Written architecture plan",
      "Risk and effort sizing",
      "Go / no-go recommendation",
    ],
  },
  {
    name: "Product Team",
    price: gbpShort(AMOUNT.productTeam),
    amount: AMOUNT.productTeam,
    unit: "month",
    cadence: "per month",
    blurb: "A standing cross-functional team embedded with yours.",
    featured: true,
    features: [
      "4–6 senior engineers plus design",
      "Two-week delivery increments",
      "Shared backlog and demos",
      "Production on-call during rollout",
      "Quarterly architecture review",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    // No amount: the estimator models this as parallel Product Team squads,
    // which is what an enterprise programme is priced from anyway.
    amount: null,
    unit: "custom",
    cadence: "annual agreement",
    blurb: "Multi-team programmes with compliance and procurement needs.",
    features: [
      "Multiple parallel squads",
      "SOC 2 and GDPR evidence support",
      "Named engagement director",
      "Contractual SLAs",
    ],
  },
];

/**
 * What the monthly rate covers, and what it does not.
 *
 * The exclusions column is the more useful one. Every unpleasant surprise in
 * an engagement budget lives in a line somebody assumed was included.
 */
export const included = [
  "Senior engineers and design, at the headcount agreed",
  "Delivery management and the fortnightly demo cadence",
  "Architecture decision records and runbooks",
  "CI, deployment tooling and observability setup",
  "Accessibility and performance budgets enforced in CI",
  "Production on-call through the first quarter of traffic",
  "Handover documentation and team enablement",
];

export const notIncluded = [
  {
    item: "Cloud and third-party spend",
    detail:
      "Billed to your accounts directly, never resold through us. We size it during architecture so it is a forecast, not a shock.",
  },
  {
    item: "Software licences and SaaS seats",
    detail:
      "Anything your team will still be paying for after we leave belongs on your contracts, not ours.",
  },
  {
    item: "Penetration testing and certification audits",
    detail:
      "We prepare the evidence and fix the findings. The assessor should be independent of the people who wrote the code.",
  },
  {
    item: "Travel beyond the first onsite week",
    detail:
      "Kick-off week onsite is included. Anything beyond that is at cost, agreed in advance.",
  },
];

/**
 * Estimator assumptions, shown next to the result. A calculator whose
 * assumptions are hidden is a lead-capture toy; showing them is the only
 * thing that makes the number arguable.
 */
export const estimatorAssumptions = [
  "Discovery is a fixed fee and runs before anything else, if you include it.",
  "A squad is one Product Team as priced above — four to six senior engineers plus design.",
  "The monthly rate is flat: on-call, reviews and handover are inside it, not extra.",
  "Two squads is the smallest enterprise shape. Beyond that, pricing is negotiated annually.",
  "Excludes cloud, licences, external audits and travel beyond the kick-off week.",
];

export const pricingFaqs = [
  {
    q: "Why not just quote a day rate?",
    a: "Because a day rate pays us for elapsed time and you for nothing in particular. Pricing the engagement means a week we save by deleting scope is a week you keep, rather than revenue we lose. It also makes the budget conversation a single number you can take to a board.",
  },
  {
    q: "What happens if the work finishes early?",
    a: "The engagement ends and the billing stops, with thirty days' notice either way. We have closed engagements a month early twice; both times the client spent the remainder on a second discovery instead.",
  },
  {
    q: "Can we change the team size mid-engagement?",
    a: "Up or down at a month's notice, in whole squads. Adding one engineer to a running team rarely helps — the coordination cost usually exceeds the added capacity for the first six weeks.",
  },
  {
    q: "Is there a minimum commitment?",
    a: "Three months for a product team, because the first two weeks are onboarding and the third is when the team stops being new. Discovery has no minimum — it is two weeks by definition.",
  },
  {
    q: "How do payment terms work?",
    a: "Monthly in advance for embedded teams, net thirty. Discovery is invoiced half at kick-off and half on delivery of the written plan. No retainer, no deposit against future work.",
  },
  {
    q: "At what point should we hire instead?",
    a: "Past roughly eighteen months on the same standing team, hiring is usually cheaper than any agency, including us. If you already know the shape of the permanent team you want, the honest answer is to run discovery, build the first version with us, and spend the difference on recruiting.",
  },
];
