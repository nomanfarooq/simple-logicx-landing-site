/**
 * Service catalogue — the source of truth for /services, /services/:slug, the
 * navbar mega-menu and the home services grid.
 *
 * Content lives here rather than inline in JSX so seven detail pages stay
 * maintainable and cannot drift out of sync with the navigation (§8).
 *
 * Shape:
 *   tagline   one line, used in cards and the mega-menu
 *   summary   opening paragraph on the detail page
 *   pillars   4 concrete capabilities, each with a real explanation
 *   stack     technologies we actually use for this work
 *   outcomes  3 proof metrics drawn from real engagements
 *   faqs      3 objections buyers actually raise for this service
 *
 * Related case studies are derived from caseStudies.js rather than listed
 * here, so a study can never claim a service the service does not claim back.
 */

export const services = [
  {
    slug: "saas",
    icon: "Boxes",
    title: "SaaS Platforms",
    tagline: "Multi-tenant products built to scale from first customer to thousandth.",
    summary:
      "We design and build subscription software end to end — tenancy model, billing, entitlements, admin tooling and the operational surface your team needs on day one, not year two. The unglamorous parts are the ones that decide whether you can sign an enterprise customer in year two, so we build them first.",
    pillars: [
      {
        title: "Tenancy and data isolation",
        body: "Row-level, schema-level or database-level isolation, chosen against your actual compliance and noisy-neighbour requirements rather than by default. Getting this wrong is the single most expensive thing to change later.",
      },
      {
        title: "Billing and entitlements",
        body: "Metering, proration, seat management and plan changes that reconcile against your ledger. Entitlements live in one place, so sales can invent a new plan without an engineering ticket.",
      },
      {
        title: "Admin and support tooling",
        body: "Impersonation, audit trails, feature flags and usage inspection built alongside the product. Support teams that cannot see what a customer sees escalate everything to engineering.",
      },
      {
        title: "Retention instrumentation",
        body: "Activation and engagement events modelled deliberately, so the analytics answer product questions rather than producing dashboards nobody trusts.",
      },
    ],
    stack: ["TypeScript", "React", "Node.js", "PostgreSQL", "Redis", "Stripe", "Temporal", "Terraform"],
    outcomes: [
      { value: "40×", label: "Peak volume absorbed" },
      { value: "99.99%", label: "Platform availability" },
      { value: "0", label: "Reconciliation drift" },
    ],
    faqs: [
      {
        q: "Can you work on our existing SaaS rather than a rebuild?",
        a: "Usually, and usually that is the better answer. Most platforms have two or three structural problems and a lot of noise around them. Discovery identifies which changes actually unblock you, and a rebuild is recommended only when incremental change genuinely cannot get there.",
      },
      {
        q: "How do you handle multi-region and data residency?",
        a: "We treat residency as an architectural constraint from the first week, because retrofitting it means touching every query path. That usually means regional database partitioning with a routing layer, plus evidence collection for whichever framework applies.",
      },
      {
        q: "Do you build the billing integration too?",
        a: "Yes. Billing is where most SaaS platforms accumulate their worst bugs, because it spans product, finance and support. We build it with reconciliation tests against your provider so drift is caught in CI, not by a customer.",
      },
    ],
  },
  {
    slug: "ai",
    icon: "Sparkles",
    title: "AI Engineering",
    tagline: "Applied AI that survives contact with production traffic.",
    summary:
      "Retrieval systems, agent workflows and model integrations built with evaluation harnesses, cost controls and fallbacks — so quality is measured rather than assumed. A demo that impresses in a meeting and a system that holds up under real users are different engineering problems, and we build for the second.",
    pillars: [
      {
        title: "Retrieval that cites",
        body: "Chunking, hybrid search and reranking tuned against your corpus, with citation enforcement so every claim traces to a source. Unsourced answers are how these systems lose user trust permanently.",
      },
      {
        title: "Evaluation harnesses",
        body: "A regression suite of real queries with graded answers, run in CI. Without one, every prompt change is a guess and quality drifts silently as the corpus grows.",
      },
      {
        title: "Agent and tool architectures",
        body: "Bounded tool use with explicit failure paths, timeouts and human handoff. Agents that cannot fail safely should not touch production systems.",
      },
      {
        title: "Cost and latency control",
        body: "Caching, model routing and token budgets modelled before launch, so unit economics are known rather than discovered on the first month's invoice.",
      },
    ],
    stack: ["Python", "PyTorch", "LangGraph", "pgvector", "ClickHouse", "Temporal", "Kubernetes"],
    outcomes: [
      { value: "2.3M", label: "Documents indexed" },
      { value: "99.2%", label: "Citation accuracy" },
      { value: "6 months", label: "Safety review passed" },
    ],
    faqs: [
      {
        q: "How do you prove the system is accurate enough to ship?",
        a: "With an evaluation harness your domain experts help define — a graded set of real queries, scored on retrieval quality and citation faithfulness, run on every change. On the Meridian engagement that harness was what the clinical review board actually read.",
      },
      {
        q: "Which models do you use?",
        a: "Whichever fits the accuracy, latency and cost envelope, and we build so it can be swapped. Model choice is the most volatile part of this field, so hard-coding a provider into your architecture is a liability.",
      },
      {
        q: "Can you work with sensitive or regulated data?",
        a: "Yes. That usually means self-hosted or private-endpoint inference, no training on your data, full audit logging of prompts and responses, and evidence collection for your compliance framework.",
      },
    ],
  },
  {
    slug: "mobile",
    icon: "Smartphone",
    title: "Mobile Applications",
    tagline: "Native-feeling iOS and Android from one disciplined codebase.",
    summary:
      "Cross-platform apps that respect platform conventions, work offline, and ship through review without drama. We drop to native modules where it genuinely matters and stay cross-platform everywhere else — the split is an engineering decision, not an ideology.",
    pillars: [
      {
        title: "Offline-first sync",
        body: "Local-first data with explicit conflict resolution. Mobile users lose connectivity constantly, and an app that assumes the network is a bug report waiting to happen.",
      },
      {
        title: "Platform-native feel",
        body: "Navigation, gestures and typography that follow each platform's conventions rather than averaging them. Users notice the difference even when they cannot name it.",
      },
      {
        title: "Release engineering",
        body: "Automated builds, staged rollout, crash reporting and over-the-air updates for the parts that allow it. Shipping should be boring.",
      },
      {
        title: "Deep linking and lifecycle",
        body: "Push, universal links, background refresh and in-app purchase wired correctly — the integration surface where most cross-platform apps quietly break.",
      },
    ],
    stack: ["React Native", "TypeScript", "Swift", "Kotlin", "SQLite", "Firebase", "Fastlane"],
    outcomes: [
      { value: "4.7", label: "Average store rating" },
      { value: "<0.1%", label: "Crash-free sessions lost" },
      { value: "2 weeks", label: "Release cadence" },
    ],
    faqs: [
      {
        q: "React Native or fully native?",
        a: "React Native for most products, because one team shipping both platforms beats two teams drifting apart. Fully native when the app is dominated by platform-specific capability — heavy camera, audio processing, or complex background behaviour.",
      },
      {
        q: "Can you take over an existing app?",
        a: "Yes, and we start by getting the build reproducible and the release pipeline automated. Inherited mobile codebases usually fail first at the release step, not in the code.",
      },
      {
        q: "Do you handle App Store and Play submissions?",
        a: "Yes, including review responses and phased rollout. We also set up your accounts so ownership stays with you rather than with us.",
      },
    ],
  },
  {
    slug: "web",
    icon: "Globe",
    title: "Web Engineering",
    tagline: "Fast, accessible interfaces that hold up under real traffic.",
    summary:
      "Product UIs and marketing surfaces engineered for Core Web Vitals, WCAG compliance and the long tail of devices your analytics actually show. Performance and accessibility are set as budgets at architecture time and enforced in CI, because both are nearly impossible to retrofit at the end.",
    pillars: [
      {
        title: "Design systems",
        body: "A component library with real tokens, documented states and semantic primitives, so the tenth page costs a fraction of the first and stays consistent.",
      },
      {
        title: "Performance budgets",
        body: "LCP, CLS and INP targets agreed up front and enforced in CI. A budget that is not enforced is a wish.",
      },
      {
        title: "Accessibility to AA",
        body: "Keyboard operability, focus management, colour contrast verified in both themes, and semantic markup. Built in from the first component, audited before launch.",
      },
      {
        title: "Rendering strategy",
        body: "Server rendering, static generation or client rendering chosen per route against real caching and data-freshness needs, not applied uniformly.",
      },
    ],
    stack: ["TypeScript", "React", "Next.js", "Tailwind CSS", "Node.js", "PostgreSQL", "Cloudflare"],
    outcomes: [
      { value: "98", label: "Lighthouse performance" },
      { value: "<1.8s", label: "Largest contentful paint" },
      { value: "AA", label: "WCAG 2.2 conformance" },
    ],
    faqs: [
      {
        q: "Can you work with our existing design team?",
        a: "Yes, and we prefer it. We usually take their design language and turn it into a token layer and component library so the design stays theirs while the implementation becomes maintainable.",
      },
      {
        q: "What if accessibility was never considered?",
        a: "We audit first and give you a prioritised list separating legal exposure from polish. Semantics and keyboard operability come first; they are the changes that unblock actual users.",
      },
      {
        q: "Do you do redesigns or only rebuilds?",
        a: "Both, though we will push back on a redesign that does not have a measurable problem behind it. A rebuild that changes nothing users can perceive is a hard thing to justify.",
      },
    ],
  },
  {
    slug: "cloud",
    icon: "Cloud",
    title: "Cloud & Platform",
    tagline: "Infrastructure your engineers can reason about at 3am.",
    summary:
      "Reproducible environments, sane deployment paths and observability that answers questions instead of generating dashboards nobody reads. The measure of good infrastructure is how quickly someone who did not build it can work out what is wrong.",
    pillars: [
      {
        title: "Infrastructure as code",
        body: "Every environment reproducible from a repository, with staging genuinely matching production. Environment drift is the root cause of most 'works on staging' incidents.",
      },
      {
        title: "Progressive delivery",
        body: "Pipelines with automated checks, canary or blue-green rollout and a rollback that is one command and actually tested.",
      },
      {
        title: "Observability and SLOs",
        body: "Traces, structured logs and service-level objectives tied to alerts that mean something. Alerts nobody acts on are noise that trains teams to ignore the real ones.",
      },
      {
        title: "Cost and capacity",
        body: "Spend attributed per service and modelled against growth, so scaling decisions are made with numbers rather than after an invoice shock.",
      },
    ],
    stack: ["Terraform", "Kubernetes", "AWS", "Google Cloud", "Docker", "Go", "Kafka", "Prometheus"],
    outcomes: [
      { value: "−71%", label: "Dispatch latency" },
      { value: "99.99%", label: "Availability achieved" },
      { value: "0h", label: "Cutover downtime" },
    ],
    faqs: [
      {
        q: "Do we have to move to Kubernetes?",
        a: "No, and often you should not. Kubernetes is worth its operational cost at a certain scale and team size, and below that a managed platform is the better engineering decision. We will tell you which side of that line you are on.",
      },
      {
        q: "Can you migrate us between cloud providers?",
        a: "Yes, incrementally, with dual-running and a reversible path at each step. Big-bang cloud migrations are how companies lose weekends and data.",
      },
      {
        q: "Who operates it afterwards?",
        a: "Your team. We stay on call through the first quarter of production traffic, then hand over runbooks, alert rationale and an on-call rotation your engineers have already practised.",
      },
    ],
  },
  {
    slug: "iot",
    icon: "Cpu",
    title: "IoT & Telemetry",
    tagline: "Fleets, firmware and the pipelines that keep them honest.",
    summary:
      "High-volume device ingestion, over-the-air update paths and the time-series backends that make a connected fleet operable rather than merely connected. A fleet you cannot update safely in the field is a liability that grows with every unit shipped, and the cost of getting the update path wrong is measured in trucks rolled rather than hours lost.",
    pillars: [
      {
        title: "Device identity and provisioning",
        body: "Per-device credentials issued at manufacture, with rotation and revocation designed before the first unit ships. Shared secrets across a fleet cannot be recalled once units are in the field, so this is one of the few decisions genuinely worth over-engineering early.",
      },
      {
        title: "High-throughput ingestion",
        body: "Backpressure, batching and store-and-forward so a network partition delays data rather than losing it. Ingestion is sized against the worst case — every device reconnecting at once after an outage — because that is exactly when the data matters most.",
      },
      {
        title: "Safe over-the-air updates",
        body: "Signed images, staged rollout by cohort, health checks and automatic rollback on failure. The update path is the highest-risk code in any fleet: it is the one component that can render hardware unreachable, so it gets the most conservative engineering.",
      },
      {
        title: "Fleet analytics",
        body: "Time-series storage, downsampling and retention tiers that make per-device history queryable at fleet scale without the bill scaling linearly with device count. Raw telemetry retention is usually the largest line item, and it is usually the easiest to halve.",
      },
    ],
    stack: ["Rust", "Go", "MQTT", "Kafka", "ClickHouse", "TimescaleDB", "Kubernetes", "Terraform"],
    outcomes: [
      { value: "4,000", label: "Vehicles live" },
      { value: "42ms", label: "p99 ingestion" },
      { value: "0", label: "Bricked units" },
    ],
    faqs: [
      {
        q: "Do you write firmware?",
        a: "We write the connectivity, update and telemetry layers, and work alongside your embedded team for the hardware-specific parts. If you have no embedded capability, we will say so rather than pretend otherwise.",
      },
      {
        q: "What happens when devices are offline for weeks?",
        a: "Store-and-forward on the device with bounded buffers and a defined discard policy, plus reconciliation on reconnect so late data lands in the right time buckets rather than corrupting recent aggregates.",
      },
      {
        q: "Can you retrofit an existing deployed fleet?",
        a: "Often, though the constraint is whatever update mechanism already exists. Discovery establishes what the current fleet can safely accept before anything is promised.",
      },
    ],
  },
  {
    slug: "enterprise",
    icon: "Building2",
    title: "Enterprise Modernisation",
    tagline: "Moving critical systems forward without stopping the business.",
    summary:
      "Incremental migration of legacy platforms — strangler-fig cutovers, integration layers and the compliance evidence your auditors will ask for. Every step is reversible, because the systems we are asked to modernise are usually the ones the business cannot operate without.",
    pillars: [
      {
        title: "Assessment and sequencing",
        body: "What to move, in what order, and what to deliberately leave alone. Not every legacy system deserves replacement, and saying so early saves budget.",
      },
      {
        title: "Strangler-fig cutover",
        body: "New functionality fronts the old system, traffic moves capability by capability, and every step can be reversed. No date on which everything changes at once.",
      },
      {
        title: "Identity and access",
        body: "SSO, role-based access and audit logging unified across old and new, so the migration does not create a second permission model to maintain.",
      },
      {
        title: "Compliance evidence",
        body: "SOC 2 and GDPR artefacts produced as a by-product of the work rather than assembled in a panic before an audit.",
      },
    ],
    stack: ["Go", "Java", "PostgreSQL", "Kafka", "Kubernetes", "Terraform", "Keycloak"],
    outcomes: [
      { value: "40×", label: "Throughput increase" },
      { value: "28ms", label: "p99 ledger write" },
      { value: "0", label: "Rollbacks required" },
    ],
    faqs: [
      {
        q: "Our legacy system has no tests and no documentation. Now what?",
        a: "That is the normal starting condition. We characterise behaviour from the outside first — recording real traffic and asserting the new path matches — so migration does not depend on documentation that was never written.",
      },
      {
        q: "Can you work with our existing vendors?",
        a: "Yes. Most modernisation programmes involve at least one incumbent supplier, and treating them as adversaries slows everything down. We integrate, document the boundaries, and escalate only when genuinely blocked.",
      },
      {
        q: "How do you avoid a migration that never finishes?",
        a: "By sequencing so each phase delivers standalone value and by refusing to run old and new in parallel indefinitely. Every phase has a defined decommission step, and it is not optional.",
      },
    ],
  },
];

export const serviceBySlug = Object.fromEntries(services.map((s) => [s.slug, s]));
