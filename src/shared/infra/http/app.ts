import 'reflect-metadata';
import express from 'express';
import 'express-async-errors';
import cors from 'cors';

import { setupRoutes } from '@/shared/infra/http/config/routes';
import { appError } from './middlewares/appError';
import { createConnection } from './middlewares/createConnection';

const app = express();

app.use(express.json());
app.use(cors());

app.use(createConnection());
setupRoutes(app);
app.use(appError());

export default app;
