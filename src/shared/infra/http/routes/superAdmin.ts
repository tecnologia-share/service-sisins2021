import SuperAdminController from '@/modules/superAdmin/controllers/SuperAdminController';
import { accessOnlyFor } from '@/shared/infra/http/middlewares/accessOnlyFor';
import { verifyShareJWT } from '@/shared/infra/http/middlewares/verifyShareJWT';
import { UserRoles } from '@/shared/typings/UserRoles';

import { Router } from 'express';

const superAdminController = new SuperAdminController();

const { superAdmin } = UserRoles;

export default (router: Router): void => {
  router.post(
    '/super-admin',
    verifyShareJWT(),
    accessOnlyFor([superAdmin]),
    superAdminController.create
  );
};
