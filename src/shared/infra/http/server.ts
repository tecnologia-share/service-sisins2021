import { env } from '@/config/env';
import app from './app';

const port = env.port;
app.listen(port, () => {
  console.log(`Listening at ${env.hostBack}`);
});
