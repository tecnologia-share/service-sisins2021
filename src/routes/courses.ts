import { Router } from 'express';
import CoursesController from '../controllers/coursesController';
import { verifyShareJWT } from '../middlewares/verifyShareJWT';
import { accessOnlyFor } from '../middlewares/accessOnlyFor';
import { UserRoles } from '../typings/UserRoles';
const { admin, superAdmin } = UserRoles;

const routes = Router();

const coursesController = new CoursesController();

routes.get(
  '/api/selection-process/:id/courses',
  coursesController.showSelectionProcessCourses
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

export default routes;
