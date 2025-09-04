/**
 * Price series provider (abstracted).
 *
 * MVP: return a stub deterministic series when STUB_DATA=true.
 * Later: plug in Yahoo/Stooq/Polygon and add caching + trading-day logic.
 */
import { env } from './config.js';

// A single series item: adjusted close for that date.
export type PricePoint = { date: string; adj_close: number };

/**
 * Get adjusted price series [inclusive] between start and end date.
 * Adjusted prices account for splits/dividends → correct math out of the box.
 */
export async function getAdjustedSeries(
  ticker: string,
  start: string,
  end: string
): Promise<PricePoint[]> {
  if (env.isStub) {
    // Deterministic “10 → 15” line to prove wiring/math.
    return [
      { date: start, adj_close: 10 },
      { date: end, adj_close: 15 },
    ];
  }

  // TODO (Sprint 2):
  // - Fetch from provider
  // - Snap to nearest prior trading day
  // - Cache by (ticker,start,end) for 24h
  // - Normalize to {date, adj_close}
  return [];
}
