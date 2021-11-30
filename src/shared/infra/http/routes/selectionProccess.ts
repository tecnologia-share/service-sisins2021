import CoursesController from '@/modules/courses/controllers/coursesController';
import SelectionProcessController from '@/modules/selectionProcess/controllers/selectionProcessController';
import { accessOnlyFor } from '@/shared/infra/http/middlewares/accessOnlyFor';
import { verifyShareJWT } from '@/shared/infra/http/middlewares/verifyShareJWT';
import { UserRoles } from '@/shared/typings/UserRoles';

import { Router } from 'express';

const selectionProcessController = new SelectionProcessController();
const coursesController = new CoursesController();

const { admin, superAdmin } = UserRoles;

export default (router: Router): void => {
  router.get(
    '/selection-process/:id/courses',
    coursesController.showSelectionProcessCourses
  );

  router.post(
    '/selection-process',
    verifyShareJWT(),
    accessOnlyFor([admin, superAdmin]),
    selectionProcessController.create
  );
  router.patch(
    '/selection-process',
    verifyShareJWT(),
    accessOnlyFor([admin, superAdmin]),
    selectionProcessController.update
  );
  router.delete(
    '/selection-process',
    verifyShareJWT(),
    accessOnlyFor([admin, superAdmin]),
    selectionProcessController.delete
  );
};
