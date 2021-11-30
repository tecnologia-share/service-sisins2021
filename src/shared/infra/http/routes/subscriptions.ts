import SubscriptionsController from '@/modules/subscriptions/controllers/SubscriptionsController';
import { accessOnlyFor } from '@/shared/infra/http/middlewares/accessOnlyFor';
import { validationMiddleware } from '@/shared/infra/http/middlewares/validation';
import { verifyJWT } from '@/shared/infra/http/middlewares/verifyJWT';
import { verifyShareJWT } from '@/shared/infra/http/middlewares/verifyShareJWT';
import { subscribeParticipantValidationSchema } from '@/shared/infra/http/validations/schemas/subscribeParticipantSchema';
import { UserRoles } from '@/shared/typings/UserRoles';

import { Router } from 'express';

const subscriptionsController = new SubscriptionsController();
const { admin, superAdmin } = UserRoles;

export default (router: Router): void => {
  router.post(
    '/subscriptions',
    verifyJWT(),
    validationMiddleware(subscribeParticipantValidationSchema),
    subscriptionsController.subscribe
  );
  router.delete(
    '/subscriptions',
    verifyJWT(),
    subscriptionsController.unsubscribe
  );
  router.get(
    '/subscriptions/:id',
    verifyShareJWT(),
    accessOnlyFor([admin, superAdmin]),
    subscriptionsController.showSubscribe
  );

  router.patch(
    '/subscriptions',
    verifyShareJWT(),
    accessOnlyFor([admin, superAdmin]),
    subscriptionsController.evaluate
  );
};
