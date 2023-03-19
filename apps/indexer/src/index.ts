import * as dotenv from 'dotenv';

dotenv.config();

import { run } from './run';

(async () => {
  run();
})().catch(async (e) => {
  console.error(e);
  process.exit(1);
});
