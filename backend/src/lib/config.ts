import 'dotenv/config';
import { z } from 'zod';

const Env = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().regex(/^\d+$/).default('8080'),
  ALLOWED_ORIGIN: z.string().optional(),
  STUB_DATA: z.string().optional(), // "true" | "false"
});

const parsed = Env.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment:', parsed.error.flatten());
  process.exit(1);
}

export const env = {
  ...parsed.data,
  isStub: parsed.data.STUB_DATA === 'true',
  port: Number(parsed.data.PORT),
};
