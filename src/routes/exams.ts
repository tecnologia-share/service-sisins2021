import { Router } from 'express';
import { verifyShareJWT } from '../middlewares/verifyShareJWT';
import ExamsController from '../controllers/ExamsController';
import { accessOnlyFor } from '../middlewares/accessOnlyFor';
import { UserRoles } from '../typings/UserRoles';
const { admin, superAdmin } = UserRoles;

const routes = Router();

const examsController = new ExamsController();

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

export default routes;
