import { team } from "./team";

/**
 * Insights — index metadata and full article bodies.
 *
 * Bodies are structured blocks rather than HTML strings or MDX. Three reasons:
 * every block renders through a component that already owns the typography, so
 * an article cannot introduce a heading level or a colour the design system
 * does not have; there is no dangerouslySetInnerHTML anywhere in the app; and
 * MDX would mean a compiler, a plugin chain and a second content pipeline for
 * three articles.
 *
 * Block types (see components/ui/ArticleBody):
 *   p        paragraph
 *   h2       section heading — also what the table of contents is built from
 *   list     unordered, for sets where order carries no meaning
 *   steps    ordered, for sequences where it does
 *   code     fenced block with a language label
 *   callout  the one thing to remember from the section above it
 *   quote    pulled quote with attribution
 *
 * `readingTime` is DERIVED at the bottom of this file, never authored. A number
 * typed by hand next to a body that later changes is a small lie the page then
 * repeats forever.
 *
 * `author` is a name from `team`, resolved to the person at the bottom of this
 * file so an article cannot be bylined to someone who is not on the team page.
 */

const posts = [
  {
    slug: "unlayered-css-resets",
    title: "The unlayered reset that silently breaks Tailwind v4",
    excerpt:
      "Why `* { margin: 0 }` outside a cascade layer overrides every utility you write — and why it only shows up on large monitors.",
    date: "2026-07-22",
    tag: "Frontend",
    author: "Tom Okafor",
    body: [
      {
        type: "p",
        text: "A site we had just rebuilt looked correct on every laptop in the office and visibly wrong on the client's 27-inch monitor. Content sat left of centre by a few hundred pixels, in a layout whose every container was `mx-auto`. Nobody could reproduce it below 1600px, which is the worst possible property for a bug to have.",
      },
      {
        type: "p",
        text: "The cause was four lines in a global stylesheet, written before Tailwind v4 landed and never revisited. They are worth understanding in detail, because the failure mode is invisible in code review and the fix is a one-word change.",
      },

      { type: "h2", text: "What cascade layers changed" },
      {
        type: "p",
        text: "Tailwind v4 puts everything it generates into named cascade layers: `@layer theme, base, components, utilities`. That is a real improvement over v3's approach, because layer order beats specificity. A utility in the `utilities` layer wins over a component class in the `components` layer regardless of how many selectors that component class is built from. You stop writing `!important` to defeat your own design system.",
      },
      {
        type: "p",
        text: "There is a rule most people meet only when it bites them: unlayered styles beat layered ones. Not the other way round. Any declaration outside every `@layer` block sits in an implicit final layer that wins against all named layers, whatever the specificity.",
      },
      {
        type: "code",
        lang: "css",
        code: `/* unlayered — wins against every Tailwind utility */
* {
  margin: 0;
  padding: 0;
}

@layer utilities {
  .mx-auto { margin-inline: auto; }   /* loses */
}`,
      },
      {
        type: "p",
        text: "The universal selector has specificity (0,0,0) — the lowest there is. In a pre-layers world it lost to literally everything, which is exactly why resets are written that way and why generations of us have stopped thinking about them. Under cascade layers, specificity is not the deciding factor. Layer position is, and unlayered wins.",
      },
      {
        type: "callout",
        title: "The rule in one line",
        body: "Unlayered CSS beats layered CSS, no matter the specificity. A reset written as `* { margin: 0 }` outside `@layer` overrides every margin utility Tailwind generates, including `mx-auto`.",
      },

      { type: "h2", text: "Why only on wide screens" },
      {
        type: "p",
        text: "This is the part that made the bug hard to find. `margin-inline: auto` only produces visible centring when the element is narrower than its containing block. Below the point where the container hits its `max-width`, the container fills the viewport, the auto margins resolve to zero, and a broken `mx-auto` looks identical to a working one.",
      },
      {
        type: "p",
        text: "So the bug is dormant at every width below the largest breakpoint and appears the moment the container stops filling the screen. Everyone on a 1440px laptop sees a correct page. The client on a 2560px monitor sees content pinned to the left. And because both are looking at the same commit, the conversation goes in circles for a day.",
      },
      {
        type: "list",
        items: [
          "Below the max-width: container fills the viewport, auto margins compute to 0, no visible difference.",
          "Above it: the container is narrower than its parent, auto margins should split the remainder, and the reset stops them.",
          "The wider the monitor, the larger the offset — so it reads as a scaling problem rather than a cascade problem.",
        ],
      },

      { type: "h2", text: "A second symptom on the same cause" },
      {
        type: "p",
        text: "Before the centring was traced back to the reset, the team had spent time on a different symptom: horizontal scrolling on tablet widths. Decorative blur orbs inside several sections extended past the viewport, the document grew wider than the window, and every `mx-auto` on the page then centred against that wider box.",
      },
      {
        type: "p",
        text: "That is genuinely a second bug — sections that render decoration must clip it — but it produced the same visible symptom, which is how the two got tangled. Worth separating early: overflow shifts content because the containing block is wrong, and an unlayered reset shifts content because the margin never applies. Check `document.documentElement.scrollWidth` against `window.innerWidth` first; that one measurement tells you which of the two you are looking at.",
      },
      {
        type: "code",
        lang: "js",
        code: `// Run in the console at the width where it looks wrong.
const overflow = document.documentElement.scrollWidth - window.innerWidth
const el = document.querySelector('[data-container]')
const box = el.parentElement.getBoundingClientRect()
const r = el.getBoundingClientRect()

console.log({
  overflow,                                    // > 0 -> something is not clipping
  left: r.left - box.left,
  right: box.right - r.right,                  // asymmetric -> margins not applying
})`,
      },

      { type: "h2", text: "The fix" },
      {
        type: "p",
        text: "Move the reset into `@layer base`. That is the whole change. Base sits below `utilities` in Tailwind's layer order, so utilities win again and every `mx-auto` on the site starts working.",
      },
      {
        type: "code",
        lang: "css",
        code: `@layer base {
  * {
    margin: 0;
    padding: 0;
  }
}`,
      },
      {
        type: "p",
        text: "If you are on Tailwind v4 and inherited a stylesheet from v3, this is worth ten minutes now rather than a day later. Search your CSS for declarations at the top level of a file — not inside `@layer`, not inside `@media` that is itself inside a layer — and ask of each one whether it is deliberately meant to outrank the framework. Occasionally the answer is yes. Usually it is a reset nobody has read since it was pasted in.",
      },
      {
        type: "quote",
        text: "Every rule in the stylesheet either belongs to a layer or beats every layer. There is no third option, and the default is the dangerous one.",
        cite: "The line that ended up in our review checklist",
      },

      { type: "h2", text: "How to stop it coming back" },
      {
        type: "p",
        text: "Two guards, both cheap. First, a lint rule or a review checklist item: no top-level declarations in application CSS, with named exceptions for `@font-face`, custom property definitions on `:root` and `@theme` blocks. Second — and this is the one that actually caught the regression for us — a browser-driven check that asserts centring at the widths where it can fail.",
      },
      {
        type: "steps",
        items: [
          "Load each route at 375, 768, 1440 and 2560, in both themes.",
          "Assert `scrollWidth - innerWidth === 0`, which catches the unclipped-decoration variant.",
          "For each container, assert that the left and right gaps to its parent are equal to within a pixel.",
          "Fail on any asymmetry. The whole run takes a few seconds and it is the only test that would have caught this before the client did.",
        ],
      },
      {
        type: "p",
        text: "The second check is the useful one, because it tests the property you actually care about — content is centred — rather than the mechanism you think produces it. We would not have written it if the bug had been easy to find, which is the usual way of these things.",
      },
    ],
  },

  {
    slug: "evaluating-rag-honestly",
    title: "Evaluating RAG systems honestly",
    excerpt:
      "Retrieval quality, citation faithfulness and the metrics that actually predict whether users trust the answer.",
    date: "2026-06-30",
    tag: "AI",
    author: "Nadia Haddad",
    body: [
      {
        type: "p",
        text: "Most retrieval-augmented generation systems are evaluated by their authors reading a few dozen answers and concluding that it seems good. That judgement is not worthless — a domain expert skimming outputs catches things no metric will — but it does not survive contact with a review board, it does not tell you whether last week's change helped, and it quietly optimises for answers that read well rather than answers that are right.",
      },
      {
        type: "p",
        text: "What follows is the evaluation structure we now build before the retrieval pipeline, not after it. It is more work up front and it is the only reason any of our AI engagements have passed a formal safety review.",
      },

      { type: "h2", text: "Evaluate the two halves separately" },
      {
        type: "p",
        text: "A RAG system fails in two distinct ways, and a single end-to-end score cannot tell them apart. Either retrieval did not surface the passage that contains the answer, or it did and generation ignored it, contradicted it, or embellished it. These have completely different fixes — one is a chunking, embedding or reranking problem, the other is a prompting, grounding or model problem — so an aggregate score that moves tells you nothing about what to do next.",
      },
      {
        type: "list",
        items: [
          "Retrieval: given the question, did the correct passage appear in the top k?",
          "Generation: given the passages that were retrieved, is the answer supported by them?",
          "Only after both: end to end, did the user get a correct and usable answer?",
        ],
      },
      {
        type: "callout",
        title: "Measure generation on retrieved context, not on gold context",
        body: "Scoring generation against the perfect passage tells you how the system would behave if retrieval were solved. Score it against what retrieval actually returned, including the wrong passages — that is the input the model gets in production.",
      },

      { type: "h2", text: "Retrieval metrics that are worth the trouble" },
      {
        type: "p",
        text: "Recall@k is the one that matters most and the one teams under-report. If the answer-bearing passage is not in the context window, nothing downstream can recover — no amount of prompt engineering makes a model cite a document it cannot see. Track recall@k at the k you actually pass to the model, not at k=100.",
      },
      {
        type: "p",
        text: "MRR and nDCG are useful in a narrower way: they tell you whether reranking is earning its latency. If recall@10 is 0.94 and recall@3 is 0.71, a reranker has real headroom. If they are 0.94 and 0.92, it does not, and you have found latency to give back.",
      },
      {
        type: "p",
        text: "The metric we have come to trust least in isolation is embedding similarity between the answer and the source. It is cheap, it correlates with quality across a large corpus, and it is close to useless on the specific cases that matter, because a fluent paraphrase of the wrong passage scores well.",
      },

      { type: "h2", text: "Faithfulness is a claim-level property" },
      {
        type: "p",
        text: "The question that actually predicts trust is not whether the answer is similar to the sources. It is whether every claim in the answer is supported by them. That is a per-claim check, and it has to be done at that granularity, because a four-sentence answer with three supported claims and one invented one is not seventy-five per cent correct. In a clinical or financial setting it is simply wrong, and the three correct sentences are what make it dangerous.",
      },
      {
        type: "steps",
        items: [
          "Decompose the answer into atomic claims — one assertion each, no conjunctions.",
          "For each claim, ask whether the retrieved context entails it, contradicts it, or is silent.",
          "Score the answer on its worst claim, not its average.",
          "Report unsupported claims individually, with the sentence and the passage that should have supported it.",
        ],
      },
      {
        type: "p",
        text: "Scoring on the worst claim is the decision that makes the harness useful. Averages hide exactly the failures you built the harness to catch, and they let a change that adds a hallucination look like an improvement because it also added three safe sentences.",
      },
      {
        type: "p",
        text: "One record per claim, and the record has to be readable without the code that produced it. This is the shape we settle on almost every time:",
      },
      {
        type: "code",
        lang: "json",
        code: `{
  "question_id": "q_0481",
  "question": "What is the maximum infusion rate for this protocol?",
  "answer_claim": "The protocol caps the rate at 125 mL/hour.",
  "verdict": "unsupported",
  "retrieved_passage_ids": ["doc_12#p4", "doc_12#p5", "doc_31#p1"],
  "supporting_span": null,
  "judge": {
    "model": "judge-2026-05",
    "agreement_with_humans": 0.91,
    "reason": "Passages state a 125 mL/hour cap for a different protocol."
  }
}`,
      },
      {
        type: "p",
        text: "Note the two null fields. A verdict of unsupported with no supporting span is the record doing its job; a verdict of supported with no span is a bug in the harness, and making both visible in the same structure is what lets you catch it.",
      },

      { type: "h2", text: "On using a model as the judge" },
      {
        type: "p",
        text: "Model-graded evaluation is the only affordable way to run claim-level checks at scale, and it is trustworthy exactly to the degree that you have measured the judge. Treat the judge as a component under test, not as an oracle.",
      },
      {
        type: "list",
        items: [
          "Hold out a few hundred human-labelled examples and report the judge's agreement with them, per label, as a headline number alongside every score it produces.",
          "Give the judge the claim and the passage only — never the question, never which system produced the answer. Judges that can see provenance develop preferences.",
          "Force a citation: the judge must quote the span it believes supports the claim. A judge that cannot quote is guessing, and now you can see it.",
          "Re-measure agreement whenever the judge model changes. A silent provider upgrade moves your scores and nothing in your pipeline will tell you.",
        ],
      },
      {
        type: "quote",
        text: "An evaluation you have not evaluated is a number with a confident font.",
        cite: "Written on a whiteboard during a clinical safety review, and never rubbed off",
      },

      { type: "h2", text: "Build the set from real questions" },
      {
        type: "p",
        text: "Synthetic evaluation sets — questions generated from your own documents — are useful for coverage and terrible as your only source. They inherit the vocabulary of the corpus, so they systematically overstate retrieval performance: the question uses the same words as the passage because a model wrote it from that passage. Real users do not have your corpus in front of them.",
      },
      {
        type: "p",
        text: "The mix we aim for, in rough order of how much each is worth: questions from real logs or from a pilot; questions written by domain experts who have never seen the corpus; adversarial questions written to break the system; and synthetic questions to fill the gaps the first three leave.",
      },
      {
        type: "p",
        text: "The adversarial slice is small and disproportionately valuable. It should include questions the corpus genuinely cannot answer, because the most common production failure is not a wrong answer to an answerable question — it is a confident answer to a question with no support at all. If your set contains no unanswerable questions, you are not measuring refusal, and refusal is most of safety.",
      },

      { type: "h2", text: "What to put in front of a review board" },
      {
        type: "p",
        text: "The output that survives scrutiny is not a dashboard of aggregate scores. It is a table a domain expert can argue with: one row per question, showing the answer, every claim, the passage that supported or failed to support it, and the verdict. Give them that and they will find things the metrics never will, which is the point.",
      },
      {
        type: "list",
        items: [
          "Recall@k at production k, with the failures listed rather than counted.",
          "Claim-level faithfulness, scored on the worst claim, with every unsupported claim shown in full.",
          "Refusal behaviour on the unanswerable slice, reported separately — this is usually the number a board cares about most.",
          "Judge–human agreement, so every number above has a stated error bar.",
          "A diff against the previous run. A score with no history is an anecdote.",
        ],
      },
      {
        type: "callout",
        title: "The bar we hold ourselves to",
        body: "No model ships without an evaluation harness the client's own domain experts can read and argue with. If the only people who can interpret the evaluation are the people who built the system, it is not an evaluation — it is a demo with numbers.",
      },
      {
        type: "p",
        text: "None of this is exotic. It is mostly the discipline of measuring the two halves separately, scoring at claim granularity, and being honest about the judge. The reason it is rare is that it is slower than shipping, and it produces numbers lower than the ones in the pitch. Both of those are features.",
      },
    ],
  },

  {
    slug: "migrations-without-downtime",
    title: "Migrations without downtime, without heroics",
    excerpt:
      "Strangler-fig cutovers, dual writes and the boring discipline that keeps a migration reversible at every step.",
    date: "2026-06-04",
    tag: "Architecture",
    author: "Elena Vasilenko",
    body: [
      {
        type: "p",
        text: "The migrations that go badly are not the technically hardest ones. They are the ones with a cutover weekend, a rollback plan written as a paragraph rather than a command, and a team that finds out at 03:00 that the old system cannot be restarted because something has already written to the new one.",
      },
      {
        type: "p",
        text: "Every migration we have run to completion has followed the same shape, and none of it is clever. The discipline is in refusing to skip a step when the schedule is tight, which is precisely when skipping one looks reasonable.",
      },

      { type: "h2", text: "Reversibility is the only real requirement" },
      {
        type: "p",
        text: "Almost everything else is negotiable. If every step can be undone with one command, the migration is a sequence of small decisions you can take on a Tuesday afternoon. If any step cannot, the whole thing collapses into a single high-stakes event, and high-stakes events are where organisations make their worst calls.",
      },
      {
        type: "p",
        text: "The practical test is uncomfortable and worth applying honestly: for each step, can you name the command that reverses it, has that command been run in a real environment, and how long does it take? A rollback plan nobody has executed is a hypothesis.",
      },
      {
        type: "callout",
        title: "The test",
        body: "Point at any step and ask: what is the exact command that undoes this, who has run it, and how long did it take? Three answers, or the step is not ready.",
      },

      { type: "h2", text: "Shadow before you switch" },
      {
        type: "p",
        text: "The new system should do the work and have nobody act on it, for long enough to be boring. Run it in parallel, score its output against what the old system actually did, and keep the difference in a dashboard somebody looks at every morning.",
      },
      {
        type: "p",
        text: "On a fleet dispatch engine we shadowed for six weeks before a single depot changed behaviour. That period cost real money and produced no visible progress, and it caught three edge cases in driver-hours rules that appeared in no documentation and in nobody's memory. Those three would have been discovered in production, at the worst possible moment, by the people least equipped to explain them.",
      },
      {
        type: "list",
        items: [
          "Shadow long enough to cross a natural cycle — a month end, a peak period, a payroll run.",
          "Score automatically, and treat a divergence as a defect until someone proves it is an improvement.",
          "Publish the divergence rate where the business can see it. It is the number that earns permission to cut over.",
        ],
      },

      { type: "h2", text: "Dual writes, and the trap in them" },
      {
        type: "p",
        text: "Writing to both systems while reading from one is the standard technique and it has a well-known failure mode: two writes are not atomic. The application writes to the old store, succeeds, writes to the new store, fails, and the two disagree. Do that a few thousand times and reconciliation becomes its own project.",
      },
      {
        type: "steps",
        items: [
          "Make one store authoritative. Not both. The other is a follower, always, until the day it is not.",
          "Propagate from the authoritative store's own log — change data capture, an outbox table, whatever fits — rather than from application code writing twice.",
          "Reconcile continuously and cheaply: compare counts and checksums per window, not the whole table.",
          "Alert on drift immediately. Drift that is discovered weekly is drift you will fix by hand.",
        ],
      },
      {
        type: "p",
        text: "The outbox pattern is worth the extra table. The application writes its change and an event describing it in one local transaction; a separate process ships the event onward. You give up a little latency and you get atomicity back, which is the thing you were missing.",
      },
      {
        type: "code",
        lang: "sql",
        code: `BEGIN;
  UPDATE ledger_entries
     SET status = 'settled'
   WHERE id = $1;

  INSERT INTO outbox (aggregate_id, event_type, payload)
  VALUES ($1, 'entry.settled', $2);
COMMIT;
-- One transaction. Either both rows exist or neither does.
-- A separate relay ships outbox rows to the new system, at least once.`,
      },
      {
        type: "p",
        text: "At-least-once delivery means the consumer must be idempotent. That is a real constraint and it is much cheaper to design in now than to retrofit after the first duplicate lands in a financial ledger.",
      },

      { type: "h2", text: "Cut over in the smallest unit the domain allows" },
      {
        type: "p",
        text: "Find the natural seam — a depot, a tenant, a region, a customer segment — and move one. Smallest first, so the first cutover is the one you learn on rather than the one you cannot afford to get wrong. Nine of ten depots ran on the new engine before the largest one moved.",
      },
      {
        type: "p",
        text: "Each unit gets a supervised first week, a named person watching, and a revert that has been tested that morning. The second cutover is faster than the first, the fifth is routine, and by the tenth the argument is about scheduling rather than about risk. That progression is the entire point: you are converting an unknown into a known before it costs anything.",
      },
      {
        type: "quote",
        text: "Every step was reversible, which is the only reason our risk committee signed it off.",
        cite: "Sofia Almeida, CTO, Atlas Payments",
      },

      { type: "h2", text: "Decommission deliberately" },
      {
        type: "p",
        text: "The last step is the one teams skip, and skipping it is how organisations end up maintaining two systems for years. Keep the old system warm until a full business cycle has passed on the new one — a quarter end, a peak season, an audit — then switch it off on a date agreed in advance and written down.",
      },
      {
        type: "p",
        text: "On the dispatch engagement the batch planner was switched off eleven weeks after the last depot migrated. Eleven weeks felt cautious at the time. It was cheap insurance against the one failure mode nobody had modelled, and it meant the decommission was a scheduled task rather than an argument.",
      },
      {
        type: "list",
        items: [
          "Agree the switch-off date when the last unit migrates, not later.",
          "Require a full business cycle on the new system before it arrives.",
          "Delete the dual-write path in the same change. A dormant write path is a live one that nobody is watching.",
        ],
      },

      { type: "h2", text: "What this costs" },
      {
        type: "p",
        text: "More elapsed time and less drama. A shadowed, per-unit, reversible migration takes longer on the calendar than a cutover weekend and consumes far less of the organisation's attention while it happens. Nobody writes a post about it afterwards, which is the correct outcome and a genuinely difficult thing to sell.",
      },
      {
        type: "p",
        text: "The honest trade is this: you are spending predictable engineering time to avoid an unpredictable outage. If the system you are migrating cannot tolerate being wrong for an afternoon, that trade is not close.",
      },
    ],
  },
];

/** Words per minute for the reading-time estimate. Deliberately conservative. */
const WPM = 200;

const blockText = (b) =>
  [b.text, b.code, b.body, b.quote?.text, ...(b.items ?? [])]
    .filter(Boolean)
    .join(" ");

const wordCount = (body) =>
  body.reduce((n, b) => n + blockText(b).trim().split(/\s+/).filter(Boolean).length, 0);

const authorByName = Object.fromEntries(team.map((m) => [m.name, m]));

/**
 * Reading time and author are resolved here rather than authored inline, so
 * neither can contradict the thing it describes. An unknown byline throws at
 * module load — a build-time failure, not a page that renders "undefined".
 */
export const insights = posts
  .map((post) => {
    const author = authorByName[post.author];
    if (!author) {
      throw new Error(
        `insights: "${post.slug}" is bylined to "${post.author}", who is not in content/team.js`,
      );
    }
    const words = wordCount(post.body);
    return {
      ...post,
      author,
      words,
      readingTime: `${Math.max(1, Math.round(words / WPM))} min`,
    };
  })
  .sort((a, b) => b.date.localeCompare(a.date));

export const insightBySlug = Object.fromEntries(insights.map((i) => [i.slug, i]));

/** Tags present in the content, for the index filter. Never hand-listed. */
export const insightTags = [...new Set(insights.map((i) => i.tag))].sort();
