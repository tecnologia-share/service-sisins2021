import { Router } from 'express';
import auth from '../routes/auth';
import courses from '../routes/courses';
import exams from '../routes/exams';
import participants from '../routes/participants';
import selectionProcess from '../routes/selectionProcess';
import subscriptions from '../routes/subscriptions';
import superAdmin from '../routes/superAdmin';

const routes = Router();

routes.use(auth);
routes.use(courses);
routes.use(exams);
routes.use(participants);
routes.use(selectionProcess);
routes.use(subscriptions);
routes.use(superAdmin);

export default routes;
