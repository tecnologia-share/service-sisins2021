import { Router } from 'express';
import { verifyJWT } from '../middlewares/verifyJWT';
import { verifyShareJWT } from '../middlewares/verifyShareJWT';
import SubscriptionsController from '../controllers/SubscriptionsController';
import { UserRoles } from '../typings/UserRoles';
import { accessOnlyFor } from '../middlewares/accessOnlyFor';
const { admin, superAdmin } = UserRoles;

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

routes.get(
  '/api/subscribe/:id',
  verifyShareJWT(),
  accessOnlyFor([admin, superAdmin]),
  subscriptionsController.showSubscribe
);

export default routes;
