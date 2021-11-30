import {
  ParticipantsRepository,
  CoursesRepository,
} from '@/modules/subscriptions/contracts/repos';
import {
  DbCoursesRepository,
  DbParticipantRepository,
} from '../infra/typeorm/repositories';
import { container } from 'tsyringe';

export { container };

container.registerSingleton<ParticipantsRepository>(
  'ParticipantsRepository',
  DbParticipantRepository
);

container.registerSingleton<CoursesRepository>(
  'CoursesRepository',
  DbCoursesRepository
);
