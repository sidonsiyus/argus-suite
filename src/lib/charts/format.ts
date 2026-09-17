/** Shared formatting helpers for analytics — one convention everywhere. */

/** Integer with thin-space thousands separators. */
export function fmtInt(n: number | null | undefined): string {
  if (n === null || n === undefined || isNaN(n)) return "—";
  return Math.round(n).toLocaleString("en-US");
}

/** Percentage, no decimals by default. */
export function fmtPct(n: number | null | undefined, dp = 0): string {
  if (n === null || n === undefined || isNaN(n)) return "—";
  return `${n.toFixed(dp)}%`;
}

/** Signed delta, e.g. "+3" / "−2" / "0". */
export function fmtDelta(n: number): string {
  if (n > 0) return `+${n}`;
  if (n < 0) return `−${Math.abs(n)}`;
  return "0";
}

/** Compact date: "17 Sep 26". Accepts "YYYY-MM-DD", ISO, or ms. */
export function fmtDate(input: string | number | null | undefined): string {
  if (input === null || input === undefined || input === "") return "—";
  try {
    const d =
      typeof input === "number"
        ? new Date(input)
        : new Date(/^\d{4}-\d{2}-\d{2}$/.test(input) ? input + "T00:00:00" : input);
    if (isNaN(d.getTime())) return String(input);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" });
  } catch {
    return String(input);
  }
}

/** Day + month only: "17 Sep". */
export function fmtDayMonth(input: string | number | null | undefined): string {
  if (input === null || input === undefined || input === "") return "—";
  try {
    const d =
      typeof input === "number"
        ? new Date(input)
        : new Date(/^\d{4}-\d{2}-\d{2}$/.test(input) ? input + "T00:00:00" : input);
    if (isNaN(d.getTime())) return String(input);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
  } catch {
    return String(input);
  }
}

/** SNAKE_CASE / kebab / lower → Title Case: "GENERAL_MENTORING" → "General Mentoring". */
export function prettyEnum(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .replace(/[_-]+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}
