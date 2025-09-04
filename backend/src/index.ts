/**
 * Process entrypoint.
 *
 * Responsibilities:
 * - Import the configured Express `app`.
 * - Read the port from validated env.
 * - Start the HTTP server.
 *
 * Rationale:
 * - Keeping `listen` here (separate from app creation) improves testability.
 */
import { app } from './app.js';
import { env } from './lib/config.js';

app.listen(env.port, () => console.log(`API listening on :${env.port}`));
