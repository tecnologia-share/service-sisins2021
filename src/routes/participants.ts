import { Router } from 'express';
import { verifyJWT } from '../middlewares/verifyJWT';
import ParticipantsController from '../controllers/ParticipantsController';

const routes = Router();

const participantsController = new ParticipantsController();

routes.post('/api/register', participantsController.create);

routes.get(
  '/api/register/verify-email/:token',
  participantsController.verifyEmail
);

routes.patch('/api/participants', verifyJWT(), participantsController.update);

routes.patch(
  '/api/participants/update-email',
  verifyJWT(),
  participantsController.updateEmail
);

routes.patch(
  '/api/participants/update-password',
  verifyJWT(),
  participantsController.updatePassword
);

export default routes;
