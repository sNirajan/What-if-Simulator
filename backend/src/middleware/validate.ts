/**
 * Request validation middleware using Zod schemas.
 *
 * Goal:
 * - Fail fast on bad input.
 * - Ensure downstream code sees a *typed*, valid `req.body`.
 */

import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    // `parse` throws on invalid input; Express will catch sync throws.
    req.body = schema.parse(req.body);
    next();
  };
}
