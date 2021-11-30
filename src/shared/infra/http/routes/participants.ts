import ParticipantsController from '@/modules/participants/controllers/ParticipantsController';
import { verifyJWT } from '@/shared/infra/http/middlewares/verifyJWT';

import { Router } from 'express';

const participantsController = new ParticipantsController();

export default (router: Router): void => {
  router.post('/register', participantsController.create);
  router.get(
    '/register/verify-email/:token',
    participantsController.verifyEmail
  );
  router.patch('/participants', verifyJWT(), participantsController.update);
  router.patch(
    '/participants/update-email',
    verifyJWT(),
    participantsController.updateEmail
  );
  router.patch(
    '/participants/update-password',
    verifyJWT(),
    participantsController.updatePassword
  );
};
