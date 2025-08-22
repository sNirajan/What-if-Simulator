import request from 'supertest';
process.env.STUB_DATA = 'true'; // ensure stub
const { app } = await import('../src/app.js');

import { describe, it, expect } from 'vitest';

describe('POST /api/v1/backtest', () => {
  it('valid body returns metrics', async () => {
    const res = await request(app)
      .post('/api/v1/backtest')
      .send({ ticker: 'TSLA', amount: 100, start_date: '2016-01-04', end_date: '2016-12-30', cadence: 'lump_sum' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('final_value');
    expect(res.body).toHaveProperty('total_return_pct');
    expect(res.body.series.length).toBeGreaterThanOrEqual(2);
  });

  it('invalid body -> 400', async () => {
    const res = await request(app).post('/api/v1/backtest').send({ });
    expect(res.status).toBe(400);
  });
});
