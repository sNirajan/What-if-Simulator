import express from 'express';
import cors from 'cors';
import { env } from './lib/config.js';
import { errorMiddleware, notFound } from './lib/errors.js';
import { router as backtest } from './routes/backtest.js';

export const app = express();
app.use(express.json());
app.use(cors({ origin: env.ALLOWED_ORIGIN || 'http://localhost:3000' }));

app.get('/api/v1/health', (_req, res) =>
  res.json({ ok: true, service: 'what-if-simulator', version: '0.0.1' })
);

app.use('/api/v1/backtest', backtest);

app.use(notFound);
app.use(errorMiddleware);
