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

/**
 * Engagement models — the commercial shape the five phases run inside.
 *
 * `tier` is the key into `pricingTiers`. The price is NOT repeated here: the
 * process page looks it up so /process and /pricing cannot drift apart, the
 * same rule ProcessTimeline follows for the phases themselves.
 *
 * `notFor` is load-bearing. A model that suits everything suits nothing, and
 * saying who should not buy it is the fastest way to be believed by someone
 * who should.
 */
export const engagementModels = [
  {
    tier: "Discovery",
    shape: "One principal engineer and a designer, two weeks, fixed fee.",
    rhythm: "Daily working sessions with your team, written findings on day ten.",
    ends: "A written architecture plan, a risk register and a go / no-go recommendation you own outright.",
    bestFor:
      "A problem nobody has sized yet, a build/buy decision, or technical due diligence a board needs to read.",
    notFor:
      "Work that is already specified and agreed. If the plan exists and you trust it, skip straight to a build.",
  },
  {
    tier: "Product Team",
    shape: "Four to six senior engineers plus design, embedded with your people.",
    rhythm: "Two-week increments, fortnightly demo, shared backlog and standup with your team.",
    ends: "Working software in production from week one, then runbooks and an on-call rotation your engineers are already in.",
    bestFor:
      "Building or rebuilding a product with a real deadline, where you need delivery capacity faster than you can hire it.",
    notFor:
      "Filling a single seat. One contractor inside your existing team is a staffing problem, not an engagement.",
  },
  {
    tier: "Enterprise",
    shape: "Multiple parallel squads under a named engagement director.",
    rhythm: "Squad-level fortnightly increments, monthly programme review, quarterly architecture review.",
    ends: "A coordinated rollout with compliance evidence, contractual SLAs and a per-squad handover.",
    bestFor:
      "Multi-year programmes, regulated environments, and migrations where several systems have to move in step.",
    notFor:
      "A first engagement. We would rather prove the model on one team before running four.",
  },
];

/**
 * Delivery rituals — the calendar a client actually experiences. Written as
 * cadence → what happens → why, because "we are agile" tells a buyer nothing
 * about what lands in their diary.
 */
export const rituals = [
  {
    cadence: "Daily",
    title: "Shared standup",
    body: "Fifteen minutes, your team and ours in one call. Not a status report to a client — the same standup, because there is one backlog.",
  },
  {
    cadence: "Weekly",
    title: "Written delivery note",
    body: "What shipped, what slipped, what changed our minds, and the decisions we need from you. Circulated on Friday so it survives a forward to your board.",
  },
  {
    cadence: "Fortnightly",
    title: "Demo in a real environment",
    body: "Always deployed, never a slide. If something is not demonstrable it is not done, and we say that rather than showing a mock.",
  },
  {
    cadence: "Monthly",
    title: "Budget and burn review",
    body: "Spend against plan, scope changes and their cost, and the current best estimate for the remaining work. No surprise invoices.",
  },
  {
    cadence: "Quarterly",
    title: "Architecture review",
    body: "The decision records reopened against what we have since learned. Some get reversed; that is the point of writing them down.",
  },
];

/**
 * What the engagement needs from the client side. Stated up front because
 * every engagement that has gone badly went badly here first.
 */
export const clientCommitments = [
  {
    title: "One person who can decide",
    body: "Named, empowered, and available within a day. Decisions that queue behind a monthly steering committee cost more than any rate card.",
  },
  {
    title: "Access in week one",
    body: "Repositories, cloud accounts, CI and a working laptop path. Two weeks of onboarding friction is two weeks of an embedded team you have paid for.",
  },
  {
    title: "Your engineers in the room",
    body: "At least one of your own engineers on the engagement, in our standup and our pull requests. This is the whole handover mechanism — it does not work as a final-week event.",
  },
  {
    title: "Honest constraints early",
    body: "The compliance framework, the legacy system nobody wants to touch, the deadline that is actually immovable. Constraints shape the architecture cheaply at the start and expensively later.",
  },
];
