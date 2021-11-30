import CreateAskController from '@/modules/asks/controllers/createAskController';
import ShowAsksController from '@/modules/asks/controllers/showAsksController';
import { accessOnlyFor } from '@/shared/infra/http/middlewares/accessOnlyFor';
import { verifyShareJWT } from '@/shared/infra/http/middlewares/verifyShareJWT';
import { UserRoles } from '@/shared/typings/UserRoles';

import { Router } from 'express';

const { superAdmin } = UserRoles;

export default (router: Router): void => {
  router.get('/ask', new ShowAsksController().handle);
  router.post(
    '/ask',
    verifyShareJWT(),
    accessOnlyFor([superAdmin]),
    new CreateAskController().handle
  );
};
