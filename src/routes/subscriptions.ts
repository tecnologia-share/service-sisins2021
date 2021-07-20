import { Router } from 'express';
import { verifyJWT } from '../middlewares/verifyJWT';
import SubscriptionsController from '../controllers/SubscriptionsController';

const routes = Router();

const subscriptionsController = new SubscriptionsController();

routes.post(
  '/api/subscriptions',
  verifyJWT(),
  subscriptionsController.subscribe
);

routes.delete(
  '/api/subscriptions',
  verifyJWT(),
  subscriptionsController.unsubscribe
);

export default routes;
