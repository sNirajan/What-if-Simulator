import { Router } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validate';
import { getAdjustedSeries } from '../lib/prices';
import { cagr, totalReturnPct } from '../lib/math';
import { AppError } from '../lib/errors';

export const router = Router();

const Body = z.object({
  ticker: z.string().min(1),
  amount: z.number().positive(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  cadence: z.enum(['lump_sum']).default('lump_sum'),
  fees_bps: z.number().min(0).max(10000).default(0)
});

router.post('/', validateBody(Body), async (req, res) => {
  const p = Body.parse(req.body);
  const series = await getAdjustedSeries(p.ticker, p.start_date, p.end_date);
  if (series.length < 2) throw new AppError(422, 'Insufficient data');

  const start = series[0].adj_close;
  const end   = series[series.length - 1].adj_close;
  const shares = (p.amount / start) * (1 - p.fees_bps / 10000);
  const final_value = shares * end;

  const days = Math.max(
    1,
    Math.round((new Date(p.end_date).getTime() - new Date(p.start_date).getTime()) / 86400000)
  );

  return res.json({
    series,
    shares,
    final_value,
    total_return_pct: totalReturnPct(p.amount, final_value),
    cagr: cagr(p.amount, final_value, days),
    assumptions: { adjusted_prices: true, fees_bps: p.fees_bps, dividends_reinvested: true }
  });
});
