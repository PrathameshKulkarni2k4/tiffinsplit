"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Development-only accessibility audit.
 *
 * Loads axe-core and logs any accessibility violations to the browser
 * console, so problems surface while you are building a screen rather than
 * after someone reports them. It is deliberately a runtime-only, dev-only
 * hook:
 *
 *   - `process.env.NODE_ENV` is replaced at build time, so this effect
 *     compiles away to nothing in production and never runs there.
 *   - axe-core is fetched from a CDN at runtime instead of being installed
 *     as a dependency, so none of its ~500 KB ever reaches a production
 *     bundle. Production page weight is unchanged.
 *
 * To audit a screen: run `npm run dev`, open the page, and check the
 * console. Violations are grouped and printed with the offending nodes.
 */

type AxeViolation = {
  id: string;
  impact?: string | null;
  help: string;
  helpUrl?: string;
  nodes: unknown[];
};

type AxeResult = { violations: AxeViolation[] };

type WindowWithAxe = Window & {
  axe?: { run: (context: Document) => Promise<AxeResult> };
};

const AXE_CDN = "https://unpkg.com/axe-core@4/axe.min.js";

let axeLoader: Promise<void> | null = null;

function loadAxe(): Promise<void> {
  if (axeLoader) return axeLoader;
  axeLoader = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = AXE_CDN;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("axe-core failed to load"));
    document.body.appendChild(script);
  });
  return axeLoader;
}

export default function AxeDev() {
  const pathname = usePathname();

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    let cancelled = false;

    // Give the page a moment to paint before auditing it.
    const timer = setTimeout(() => {
      loadAxe()
        .then(() => {
          const axe = (window as WindowWithAxe).axe;
          if (!axe || cancelled) return;
          return axe.run(document).then((results) => {
            if (cancelled) return;
            if (results.violations.length === 0) {
              console.info("[axe] no accessibility violations on %s", pathname);
              return;
            }
            console.group(
              "[axe] %d accessibility violation(s) on %s",
              results.violations.length,
              pathname,
            );
            results.violations.forEach((v) => {
              console.warn(
                "[axe] %s (%s) — %s",
                v.id,
                v.impact ?? "unknown",
                v.help,
                v.helpUrl ?? "",
              );
            });
            console.groupEnd();
          });
        })
        .catch(() => {
          /* offline or CDN blocked — never break the page over an audit */
        });
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [pathname]);

  return null;
}
