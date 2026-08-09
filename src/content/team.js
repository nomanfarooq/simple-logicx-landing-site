/**
 * About-page content: story, values, people, hiring.
 *
 * Values carry a `cost` line on purpose. A value that costs nothing is a
 * slogan — naming what each one loses us is the only thing that makes the
 * claim falsifiable, and it matches how the comparison table is written.
 *
 * Team bios avoid pronouns: these are placeholder-plausible people and
 * guessing a pronoun from a name is exactly the mistake to avoid.
 */

/** Story timeline. One entry per year that changed how the company works. */
export const milestones = [
  {
    year: "2014",
    title: "Two engineers and one contract",
    body: "Founded in London after both founders spent a year operating software someone else had sold and left. The first client was a logistics scale-up whose nightly batch job had started taking longer than the night.",
  },
  {
    year: "2016",
    title: "Lahore, and the end of project work",
    body: "Opened the Lahore engineering office and stopped selling fixed-scope projects. Embedded teams replaced them, because every project that went well had quietly become one anyway.",
  },
  {
    year: "2018",
    title: "Platform practice",
    body: "Enough engagements were ending with a working product nobody could deploy that we made platform engineering a standing discipline rather than a phase. Runbooks became a deliverable, not a favour.",
  },
  {
    year: "2020",
    title: "Written down, or it does not exist",
    body: "Went remote-first across three timezones and published the internal engineering handbook. Architecture decision records became mandatory on every engagement — including ours.",
  },
  {
    year: "2022",
    title: "Dubai and enterprise programmes",
    body: "Opened Dubai to run multi-squad programmes in the region, with the procurement, compliance and audit-evidence work that comes with them.",
  },
  {
    year: "2024",
    title: "Applied AI, evaluation first",
    body: "Started the applied AI practice with a rule we have not broken: no model ships without an evaluation harness the client's own domain experts can read and argue with.",
  },
  {
    year: "2026",
    title: "Forty-odd engineers, same idea",
    body: "Three offices, forty-plus engineers, and the same operating assumption we started with — the people who pitch the work are the people who do it.",
  },
];

/** Values. Each states what it costs us, or it does not belong here. */
export const values = [
  {
    title: "Say the uncomfortable thing in week two",
    body: "If the thing you have budgeted for is the wrong thing to build, you need to hear it while the budget is still unspent. Discovery exists to produce that answer, including when the answer is do not build it.",
    cost: "We have talked ourselves out of three engagements in the last two years.",
  },
  {
    title: "Senior by default",
    body: "Every engagement is staffed with engineers who have operated production systems at the relevant scale. We do not pitch with principals and deliver with graduates, because the plan and the build have to come from the same understanding.",
    cost: "We grow slowly and turn work down when the right people are not free.",
  },
  {
    title: "Production from week one",
    body: "Real environment, real deploy pipeline, real data shape, before anyone builds a feature. Deployment is the part that surprises teams, so it is the part we do first rather than last.",
    cost: "The first demo looks thinner than the slide deck you were shown.",
  },
  {
    title: "Leave the team able to run it",
    body: "Handover is runbooks, decision records, an on-call rotation your engineers are already in, and a quarter of production traffic we sat through with you. If your team cannot operate it without us, we have not finished.",
    cost: "We are designing ourselves out of a retainer on every engagement.",
  },
  {
    title: "Budgets are constraints, not aspirations",
    body: "Performance and accessibility budgets are set during architecture and enforced in CI, where breaking one fails the build. Anything checked at the end is checked when there is no budget left to fix it.",
    cost: "Features get cut to hold a budget. That conversation is never a comfortable one.",
  },
];

/**
 * People. `focus` is what this person is actually accountable for — a title
 * alone tells a buyer nothing about who they will be working with.
 */
export const team = [
  {
    name: "Ruth Adeyemi",
    role: "Co-founder, Principal Engineer",
    location: "London",
    initials: "RA",
    focus: "Distributed systems and payments. Reviews the architecture plan on every engagement before it reaches a client.",
  },
  {
    name: "Hassan Iqbal",
    role: "Co-founder, CTO",
    location: "Lahore",
    initials: "HI",
    focus: "Data platforms and streaming. Owns the technical bar for hiring and the engineering handbook.",
  },
  {
    name: "Elena Vasilenko",
    role: "Engineering Director",
    location: "London",
    initials: "EV",
    focus: "Multi-tenant SaaS platforms. Runs discovery for anything involving billing, entitlements or migration.",
  },
  {
    name: "Bilal Ahmed",
    role: "Head of Platform",
    location: "Lahore",
    initials: "BA",
    focus: "Kubernetes, Terraform and the deployment tooling every engagement starts from. Sets the on-call standard.",
  },
  {
    name: "Nadia Haddad",
    role: "Principal, Applied AI",
    location: "Dubai",
    initials: "NH",
    focus: "Retrieval systems and evaluation harnesses. Built the clinical evaluation work behind the Meridian Health engagement.",
  },
  {
    name: "Tom Okafor",
    role: "Head of Design",
    location: "London",
    initials: "TO",
    focus: "Product design and design systems. Accessibility budgets are set in this practice, not audited by it afterwards.",
  },
  {
    name: "Sana Riaz",
    role: "Engineering Manager, Mobile",
    location: "Lahore",
    initials: "SR",
    focus: "React Native and native platform work, including release trains for teams shipping to app stores weekly.",
  },
  {
    name: "Omar Al-Mansoori",
    role: "Client Principal",
    location: "Dubai",
    initials: "OA",
    focus: "Enterprise programmes: procurement, compliance evidence and the reporting a steering committee needs.",
  },
];

/**
 * Careers. Openings are the shape of the roles rather than a live vacancy
 * feed — there is no ATS behind this site (§1), so nothing here pretends to
 * be one, and the apply route is the same contact form as everything else.
 */
export const careers = {
  blurb:
    "We hire slowly and staff from the bench, which means the engineers on your engagement were not recruited against your contract. It also means we are almost always talking to people.",
  openings: [
    { role: "Senior Backend Engineer", location: "London / Remote (UK)", type: "Permanent" },
    { role: "Staff Platform Engineer", location: "Lahore", type: "Permanent" },
    { role: "Senior Applied AI Engineer", location: "Dubai / Remote (GST ±3)", type: "Permanent" },
    { role: "Product Designer", location: "London / Remote (UK)", type: "Permanent" },
  ],
  hiring: [
    {
      title: "A conversation, not a screen",
      body: "Forty-five minutes with an engineer you would work with, about systems you have actually operated.",
    },
    {
      title: "A paid working session",
      body: "One day, paid at contract rate, on a realistic problem. No take-home puzzles and no unpaid weekend work.",
    },
    {
      title: "A decision within a week",
      body: "Offer or no, with the reasoning either way. Every candidate gets written feedback.",
    },
  ],
};
