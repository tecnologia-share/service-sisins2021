import CoursesController from '@/modules/courses/controllers/coursesController';
import { accessOnlyFor } from '@/shared/infra/http/middlewares/accessOnlyFor';
import { verifyShareJWT } from '@/shared/infra/http/middlewares/verifyShareJWT';
import { UserRoles } from '@/shared/typings/UserRoles';

import { Router } from 'express';

const coursesController = new CoursesController();

const { admin, superAdmin } = UserRoles;

export default (router: Router): void => {
  router.get('/courses', coursesController.show);
  router.post(
    '/courses',
    verifyShareJWT(),
    accessOnlyFor([admin, superAdmin]),
    coursesController.create
  );
  router.patch(
    '/courses',
    verifyShareJWT(),
    accessOnlyFor([admin, superAdmin]),
    coursesController.update
  );
  router.delete(
    '/courses',
    verifyShareJWT(),
    accessOnlyFor([admin, superAdmin]),
    coursesController.delete
  );
  router.get('/courses/:id/exam', coursesController.showExam);
  router.get(
    '/courses/:id/subscribes',
    verifyShareJWT(),
    accessOnlyFor([admin, superAdmin]),
    coursesController.showCourseSubscribes
  );
};
