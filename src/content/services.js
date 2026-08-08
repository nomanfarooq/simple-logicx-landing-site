/**
 * Service catalogue — the source of truth for /services, /services/:slug, the
 * navbar mega-menu and the home services grid.
 *
 * Content lives here rather than inline in JSX so seven detail pages stay
 * maintainable and cannot drift out of sync with the navigation (§8).
 */

export const services = [
  {
    slug: "saas",
    icon: "Boxes",
    title: "SaaS Platforms",
    tagline: "Multi-tenant products built to scale from first customer to thousandth.",
    summary:
      "We design and build subscription software end to end — tenancy model, billing, entitlements, admin tooling and the operational surface your team needs on day one, not year two.",
    capabilities: [
      "Multi-tenant architecture and data isolation",
      "Subscription billing, metering and entitlements",
      "Admin consoles and internal tooling",
      "Usage analytics and retention instrumentation",
    ],
  },
  {
    slug: "ai",
    icon: "Sparkles",
    title: "AI Engineering",
    tagline: "Applied AI that survives contact with production traffic.",
    summary:
      "Retrieval systems, agent workflows and model integrations built with evaluation harnesses, cost controls and fallbacks — so quality is measured rather than assumed.",
    capabilities: [
      "RAG pipelines and vector search",
      "Agent and tool-use architectures",
      "Evaluation harnesses and regression suites",
      "Inference cost modelling and caching",
    ],
  },
  {
    slug: "mobile",
    icon: "Smartphone",
    title: "Mobile Applications",
    tagline: "Native-feeling iOS and Android from one disciplined codebase.",
    summary:
      "Cross-platform apps that respect platform conventions, work offline, and ship through review without drama. Release pipelines included.",
    capabilities: [
      "React Native and platform-native modules",
      "Offline-first sync and conflict resolution",
      "Push, deep linking and in-app purchase",
      "Automated release and staged rollout",
    ],
  },
  {
    slug: "web",
    icon: "Globe",
    title: "Web Engineering",
    tagline: "Fast, accessible interfaces that hold up under real traffic.",
    summary:
      "Product UIs and marketing surfaces engineered for Core Web Vitals, WCAG compliance and the long tail of devices your analytics actually show.",
    capabilities: [
      "Design systems and component libraries",
      "Performance budgets and Core Web Vitals",
      "WCAG 2.2 AA accessibility",
      "Server rendering and edge delivery",
    ],
  },
  {
    slug: "cloud",
    icon: "Cloud",
    title: "Cloud & Platform",
    tagline: "Infrastructure your engineers can reason about at 3am.",
    summary:
      "Reproducible environments, sane deployment paths and observability that answers questions instead of generating dashboards nobody reads.",
    capabilities: [
      "Infrastructure as code and environment parity",
      "CI/CD pipelines and progressive delivery",
      "Observability, SLOs and alerting",
      "Cost optimisation and capacity planning",
    ],
  },
  {
    slug: "iot",
    icon: "Cpu",
    title: "IoT & Telemetry",
    tagline: "Fleets, firmware and the pipelines that keep them honest.",
    summary:
      "High-volume device ingestion, over-the-air update paths and the time-series backends that make a connected fleet operable rather than merely connected.",
    capabilities: [
      "Device provisioning and identity",
      "High-throughput telemetry ingestion",
      "Over-the-air firmware delivery",
      "Time-series storage and fleet analytics",
    ],
  },
  {
    slug: "enterprise",
    icon: "Building2",
    title: "Enterprise Modernisation",
    tagline: "Moving critical systems forward without stopping the business.",
    summary:
      "Incremental migration of legacy platforms — strangler-fig cutovers, integration layers and the compliance evidence your auditors will ask for.",
    capabilities: [
      "Legacy assessment and migration strategy",
      "Incremental cutover and strangler patterns",
      "SSO, RBAC and audit logging",
      "SOC 2 and GDPR readiness",
    ],
  },
];

export const serviceBySlug = Object.fromEntries(services.map((s) => [s.slug, s]));
