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
];

export const caseStudyBySlug = Object.fromEntries(
  caseStudies.map((c) => [c.slug, c]),
);
