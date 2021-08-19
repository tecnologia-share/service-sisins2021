import { Router } from 'express';
import { verifyShareJWT } from '../middlewares/verifyShareJWT';
import SelectionProcessController from '../controllers/selectionProcessController';
import { accessOnlyFor } from '../middlewares/accessOnlyFor';
import { UserRoles } from '../typings/UserRoles';

const routes = Router();

const selectionProcessController = new SelectionProcessController();

const { admin, superAdmin } = UserRoles;

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

export default routes;
