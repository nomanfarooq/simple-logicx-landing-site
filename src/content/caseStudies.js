/**
 * Case studies — full narratives.
 *
 * Shape:
 *   meta          year, duration, team size — the qualifying details buyers scan for
 *   challenge     what was actually wrong, including the constraint that made it hard
 *   approach      3–4 steps, each explaining a decision rather than an activity
 *   architecture  layered diagram data (see components/ui/ArchitectureDiagram)
 *   results       narrative + the metrics already used on the index
 *   testimonial   attributed quote from the engagement
 *
 * Written to be specific and internally consistent: the stack named in the
 * architecture matches the stack listed, and the numbers in the narrative match
 * the metrics. A case study that contradicts itself is worse than a short one.
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
    year: "2025",
    duration: "7 months",
    team: "6 engineers",
    stack: ["Rust", "Go", "Kafka", "ClickHouse", "PostgreSQL", "Kubernetes", "Terraform"],
    metrics: [
      { label: "Dispatch latency", value: "−71%" },
      { label: "Vehicles live", value: "4,000" },
      { label: "Cutover downtime", value: "0h" },
    ],
    challenge: {
      lead: "Every route for the next day was planned in a single overnight batch. If anything changed after 02:00 — a breakdown, a late load, a driver calling in sick — the plan was already wrong and depots fixed it by phone.",
      body: [
        "The batch planner took four hours and could not be re-run during the day without locking the dispatch tables. Depot managers had built a parallel process out of spreadsheets and phone calls, which worked, but meant the company had no reliable picture of where anything was.",
        "The hard constraint was that the fleet never stops. There was no maintenance window, no quiet weekend, and no acceptable scenario in which dispatch was unavailable for even fifteen minutes. Whatever replaced the batch had to run alongside it until it had earned trust.",
      ],
    },
    approach: [
      {
        title: "Shadow the existing planner first",
        body: "For six weeks the new streaming engine produced assignments that nobody acted on, scored against what the batch actually did. That gave us a measurable quality bar before a single depot changed its behaviour — and caught three edge cases in driver-hours rules that no documentation mentioned.",
      },
      {
        title: "Move one depot at a time",
        body: "Cutover was per depot, smallest first, with a one-command revert to the batch plan. Nine depots ran on the new engine before the largest one moved. Each depot's first week was supervised by an engineer on site.",
      },
      {
        title: "Make the telemetry the source of truth",
        body: "Vehicle position and status moved from a nightly upload to a streaming pipeline with store-and-forward on the vehicle unit. Connectivity gaps became a delay of seconds rather than a hole in the day's data.",
      },
      {
        title: "Decommission deliberately",
        body: "The batch planner was switched off eleven weeks after the last depot migrated, once a full quarter-end and a peak season had passed on the new engine. Keeping it warm longer would have meant maintaining two systems indefinitely.",
      },
    ],
    architecture: {
      caption:
        "Vehicle telemetry streams into an assignment engine that recomputes continuously, rather than a nightly batch reading from a locked table.",
      layers: [
        {
          label: "Edge",
          nodes: [
            { name: "Vehicle unit", note: "Store-and-forward buffer" },
            { name: "Depot gateway", note: "Local cache" },
          ],
        },
        {
          label: "Ingest",
          nodes: [
            { name: "Kafka", note: "Partitioned by depot" },
            { name: "Validation", note: "Schema + dedupe" },
          ],
        },
        {
          label: "Compute",
          nodes: [
            { name: "Assignment engine", note: "Rust, continuous" },
            { name: "Constraint solver", note: "Driver hours, capacity" },
          ],
        },
        {
          label: "Serve",
          nodes: [
            { name: "Dispatch API", note: "Go" },
            { name: "ClickHouse", note: "Fleet analytics" },
          ],
        },
      ],
    },
    results: {
      body: "Dispatch decisions that took a nightly batch now resolve in under two minutes, and depots re-plan during the day rather than working around a stale sheet. The migration completed with zero downtime across all 4,000 vehicles, and the spreadsheet process was retired entirely.",
      extra: [
        "Median replan time fell from overnight to 1m 48s",
        "Depot phone escalations down 64% in the first quarter",
        "Peak-season capacity absorbed without additional planners",
      ],
    },
    testimonial: {
      quote:
        "They told us in week two that the feature we had budgeted for was the wrong thing to build. That conversation cost them revenue and saved us about nine months.",
      name: "Priya Raghunathan",
      role: "VP Engineering, Northwind Logistics",
      initials: "PR",
    },
  },

  {
    slug: "meridian-health",
    client: "Meridian Health",
    sector: "Healthcare",
    title: "A clinician copilot that passed a 6-month safety review",
    summary:
      "Retrieval over 2.3M clinical documents with citation enforcement and an evaluation harness the review board could read.",
    services: ["ai", "saas"],
    year: "2025",
    duration: "9 months",
    team: "5 engineers, 2 clinical advisors",
    stack: ["Python", "PyTorch", "LangGraph", "pgvector", "PostgreSQL", "ClickHouse", "Kubernetes"],
    metrics: [
      { label: "Documents indexed", value: "2.3M" },
      { label: "Citation accuracy", value: "99.2%" },
      { label: "Review outcome", value: "Approved" },
    ],
    challenge: {
      lead: "Clinicians were spending significant time searching internal guidance that was spread across three document systems, two of which had no usable search. An earlier vendor prototype had been rejected by the clinical safety board.",
      body: [
        "The rejection was not about accuracy in the abstract. The board could not evaluate the system at all: it produced fluent answers with no way to check where any statement came from, and no evidence that quality would hold as guidance was updated.",
        "So the real requirement was not a better model. It was a system whose behaviour could be demonstrated, argued about, and re-tested every time the corpus changed — by people who are not engineers.",
      ],
    },
    approach: [
      {
        title: "Build the evaluation harness before the product",
        body: "Two clinical advisors assembled 340 real questions with graded reference answers. That set became the regression suite, run on every change to prompts, chunking or retrieval. Nothing shipped that moved the scores backwards.",
      },
      {
        title: "Enforce citations structurally",
        body: "The system cannot emit a claim without a retrieved source attached. Answers that fail citation validation are suppressed rather than shown — a refusal is recoverable, an unsourced clinical assertion is not.",
      },
      {
        title: "Make the corpus pipeline boring",
        body: "Document ingestion, versioning and re-indexing run on a schedule with alerting, so guidance updates propagate predictably. The board specifically asked how stale an answer could be; the answer needed to be a number.",
      },
      {
        title: "Instrument for the review, not just for us",
        body: "Every query, retrieval set and response is logged and browsable by the safety team. The review took six months, and most of it was them reading actual system behaviour rather than us presenting slides.",
      },
    ],
    architecture: {
      caption:
        "Retrieval is a pipeline with a validation gate: answers that cannot cite a retrieved source never reach the clinician.",
      layers: [
        {
          label: "Sources",
          nodes: [
            { name: "Guidance systems", note: "3 upstream stores" },
            { name: "Ingestion", note: "Versioned, scheduled" },
          ],
        },
        {
          label: "Index",
          nodes: [
            { name: "pgvector", note: "Semantic" },
            { name: "Keyword index", note: "Hybrid recall" },
          ],
        },
        {
          label: "Answer",
          nodes: [
            { name: "Reranker", note: "Cross-encoder" },
            { name: "Generation", note: "Citation-bound" },
          ],
        },
        {
          label: "Gate",
          nodes: [
            { name: "Citation validator", note: "Suppress on failure" },
            { name: "Audit log", note: "Full trace" },
          ],
        },
      ],
    },
    results: {
      body: "The system passed clinical safety review at first submission after a six-month evaluation period. Citation accuracy measured 99.2% against the graded set, and the harness now runs as a gate on every deployment.",
      extra: [
        "340-question regression suite runs on every change",
        "Median answer latency 1.9s including reranking",
        "Zero unsourced clinical assertions in review sampling",
      ],
    },
    testimonial: {
      quote:
        "The evaluation harness they built is the only reason our clinical safety review passed. It turned 'the model seems good' into something the review board could actually read.",
      name: "Daniel Okonjo",
      role: "Head of Clinical Systems, Meridian Health",
      initials: "DO",
    },
  },

  {
    slug: "atlas-payments",
    client: "Atlas Payments",
    sector: "Fintech",
    title: "Rebuilding a ledger to survive a 40× volume spike",
    summary:
      "An incremental migration off a single Postgres primary to a partitioned, auditable double-entry ledger.",
    services: ["enterprise", "cloud"],
    year: "2024",
    duration: "11 months",
    team: "7 engineers",
    stack: ["Go", "PostgreSQL", "Kafka", "Kubernetes", "Terraform", "ClickHouse"],
    metrics: [
      { label: "Peak throughput", value: "40×" },
      { label: "p99 write", value: "28ms" },
      { label: "Reconciliation drift", value: "0" },
    ],
    challenge: {
      lead: "The ledger ran on a single Postgres primary that was already at 70% write capacity, against a signed contract that would multiply volume roughly fortyfold within eighteen months.",
      body: [
        "A ledger is the worst possible system to migrate carelessly. Every entry is financially material, reconciliation must balance to the penny, and the audit trail has to remain continuous across whatever change is made.",
        "The risk committee's position was clear: they would approve the work only if every phase was independently reversible. A migration with a point of no return was not going to be signed off, regardless of the engineering merit.",
      ],
    },
    approach: [
      {
        title: "Characterise behaviour from the outside",
        body: "The existing ledger had no test suite and partial documentation. We recorded production traffic and replayed it against both implementations, asserting identical outcomes — which meant migration did not depend on documentation that was never written.",
      },
      {
        title: "Dual-write with continuous reconciliation",
        body: "Both ledgers ran in parallel for four months, with an automated reconciliation job comparing every account balance hourly. Any divergence paged immediately. It found three genuine bugs, all in the new implementation, all before it was authoritative.",
      },
      {
        title: "Partition on a key that will not need changing",
        body: "Partitioning by account rather than by date, after modelling query patterns against three years of history. Date partitioning would have been simpler and would have needed redoing within two years.",
      },
      {
        title: "Flip reads before writes",
        body: "Reads moved to the new ledger first, which is reversible in seconds. Writes followed six weeks later once read traffic had proven the data was correct under real load.",
      },
    ],
    architecture: {
      caption:
        "Dual-write with hourly reconciliation meant the old ledger stayed authoritative until the new one had proven itself against real traffic.",
      layers: [
        {
          label: "Entry",
          nodes: [
            { name: "Payments API", note: "Go" },
            { name: "Idempotency layer", note: "Exactly-once" },
          ],
        },
        {
          label: "Write",
          nodes: [
            { name: "Legacy ledger", note: "Authoritative → retired" },
            { name: "Partitioned ledger", note: "By account" },
          ],
        },
        {
          label: "Verify",
          nodes: [
            { name: "Reconciliation", note: "Hourly, all accounts" },
            { name: "Divergence alerts", note: "Page on mismatch" },
          ],
        },
        {
          label: "Report",
          nodes: [
            { name: "ClickHouse", note: "Analytics" },
            { name: "Audit export", note: "Immutable trail" },
          ],
        },
      ],
    },
    results: {
      body: "The platform absorbed the contracted volume increase without further architectural work. p99 ledger writes settled at 28ms against a 100ms budget, and the migration completed with zero reconciliation drift and no phase requiring rollback.",
      extra: [
        "Four months of dual-running with hourly reconciliation",
        "Three bugs caught before the new ledger became authoritative",
        "Audit trail continuous across the full migration",
      ],
    },
    testimonial: {
      quote:
        "We migrated a live double-entry ledger with zero reconciliation drift. Every step was reversible, which is the only reason our risk committee signed it off.",
      name: "Sofia Almeida",
      role: "CTO, Atlas Payments",
      initials: "SA",
    },
  },

  {
    slug: "vantage-retail",
    client: "Vantage Retail",
    sector: "Retail",
    title: "An offline-first store app used across 1,200 locations",
    summary:
      "Stock, returns and price checks that keep working through the dead spots at the back of every warehouse.",
    services: ["mobile", "cloud"],
    year: "2025",
    duration: "6 months",
    team: "5 engineers",
    stack: ["React Native", "TypeScript", "SQLite", "Go", "PostgreSQL", "Kubernetes"],
    metrics: [
      { label: "Locations live", value: "1,200" },
      { label: "Offline transactions", value: "18%" },
      { label: "Sync conflicts lost", value: "0" },
    ],
    challenge: {
      lead: "The existing store app assumed connectivity. Stock rooms and loading bays are exactly where staff need it and exactly where the signal disappears, so associates had learned to write things on paper and enter them later.",
      body: [
        "Paper entry meant stock figures were wrong for most of the working day, which drove both phantom stockouts and unnecessary replenishment. The company knew the app was the cause; two previous attempts to add offline support had produced duplicate transactions.",
        "The difficulty is not caching. It is deciding what happens when two stores edit the same record while both are offline, and doing it in a way a retail associate never has to think about.",
      ],
    },
    approach: [
      {
        title: "Model the conflicts before writing sync code",
        body: "We enumerated every operation the app performs and classified each as commutative, last-writer-wins, or requiring explicit resolution. Only two of nineteen needed real resolution logic — the previous attempts had treated all nineteen the same way.",
      },
      {
        title: "Local-first, always",
        body: "Every action writes to SQLite first and returns immediately. Sync is a background concern the interface never waits on, so the app feels identical whether or not there is signal.",
      },
      {
        title: "Make sync state visible, not alarming",
        body: "A quiet indicator shows pending items. Associates were previously told nothing, so they did not trust the app; showing a count of unsynced actions turned out to matter more than the sync speed.",
      },
      {
        title: "Roll out by region with real observation",
        body: "Eight stores first, with an engineer on site for two of them. Watching associates use it in a loading bay surfaced an issue no test caught: the scan flow needed to work one-handed.",
      },
    ],
    architecture: {
      caption:
        "Writes land locally and sync in the background. The interface never blocks on the network, so connectivity gaps are invisible to the user.",
      layers: [
        {
          label: "Device",
          nodes: [
            { name: "React Native app", note: "One-handed scan flow" },
            { name: "SQLite", note: "Local-first writes" },
          ],
        },
        {
          label: "Sync",
          nodes: [
            { name: "Outbox queue", note: "Ordered, retried" },
            { name: "Conflict resolver", note: "Per-operation policy" },
          ],
        },
        {
          label: "Backend",
          nodes: [
            { name: "Sync API", note: "Go, idempotent" },
            { name: "PostgreSQL", note: "Store of record" },
          ],
        },
        {
          label: "Ops",
          nodes: [
            { name: "Per-store health", note: "Pending item counts" },
            { name: "Alerting", note: "Stuck queue detection" },
          ],
        },
      ],
    },
    results: {
      body: "The app rolled out to 1,200 locations over four months. Around 18% of all transactions are now created offline and sync later — work that previously happened on paper or not at all. No sync conflict has resulted in lost data since launch.",
      extra: [
        "Paper-based stock entry eliminated across all locations",
        "Two of nineteen operations needed explicit conflict resolution",
        "Median sync latency after reconnect: under 4 seconds",
      ],
    },
    testimonial: {
      quote:
        "Two previous attempts at offline gave us duplicate transactions. This team spent the first fortnight on conflict modelling instead of code, and we have not lost a record since.",
      name: "Marcus Iheanacho",
      role: "Director of Retail Systems, Vantage Retail",
      initials: "MI",
    },
  },

  {
    slug: "halden-energy",
    client: "Halden Energy",
    sector: "Utilities",
    title: "A regulated customer portal that passed accessibility audit first time",
    summary:
      "Rebuilding a 400-page self-service portal to WCAG 2.2 AA with a performance budget enforced in CI.",
    services: ["web", "saas"],
    year: "2026",
    duration: "8 months",
    team: "6 engineers, 1 accessibility specialist",
    stack: ["TypeScript", "React", "Next.js", "Node.js", "PostgreSQL", "Cloudflare"],
    metrics: [
      { label: "Lighthouse performance", value: "98" },
      { label: "Largest contentful paint", value: "1.4s" },
      { label: "Audit findings", value: "0" },
    ],
    challenge: {
      lead: "A regulator-mandated accessibility deadline, a portal of roughly 400 pages accumulated over a decade, and an existing codebase where no two form components behaved the same way.",
      body: [
        "An earlier remediation attempt had gone page by page, fixing individual contrast and label issues. It made measurable progress and was still going to miss the deadline, because the underlying components kept reintroducing the same defects on every new page.",
        "The portal also served a customer base skewed toward older users on older devices — the segment least well served by a heavy client-side rebuild, and the one most likely to be using assistive technology.",
      ],
    },
    approach: [
      {
        title: "Fix the components, not the pages",
        body: "We built an accessible component library first — twelve primitives covering the patterns those 400 pages actually used. Fixing a form input once fixed it in 180 places, which is why the page-by-page approach was never going to converge.",
      },
      {
        title: "Enforce the budget in CI",
        body: "Performance and accessibility checks run on every pull request and fail the build. A budget that is only checked before launch is a wish, and this codebase had already demonstrated that.",
      },
      {
        title: "Server-render the read-heavy majority",
        body: "Most of the portal is content and account data, not interaction. Rendering it on the server kept the client bundle small, which matters disproportionately on the older devices this customer base actually uses.",
      },
      {
        title: "Audit with real assistive technology",
        body: "An accessibility specialist tested with screen readers and keyboard-only navigation throughout, not as a final pass. Automated tooling catches perhaps a third of real issues; the rest need someone actually using it.",
      },
    ],
    architecture: {
      caption:
        "A shared component library is the enforcement point: accessibility and performance are properties of the primitives, checked in CI before anything merges.",
      layers: [
        {
          label: "Foundation",
          nodes: [
            { name: "Design tokens", note: "Contrast-verified" },
            { name: "12 primitives", note: "Accessible by default" },
          ],
        },
        {
          label: "Application",
          nodes: [
            { name: "Next.js", note: "Server-rendered" },
            { name: "Account services", note: "Node.js" },
          ],
        },
        {
          label: "Gate",
          nodes: [
            { name: "CI budgets", note: "Perf + a11y, blocking" },
            { name: "AT testing", note: "Screen reader, keyboard" },
          ],
        },
        {
          label: "Delivery",
          nodes: [
            { name: "Cloudflare", note: "Edge cache" },
            { name: "RUM", note: "Real-device vitals" },
          ],
        },
      ],
    },
    results: {
      body: "The portal passed its external accessibility audit with zero findings, ahead of the regulatory deadline. Lighthouse performance sits at 98 with LCP at 1.4s, measured on the mid-range devices that dominate real traffic rather than on a developer laptop.",
      extra: [
        "Twelve primitives replaced inconsistent components across 400 pages",
        "Perf and a11y budgets block merges, not just releases",
        "Support calls about the portal down 31% in the first quarter",
      ],
    },
    testimonial: {
      quote:
        "The previous team fixed pages. This one fixed the components underneath them, and the audit came back clean. We should have done it that way the first time.",
      name: "Ingrid Solberg",
      role: "Head of Digital, Halden Energy",
      initials: "IS",
    },
  },
];

export const caseStudyBySlug = Object.fromEntries(
  caseStudies.map((c) => [c.slug, c]),
);

/** Service slugs that at least one case study covers — drives the /work filter. */
export const caseStudySectors = [...new Set(caseStudies.map((c) => c.sector))];
