const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Format a number as Indian rupees, e.g. 45 -> "₹45.00". */
export function money(n: number | string | null | undefined): string {
  const value = Number(n ?? 0);
  return inr.format(Number.isFinite(value) ? value : 0);
}

/** Format an ISO date (YYYY-MM-DD) as "4 Oct 2026". */
export function prettyDate(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** "2026-10" -> "October 2026". */
export function prettyMonth(label: string): string {
  const [y, m] = label.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
