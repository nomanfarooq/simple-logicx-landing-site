/**
 * Case studies. Expanded with full narrative sections in step 7 (§11);
 * this is the index-level data the /work listing and routing need now.
 */
export const caseStudies = [
  {
    slug: "northwind-logistics",
    client: "Northwind Logistics",
    sector: "Supply chain",
    title: "Cutting dispatch latency by 71% across a 4,000-vehicle fleet",
    summary:
      "Replacing a nightly batch planner with a streaming assignment engine, without pausing a single depot.",
    services: ["cloud", "iot"],
    metrics: [
      { label: "Dispatch latency", value: "−71%" },
      { label: "Vehicles live", value: "4,000" },
      { label: "Cutover downtime", value: "0h" },
    ],
  },
  {
    slug: "meridian-health",
    client: "Meridian Health",
    sector: "Healthcare",
    title: "A clinician copilot that passed a 6-month safety review",
    summary:
      "Retrieval over 2.3M clinical documents with citation enforcement and an evaluation harness the review board could read.",
    services: ["ai", "saas"],
    metrics: [
      { label: "Documents indexed", value: "2.3M" },
      { label: "Citation accuracy", value: "99.2%" },
      { label: "Review outcome", value: "Approved" },
    ],
  },
  {
    slug: "atlas-payments",
    client: "Atlas Payments",
    sector: "Fintech",
    title: "Rebuilding a ledger to survive a 40× volume spike",
    summary:
      "An incremental migration off a single Postgres primary to a partitioned, auditable double-entry ledger.",
    services: ["enterprise", "cloud"],
    metrics: [
      { label: "Peak throughput", value: "40×" },
      { label: "p99 write", value: "28ms" },
      { label: "Reconciliation drift", value: "0" },
    ],
  },
  {
    slug: "vantage-retail",
    client: "Vantage Retail",
    sector: "Retail",
    title: "An offline-first store app used across 1,200 locations",
    summary:
      "Stock, returns and price checks that keep working through the dead spots at the back of every warehouse.",
    services: ["mobile", "cloud"],
    metrics: [
      { label: "Locations live", value: "1,200" },
      { label: "Offline transactions", value: "18%" },
      { label: "Sync conflicts lost", value: "0" },
    ],
  },
  {
    slug: "halden-energy",
    client: "Halden Energy",
    sector: "Utilities",
    title: "A regulated customer portal that passed accessibility audit first time",
    summary:
      "Rebuilding a 400-page self-service portal to WCAG 2.2 AA with a performance budget enforced in CI.",
    services: ["web", "saas"],
    metrics: [
      { label: "Lighthouse performance", value: "98" },
      { label: "Largest contentful paint", value: "1.4s" },
      { label: "Audit findings", value: "0" },
    ],
  },
];

export const caseStudyBySlug = Object.fromEntries(
  caseStudies.map((c) => [c.slug, c]),
);
