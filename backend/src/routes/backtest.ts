/**
 * /api/v1/backtest
 *
 * Contract:
 * - Input: ticker, amount, start_date, end_date, optional fees_bps.
 * - Output: computed shares, final_value, total_return_pct, cagr, and the series used.
 *
 * Notes:
 * - Uses `validateBody` to enforce shape.
 * - Uses `asyncHandler` so thrown errors reach error middleware in Express v4.
 */
import { Router } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validate.js';
import { getAdjustedSeries } from '../lib/prices.js';
import { cagr, totalReturnPct } from '../lib/math.js';
import { AppError } from '../lib/errors.js';
import { asyncHandler } from '../lib/async.js';

export const router = Router();

// Define the request body schema once; reuse everywhere.
const Body = z.object({
  ticker: z.string().min(1),
  amount: z.number().positive(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  cadence: z.enum(['lump_sum']).default('lump_sum'),
  fees_bps: z.number().min(0).max(10000).default(0),
});

router.post(
  '/',
  validateBody(Body), // 1) validate and coerce body → typed `req.body`
  asyncHandler(async (req, res) => {
    const p = Body.parse(req.body); // `parse` again for type inference in TS

    // 2) Fetch (stub) adjusted price series for the given window.
    const series = await getAdjustedSeries(p.ticker, p.start_date, p.end_date);

    // Need at least a start and end point to compute returns.
    if (series.length < 2) throw new AppError(422, 'Insufficient data');

    // 3) Compute metrics
    const start = series[0]?.adj_close;
    const end = series[series.length - 1]?.adj_close;

    if (start === undefined || end === undefined) {
      throw new AppError(422, 'Insufficient data');
    }

    // fees_bps = basis points (e.g., 50 bps = 0.50%)
    const feeMultiplier = 1 - p.fees_bps / 10000;

    // Lump-sum: buy shares on start date, hold until end.
    const shares = (p.amount / start) * feeMultiplier;
    const final_value = shares * end;

    // Rough day diff for CAGR. (Sprint 2: snap to trading days precisely.)
    const days = Math.max(
      1,
      Math.round(
        (new Date(p.end_date).getTime() - new Date(p.start_date).getTime()) / 86_400_000
      )
    );

    // 4) Respond with transparent, reproducible numbers.
    return res.json({
      series,
      shares,
      final_value,
      total_return_pct: totalReturnPct(p.amount, final_value),
      cagr: cagr(p.amount, final_value, days),
      assumptions: {
        adjusted_prices: true,
        fees_bps: p.fees_bps,
        dividends_reinvested: true, // implicit when using adjusted close
      },
    });
  })
);
