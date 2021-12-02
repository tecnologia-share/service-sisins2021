import AuthController from '@/modules/auth/controllers/AuthController';
import ParticipantsLoginController from '@/modules/participants/controllers/ParticipantsLoginController';
import { container } from '@/shared/container';

import { Router } from 'express';

const authController = new AuthController();
const participantLogin = container.resolve(ParticipantsLoginController);

export default (router: Router): void => {
  router.post(
    '/authenticate',
    participantLogin.authenticate.bind(participantLogin)
  );
  router.post('/authenticate-share', authController.authenticateShare);
};
