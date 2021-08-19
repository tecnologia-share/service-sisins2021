import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

import app from './app';

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`Listening at http://localhost:${PORT}`);
});
