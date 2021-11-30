import AuthController from '@/modules/login/controllers/AuthController';

import { Router } from 'express';

const authController = new AuthController();

export default (router: Router): void => {
  router.post('/authenticate', authController.authenticate);
  router.post('/authenticate-share', authController.authenticateShare);
};
