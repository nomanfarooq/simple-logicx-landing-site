import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Section from "../components/ui/Section";
import ArticleBody, { headings } from "../components/ui/ArticleBody";
import Reveal from "../components/motion/Reveal";
import CTA from "../sections/CTA";
import Seo, { articleJsonLd, breadcrumbJsonLd } from "../lib/seo";
import { useScrollTo } from "../hooks/useLenisInstance";
import { insightBySlug, insights } from "../content/insights";

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/**
 * Article (§4.1 — long-form technical writing).
 *
 * Composition: hero with byline, table of contents, body, author, next article,
 * CTA.
 *
 * The contents list is generated from the body's `h2` blocks rather than
 * authored, so it cannot list a section the article does not have. It is a
 * plain anchor list — no scroll-spy. Highlighting the "current" section needs
 * a scroll listener whose answer is ambiguous whenever two headings are on
 * screen, and the reader already knows where they are.
 */
export default function Article() {
  const { slug } = useParams();
  const scrollTo = useScrollTo();
  const post = insightBySlug[slug];

  // Unknown slug is a genuine 404, not an empty page.
  if (!post) return <Navigate to="/404" replace />;

  const toc = headings(post.body);
  const index = insights.findIndex((i) => i.slug === post.slug);
  // Wraps, so the oldest article is not a dead end.
  const next = insights[(index + 1) % insights.length];

  return (
    <>
      <Seo
        title={post.title}
        description={post.excerpt}
        path={`/insights/${post.slug}`}
        type="article"
        jsonLd={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Insights", path: "/insights" },
            { name: post.title, path: `/insights/${post.slug}` },
          ]),
          articleJsonLd(post),
        ]}
      />

      <PageHeader eyebrow={post.tag} title={post.title} lead={post.excerpt}>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 font-mono text-xs text-ink-muted">
          <span className="text-ink">{post.author.name}</span>
          <span>{post.author.role}</span>
          <time dateTime={post.date}>{dateFmt.format(new Date(post.date))}</time>
          <span>{post.readingTime} read</span>
        </div>
      </PageHeader>

      <Section>
        <div className="grid gap-12 lg:grid-cols-[240px_1fr] lg:gap-16">
          {/* Contents. Ordered first in the DOM so it is reachable by keyboard
              before a few thousand words of body, and sticky only where there
              is room for it to be. */}
          <Reveal
            as="nav"
            aria-label="On this page"
            className="lg:sticky lg:top-28 lg:self-start"
          >
            <h2 className="font-mono text-xs uppercase tracking-wider text-accent">
              On this page
            </h2>
            <ol className="mt-4 flex flex-col gap-3 border-l border-line">
              {toc.map((h) => (
                <li key={h.id}>
                  {/* Stays a real anchor so it works without JS and can be
                      copied as a link. The handler exists because a native
                      hash jump sets scrollTop directly, and Lenis holds its
                      own target and animates straight back. */}
                  <a
                    href={`#${h.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollTo(`#${h.id}`);
                    }}
                    className="-ml-px block border-l border-transparent pl-4 text-sm text-ink-muted transition-colors hover:border-accent hover:text-accent"
                  >
                    {h.text}
                  </a>
                </li>
              ))}
            </ol>
          </Reveal>

          {/* Measure is capped here rather than by Section's `article` size,
              because this column sits beside the contents rail. */}
          <Reveal delay={0.1} className="min-w-0 max-w-3xl">
            <ArticleBody body={post.body} />

            <div className="mt-16 flex flex-col gap-4 border-t border-line pt-8 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex gap-4">
                <span
                  aria-hidden="true"
                  className="grid size-12 shrink-0 place-items-center rounded-full border border-line bg-surface font-display text-sm font-semibold text-accent"
                >
                  {post.author.initials}
                </span>
                <span>
                  <span className="block font-medium text-ink">
                    {post.author.name}
                  </span>
                  <span className="block text-sm text-ink-muted">
                    {post.author.role} · {post.author.location}
                  </span>
                </span>
              </div>
              <Link
                to="/insights"
                className="group inline-flex items-center gap-2 text-sm font-medium text-accent"
              >
                <ArrowLeft
                  aria-hidden="true"
                  className="size-4 transition-transform group-hover:-translate-x-1"
                />
                All insights
              </Link>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Onward navigation — never leave a leaf page as a dead end. */}
      <Section surface="raised">
        <Reveal className="mx-auto max-w-3xl">
          <h2 className="font-mono text-xs uppercase tracking-wider text-accent">
            Read next
          </h2>
          <Link
            to={`/insights/${next.slug}`}
            className="group mt-5 block rounded-(--radius-card) border border-line bg-surface p-7 transition-colors hover:border-accent/40 hover:bg-surface-hover"
          >
            <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-ink-muted">
              <span className="rounded-(--radius-pill) border border-line px-2.5 py-1 text-accent">
                {next.tag}
              </span>
              <span>{next.readingTime} read</span>
            </div>
            <h3 className="mt-4 font-display text-2xl font-semibold text-ink transition-colors group-hover:text-accent">
              {next.title}
            </h3>
            <p className="mt-2 text-ink-muted">{next.excerpt}</p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-accent">
              Read article
              <ArrowRight
                aria-hidden="true"
                className="size-4 transition-transform group-hover:translate-x-1"
              />
            </span>
          </Link>
        </Reveal>
      </Section>

      <CTA />
    </>
  );
}
