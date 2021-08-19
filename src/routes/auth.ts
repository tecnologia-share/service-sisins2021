import { Router } from 'express';
import AuthController from '../controllers/AuthController';

const routes = Router();

const authController = new AuthController();

routes.post('/api/authenticate', authController.authenticate);

routes.post('/api/authenticate-share', authController.authenticateShare);

export default routes;
