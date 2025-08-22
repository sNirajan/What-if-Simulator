import { app } from './app.js';
import { env } from './lib/config.js';

app.listen(env.port, () => console.log(`API listening on :${env.port}`));
