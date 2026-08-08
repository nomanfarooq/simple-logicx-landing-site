import { useEffect, useState, useCallback } from "react";
import Container from "../components/ui/Container";
import Section from "../components/ui/Section";
import { useTheme } from "../hooks/useTheme";

/**
 * DEV-ONLY layout verification harness (§11 step 2).
 *
 * This is the gate the rebuild must pass before any page gets built. It does
 * not test that the layout "looks centred" — it measures it, and it does so
 * against deliberately hostile content chosen to reproduce the exact failure
 * modes found in v1:
 *
 *   - oversized blur orbs inside a section (v1 shipped 4 unclipped)
 *   - a long unbroken token in a flex row (the min-width:auto trap)
 *   - a wide data table
 *   - a horizontally scrolling strip / marquee
 *   - nested containers
 *
 * Delete this directory at cutover.
 */

function useMeasurements() {
  const [m, setM] = useState(null);

  const measure = useCallback(() => {
    const vw = window.innerWidth;
    const docW = document.documentElement.scrollWidth;

    const probes = [...document.querySelectorAll("[data-probe-container]")].map(
      (el) => {
        const r = el.getBoundingClientRect();
        return {
          label: el.dataset.probeContainer,
          left: Math.round(r.left * 100) / 100,
          right: Math.round((vw - r.right) * 100) / 100,
          width: Math.round(r.width),
        };
      },
    );

    // Elements poking outside the viewport that ACTUALLY widen the document.
    //
    // getBoundingClientRect returns the unclipped geometry, so a blur orb
    // sitting inside an `overflow: hidden` section still reports as "outside"
    // even though it is visually clipped and adds no scroll. Reporting those
    // would make this harness cry wolf on a passing layout, so we only look
    // when the document is genuinely wider than the viewport.
    const bleeding =
      docW <= vw
        ? []
        : [...document.querySelectorAll("body *")]
      .filter((el) => {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) return false;
        if (getComputedStyle(el).position === "fixed") return false;
        return r.right > vw + 1 || r.left < -1;
      })
      .slice(0, 8)
      .map((el) => {
        const r = el.getBoundingClientRect();
        return {
          tag: el.tagName.toLowerCase(),
          cls: (typeof el.className === "string" ? el.className : "").slice(0, 70),
          left: Math.round(r.left),
          right: Math.round(r.right),
        };
      });

    setM({ vw, docW, overflow: docW - vw, probes, bleeding });
  }, []);

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.documentElement);
    window.addEventListener("resize", measure);
    const t = setInterval(measure, 500); // catches animation-driven bleed
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      clearInterval(t);
    };
  }, [measure]);

  return m;
}

function Readout() {
  const m = useMeasurements();
  const { theme, resolved, setTheme } = useTheme();
  if (!m) return null;

  const noOverflow = m.overflow === 0;
  const asymmetric = m.probes.filter((p) => Math.abs(p.left - p.right) > 1);
  const centred = asymmetric.length === 0;
  const pass = noOverflow && centred;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[10000] max-h-[45vh] overflow-auto border-t border-line-strong bg-raised/95 px-4 py-3 font-mono text-xs backdrop-blur-xl">
      <div className="mx-auto flex max-w-default flex-wrap items-center gap-x-5 gap-y-2">
        <strong
          className={
            pass
              ? "rounded px-2 py-1 text-[color:var(--color-lime)]"
              : "rounded px-2 py-1 text-[color:var(--color-coral)]"
          }
        >
          {pass ? "PASS" : "FAIL"}
        </strong>

        <span>
          viewport <b>{m.vw}</b>
        </span>
        <span>
          scrollWidth <b>{m.docW}</b>
        </span>
        <span className={noOverflow ? "" : "text-[color:var(--color-coral)]"}>
          overflow <b>{m.overflow}px</b>
        </span>

        <span className="ml-auto flex gap-1">
          {["system", "light", "dark"].map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`rounded border px-2 py-1 ${
                theme === t
                  ? "border-accent text-accent"
                  : "border-line text-ink-muted"
              }`}
            >
              {t}
            </button>
          ))}
          <span className="self-center pl-2 text-ink-muted">→ {resolved}</span>
        </span>
      </div>

      <div className="mx-auto mt-2 max-w-default">
        <table className="w-full text-left">
          <thead className="text-ink-muted">
            <tr>
              <th className="pr-4 font-normal">container</th>
              <th className="pr-4 font-normal">width</th>
              <th className="pr-4 font-normal">gap L</th>
              <th className="pr-4 font-normal">gap R</th>
              <th className="font-normal">Δ</th>
            </tr>
          </thead>
          <tbody>
            {m.probes.map((p) => {
              const d = Math.round((p.left - p.right) * 100) / 100;
              return (
                <tr
                  key={p.label}
                  className={Math.abs(d) > 1 ? "text-[color:var(--color-coral)]" : ""}
                >
                  <td className="pr-4">{p.label}</td>
                  <td className="pr-4">{p.width}</td>
                  <td className="pr-4">{p.left}</td>
                  <td className="pr-4">{p.right}</td>
                  <td>{d}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {m.bleeding.length > 0 && (
          <div className="mt-2 text-[color:var(--color-coral)]">
            <div className="font-bold">bleeding elements:</div>
            {m.bleeding.map((b, i) => (
              <div key={i}>
                {b.tag}.{b.cls} — L{b.left} R{b.right}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* Visual centre-line: if the container is centred, the marker sits on it. */
function CentreLine() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-y-0 left-1/2 z-[9998] w-px bg-[color:var(--color-coral)] opacity-40"
    />
  );
}

function Box({ children, label }) {
  return (
    <div className="rounded-(--radius-card) border border-line bg-surface p-6">
      <div className="mb-2 font-mono text-xs text-ink-muted">{label}</div>
      {children}
    </div>
  );
}

export default function LayoutProbe() {
  return (
    <>
      <div aria-hidden="true" className="noise-overlay" />
      <CentreLine />

      <main className="pb-[46vh]">
        {/* Every container size, measured. */}
        {["wide", "default", "article", "narrow"].map((size) => (
          <Section key={size} size={size} surface={size === "default" ? "raised" : "base"}>
            <div data-probe-container={size}>
              <Box label={`<Section size="${size}">`}>
                <h2 className="text-h2 grad-primary text-grad">
                  Centred at every breakpoint
                </h2>
                <p className="mt-3 text-ink-soft">
                  Gap L and gap R in the readout below must match within 1px.
                </p>
              </Box>
            </div>
          </Section>
        ))}

        {/* Hostile case 1: oversized decoration — v1's unclipped orbs. */}
        <Section
          surface="sunken"
          decoration={
            <>
              <div className="grad-primary-wide absolute -left-40 top-1/4 h-[600px] w-[600px] rounded-full opacity-(--orb-opacity) blur-[140px]" />
              <div className="grad-primary-wide absolute -right-40 bottom-0 h-[700px] w-[700px] rounded-full opacity-(--orb-opacity) blur-[160px]" />
            </>
          }
        >
          <div data-probe-container="orbs">
            <Box label="oversized orbs, deliberately overflowing the section box">
              <p className="text-ink-soft">
                Two orbs wider than the section, pushed past both edges. Section
                clipping must absorb them — overflow above must stay 0.
              </p>
            </Box>
          </div>
        </Section>

        {/* Hostile case 2: the min-width:auto flex trap. */}
        <Section>
          <div data-probe-container="flex-trap">
            <Box label="long unbroken token inside a flex row">
              <div className="flex gap-4">
                <div className="shrink-0 rounded-full bg-surface px-4 py-2">fixed</div>
                <div className="overflow-hidden text-ellipsis whitespace-nowrap rounded bg-surface px-4 py-2 font-mono">
                  postgresql://readreplica.eu-west-1.simplelogicx.internal:5432/analytics_warehouse_prod?sslmode=verify-full&pool=32
                </div>
              </div>
            </Box>
          </div>
        </Section>

        {/* Hostile case 3: wide table must scroll in its own box, not the page. */}
        <Section surface="raised">
          <div data-probe-container="table">
            <Box label="wide table — must scroll itself, never the page">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="text-ink-muted">
                    <tr>
                      {["Service", "Stack", "Region", "SLA", "p99", "Owner"].map((h) => (
                        <th key={h} className="border-b border-line py-2 pr-6 font-normal">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["ingest-gateway", "Rust / Kafka", "eu-west-1", "99.99%", "42ms", "Platform"],
                      ["model-router", "Python / Triton", "us-east-1", "99.95%", "180ms", "AI"],
                      ["billing-ledger", "Go / Postgres", "eu-central-1", "99.99%", "28ms", "Payments"],
                    ].map((row) => (
                      <tr key={row[0]}>
                        {row.map((c) => (
                          <td key={c} className="border-b border-line py-2 pr-6">
                            {c}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Box>
          </div>
        </Section>

        {/* Hostile case 4: animated marquee — bleed can appear mid-animation. */}
        <Section>
          <div data-probe-container="marquee">
            <Box label="animated marquee (probe re-measures every 500ms)">
              <div className="overflow-hidden">
                <div className="flex w-max gap-10 whitespace-nowrap [animation:probe-marquee_18s_linear_infinite]">
                  {[...Array(2)].map((_, dup) =>
                    ["React", "TypeScript", "Rust", "Kubernetes", "Postgres", "Terraform"].map(
                      (t) => (
                        <span key={`${dup}-${t}`} className="text-h3 text-ink-muted">
                          {t}
                        </span>
                      ),
                    ),
                  )}
                </div>
              </div>
            </Box>
          </div>
        </Section>

        {/* Approved gradients — visual check that none ramps through green. */}
        <Section surface="raised">
          <div data-probe-container="gradients">
            <Box label="approved gradients (§2.3) — none may pass through green">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {[
                  ["grad-primary", "grad-primary"],
                  ["grad-primary-wide", "grad-primary-wide"],
                  ["grad-warm", "grad-warm"],
                  ["grad-alert", "grad-alert"],
                ].map(([label, cls]) => (
                  <div key={label}>
                    <div className={`${cls} h-20 rounded-(--radius-card)`} />
                    <div className="mt-2 font-mono text-xs text-ink-muted">{label}</div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center gap-3 border-t border-line pt-4">
                <span className="inline-block size-2 rounded-full bg-[color:var(--color-lime)]" />
                <span className="text-sm text-ink-soft">
                  Lime appears only as a flat status dot — never in a gradient,
                  max 2 per page.
                </span>
              </div>
            </Box>
          </div>
        </Section>

        <style>{`@keyframes probe-marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
      </main>

      <Readout />
    </>
  );
}
