/**
 * Pure math helpers (no I/O) → easy to test.
 * Keep them tiny & side-effect free.
 */

/** Annualized return given start/end values and elapsed days. */
export function cagr(start: number, end: number, days: number): number {
  const years = days / 365.25;
  // Guard small/zero years to avoid division/NaN when dates are equal.
  const safeYears = Math.max(years, 1e-9);
  return Math.pow(end / start, 1 / safeYears) - 1;
}

/** Simple total return as a fraction (e.g., 0.25 = +25%). */
export function totalReturnPct(start: number, end: number): number {
  return (end - start) / start;
}
