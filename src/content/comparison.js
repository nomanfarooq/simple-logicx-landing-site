/**
 * "Why choose us" comparison rows.
 *
 * Written as specific, falsifiable differences rather than adjectives. A
 * comparison table that says "quality code" vs "poor code" persuades nobody;
 * naming the actual behaviour does.
 */
export const comparison = [
  {
    dimension: "Who writes the code",
    typical: "Senior engineers pitch, juniors deliver",
    ours: "The engineers in the pitch are the engineers on the work",
  },
  {
    dimension: "First deployment",
    typical: "A staging reveal near the end",
    ours: "Real environment in week one, demoed fortnightly",
  },
  {
    dimension: "When scope is wrong",
    typical: "Build it anyway — it is in the statement of work",
    ours: "We say so, even when it costs us the contract",
  },
  {
    dimension: "Operational handover",
    typical: "A repository and good luck",
    ours: "Runbooks, ADRs, on-call rotation, team enablement",
  },
  {
    dimension: "Accessibility and performance",
    typical: "A pass at the end, if budget survives",
    ours: "Budgets set at architecture, enforced in CI",
  },
  {
    dimension: "After launch",
    typical: "Invoice, then silence",
    ours: "On call through the first quarter of production traffic",
  },
];
