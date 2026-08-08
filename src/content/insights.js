/**
 * Insights index. Full article bodies land in step 9 (§11).
 */
export const insights = [
  {
    slug: "unlayered-css-resets",
    title: "The unlayered reset that silently breaks Tailwind v4",
    excerpt:
      "Why `* { margin: 0 }` outside a cascade layer overrides every utility you write — and why it only shows up on large monitors.",
    date: "2026-07-22",
    readingTime: "6 min",
    tag: "Frontend",
  },
  {
    slug: "evaluating-rag-honestly",
    title: "Evaluating RAG systems honestly",
    excerpt:
      "Retrieval quality, citation faithfulness and the metrics that actually predict whether users trust the answer.",
    date: "2026-06-30",
    readingTime: "11 min",
    tag: "AI",
  },
  {
    slug: "migrations-without-downtime",
    title: "Migrations without downtime, without heroics",
    excerpt:
      "Strangler-fig cutovers, dual writes and the boring discipline that keeps a migration reversible at every step.",
    date: "2026-06-04",
    readingTime: "9 min",
    tag: "Architecture",
  },
];

export const insightBySlug = Object.fromEntries(insights.map((i) => [i.slug, i]));
