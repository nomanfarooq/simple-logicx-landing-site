/**
 * Engagement tiers. Shared by the /pricing page and the home preview.
 */
export const pricingTiers = [
  {
    name: "Discovery",
    price: "£12k",
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
    price: "£28k",
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
