import {
  ParticipantsRepository,
  CoursesRepository,
} from '@/modules/subscriptions/contracts/repos';
import {
  DbCoursesRepository,
  DbParticipantRepository,
} from '../infra/typeorm/repositories';
import { container } from 'tsyringe';
import { ParticipantAuth, ParticipantRefreshToken } from '@/modules/participants/contracts/usecases';
import { ParticipantAuthService, ParticipantRefreshTokenService } from '@/modules/participants/services';
import { PgParticipantsTokenRepo } from '@/modules/participants/infra/postgres/repositories';

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

container.registerSingleton('PgParticipantsTokenRepo', PgParticipantsTokenRepo);

container.registerSingleton<ParticipantRefreshToken>(
  'ParticipantRefreshToken',
  ParticipantRefreshTokenService
);
