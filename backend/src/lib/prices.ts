import { env } from './config.js';

/** Returns [{ date: 'YYYY-MM-DD', adj_close: number }, ...] */
export async function getAdjustedSeries(ticker: string, start: string, end: string) {
  if (env.isStub) {
    // deterministic 2-point series for wiring & tests
    return [
      { date: start, adj_close: 10 },
      { date: end,   adj_close: 15 },
    ];
  }
  // TODO: real provider later
  return [];
}
