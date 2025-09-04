// backend/src/lib/async.ts

// Helper function as Express v4 doesn’t auto-catch throw inside async handlers
import type { NextFunction, Request, Response } from 'express';
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);
