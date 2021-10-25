import { Router } from 'express';

import { verifyJWT } from './middlewares/verifyJWT';
import { verifyShareJWT } from './middlewares/verifyShareJWT';
import AuthController from '@/modules/controllers/AuthController';
import ExamsController from '@/modules/controllers/ExamsController';
import CoursesController from '@/modules/controllers/coursesController';
import ParticipantsController from '@/modules/controllers/ParticipantsController';
import SelectionProcessController from '@/modules/controllers/selectionProcessController';
import SubscriptionsController from '@/modules/subscriptions/controllers/SubscriptionsController';
import SuperAdminController from '@/modules/controllers/superAdmin/SuperAdminController';
import { accessOnlyFor } from './middlewares/accessOnlyFor';
import { UserRoles } from '../../typings/UserRoles';
import AsksController from '@/modules/controllers/asks/asksController';
import { validationMiddleware } from './middlewares/validation';
import { subscribeParticipantValidationSchema } from './validations/schemas/subscribeParticipantSchema';

const routes = Router();

const authController = new AuthController();
const participantsController = new ParticipantsController();
const subscriptionsController = new SubscriptionsController();
const selectionProcessController = new SelectionProcessController();
const examsController = new ExamsController();
const coursesController = new CoursesController();
const superAdminController = new SuperAdminController();
const asksController = new AsksController();

const { admin, superAdmin } = UserRoles;

routes.post('/api/authenticate', authController.authenticate);
routes.post('/api/authenticate-share', authController.authenticateShare);

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

routes.post(
  '/api/subscriptions',
  verifyJWT(),
  validationMiddleware(subscribeParticipantValidationSchema),
  subscriptionsController.subscribe
);
routes.delete(
  '/api/subscriptions',
  verifyJWT(),
  subscriptionsController.unsubscribe
);
routes.get(
  '/api/subscriptions/:id',
  verifyShareJWT(),
  accessOnlyFor([admin, superAdmin]),
  subscriptionsController.showSubscribe
);

routes.patch(
  '/api/subscriptions',
  verifyShareJWT(),
  accessOnlyFor([admin, superAdmin]),
  subscriptionsController.evaluate
);

routes.get(
  '/api/selection-process/:id/courses',
  coursesController.showSelectionProcessCourses
);

routes.post(
  '/api/selection-process',
  verifyShareJWT(),
  accessOnlyFor([admin, superAdmin]),
  selectionProcessController.create
);
routes.patch(
  '/api/selection-process',
  verifyShareJWT(),
  accessOnlyFor([admin, superAdmin]),
  selectionProcessController.update
);
routes.delete(
  '/api/selection-process',
  verifyShareJWT(),
  accessOnlyFor([admin, superAdmin]),
  selectionProcessController.delete
);

routes.get('/api/courses', coursesController.show);
routes.post(
  '/api/courses',
  verifyShareJWT(),
  accessOnlyFor([admin, superAdmin]),
  coursesController.create
);
routes.patch(
  '/api/courses',
  verifyShareJWT(),
  accessOnlyFor([admin, superAdmin]),
  coursesController.update
);
routes.delete(
  '/api/courses',
  verifyShareJWT(),
  accessOnlyFor([admin, superAdmin]),
  coursesController.delete
);
routes.get('/api/courses/:id/exam', coursesController.showExam);
routes.get(
  '/api/courses/:id/subscribes',
  verifyShareJWT(),
  accessOnlyFor([admin, superAdmin]),
  coursesController.showCourseSubscribes
);

routes.post(
  '/api/exams',
  verifyShareJWT(),
  accessOnlyFor([admin, superAdmin]),
  examsController.create
);
routes.patch(
  '/api/exams',
  verifyShareJWT(),
  accessOnlyFor([admin, superAdmin]),
  examsController.update
);
routes.delete(
  '/api/exams',
  verifyShareJWT(),
  accessOnlyFor([admin, superAdmin]),
  examsController.delete
);

routes.post(
  '/api/super-admin',
  verifyShareJWT(),
  accessOnlyFor([superAdmin]),
  superAdminController.create
);

routes.get('/api/ask', asksController.show);
routes.post(
  '/api/ask',
  verifyShareJWT(),
  accessOnlyFor([superAdmin]),
  asksController.create
);

export default routes;
