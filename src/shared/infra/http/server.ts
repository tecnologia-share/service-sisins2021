import dotenv from 'dotenv';
import { env } from '../../../config/env';
import app from './app';
dotenv.config({ path: '.env' });

const port = env.port;
app.listen(port, () => {
  console.log(`Listening at ${env.hostBack}`);
});
