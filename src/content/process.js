/**
 * Engagement phases. Shared by the /process page and the home timeline, so the
 * two can never describe a different process.
 */
export const processSteps = [
  {
    n: "01",
    title: "Discovery",
    duration: "2 weeks, fixed fee",
    body: "We map the problem, the constraints and the riskiest assumption — then tell you if you should not build it.",
    deliverables: ["Problem definition", "Risk register", "Go / no-go recommendation"],
  },
  {
    n: "02",
    title: "Architecture",
    duration: "1–2 weeks",
    body: "A written technical plan with the trade-offs made explicit, sized and sequenced so the first release is small.",
    deliverables: ["Architecture decision records", "Sequenced roadmap", "Effort sizing"],
  },
  {
    n: "03",
    title: "Build",
    duration: "Two-week increments",
    body: "Demoed to your team every fortnight, deployed to a real environment from week one. No big-bang reveal.",
    deliverables: ["Working software", "Fortnightly demos", "Shared backlog"],
  },
  {
    n: "04",
    title: "Harden",
    duration: "2–3 weeks",
    body: "Load testing, observability, runbooks, and the accessibility and security passes — before anyone says the word launch.",
    deliverables: ["Load test results", "Runbooks", "Accessibility + security audit"],
  },
  {
    n: "05",
    title: "Operate",
    duration: "First quarter of traffic",
    body: "We stay on call through the first quarter of production, then hand over documentation your team can actually run.",
    deliverables: ["On-call rotation", "Handover documentation", "Team enablement"],
  },
];
