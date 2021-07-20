import { Router } from 'express';
import { verifyShareJWT } from '../middlewares/verifyShareJWT';
import SuperAdminController from '../controllers/SuperAdminController';
import { accessOnlyFor } from '../middlewares/accessOnlyFor';
import { UserRoles } from '../typings/UserRoles';

const routes = Router();

const superAdminController = new SuperAdminController();

const { superAdmin } = UserRoles;

routes.post(
  '/api/super-admin',
  verifyShareJWT(),
  accessOnlyFor([superAdmin]),
  superAdminController.create
);

export default routes;
