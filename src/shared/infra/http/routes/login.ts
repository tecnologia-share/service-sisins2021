import AuthController from '@/modules/auth/controllers/AuthController';
import ParticipantsLoginController from '@/modules/participants/controllers/ParticipantsLoginController';
import ParticipantsRefreshTokenController from '@/modules/participants/controllers/ParticipantsRefreshTokenController';
import { container } from '@/shared/container';

import { Router } from 'express';

const authController = new AuthController();
const participantLogin = container.resolve(ParticipantsLoginController);
const participantRefreshToken= container.resolve(ParticipantsRefreshTokenController);

export default (router: Router): void => {
  router.post(
    '/authenticate',
    participantLogin.authenticate.bind(participantLogin)
  );
  router.post(
    '/refresh-token',
    participantRefreshToken.handle.bind(participantRefreshToken)
  );
  router.post('/authenticate-share', authController.authenticateShare);
};
