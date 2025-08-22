export function cagr(start: number, end: number, days: number): number {
  const years = days / 365.25;
  return Math.pow(end / start, 1 / Math.max(years, 1e-9)) - 1;
}
export function totalReturnPct(start: number, end: number): number {
  return (end - start) / start;
}
