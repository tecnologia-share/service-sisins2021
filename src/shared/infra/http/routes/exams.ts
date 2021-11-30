import ExamsController from '@/modules/exams/controllers/ExamsController';
import { accessOnlyFor } from '@/shared/infra/http/middlewares/accessOnlyFor';
import { verifyShareJWT } from '@/shared/infra/http/middlewares/verifyShareJWT';
import { UserRoles } from '@/shared/typings/UserRoles';

import { Router } from 'express';

const examsController = new ExamsController();

const { admin, superAdmin } = UserRoles;

export default (router: Router): void => {
  router.post(
    '/exams',
    verifyShareJWT(),
    accessOnlyFor([admin, superAdmin]),
    examsController.create
  );
  router.patch(
    '/exams',
    verifyShareJWT(),
    accessOnlyFor([admin, superAdmin]),
    examsController.update
  );
  router.delete(
    '/exams',
    verifyShareJWT(),
    accessOnlyFor([admin, superAdmin]),
    examsController.delete
  );
};
