/**
 * Express application bootstrap.
 *
 * Responsibilities:
 * - Create and configure the Express app (JSON body parsing, CORS).
 * - Mount feature routers under versioned API paths.
 * - Provide a basic health endpoint.
 * - Attach global 404 and error handlers at the end of the middleware chain.
 *
 * Notes:
 * - We export `app` (without calling `listen`) so tests can import it directly.
 * - The actual server port binding happens in `index.ts`.
 */

import express from 'express';
import cors from 'cors';
import { env } from './lib/config.js';
import { errorMiddleware, notFound } from './lib/errors.js';
import { router as backtest } from './routes/backtest.js';
import { prisma } from './lib/db.js';

// Parse incoming JSON bodies into `req.body`
// (applies to all routes below this line).
export const app = express();
app.use(express.json());

// Allow browser frontends to call our API.
// In dev, default to http://localhost:3000; in prod, use ALLOWED_ORIGIN.
app.use(cors({ origin: env.ALLOWED_ORIGIN || 'http://localhost:3000' }));

// Simple liveness check for load balancers + local debugging.
app.get('/api/v1/health', (_req, res) =>
  res.json({ ok: true, service: 'what-if-simulator', version: '0.0.1' })
);

app.get('/api/v1/db/health', async (_req, res, next) => {
  try {
    const count = await prisma.scenario.count();
    res.json({ ok: true, model: 'Scenario', count });
  } catch (e) {
    next(e);
  }
});

// ---- Feature routers ----
// All "business" endpoints live under /api/v1/... for clean versioning.
app.use('/api/v1/backtest', backtest);

// If no route matched above, return a consistent 404 JSON shape.
app.use(notFound);

// Last middleware: convert thrown errors into consistent JSON responses.
app.use(errorMiddleware);
