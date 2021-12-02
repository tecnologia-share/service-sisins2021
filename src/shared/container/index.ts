import {
  ParticipantsRepository,
  CoursesRepository,
} from '@/modules/subscriptions/contracts/repos';
import {
  DbCoursesRepository,
  DbParticipantRepository,
} from '../infra/typeorm/repositories';
import { container } from 'tsyringe';
import { ParticipantAuth } from '@/modules/participants/contracts/usecases';
import { ParticipantAuthService } from '@/modules/participants/services';

export { container };

container.registerSingleton<ParticipantsRepository>(
  'ParticipantsRepository',
  DbParticipantRepository
);

container.registerSingleton<CoursesRepository>(
  'CoursesRepository',
  DbCoursesRepository
);

container.registerSingleton<ParticipantAuth>(
  'ParticipantAuth',
  ParticipantAuthService
);
