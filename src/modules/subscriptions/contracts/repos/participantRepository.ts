import { Participante } from '@/shared/infra/typeorm/models/Participante';

export interface ParticipantsRepository {
  findOne: (
    params: ParticipantsRepository.Input
  ) => Promise<ParticipantsRepository.Output>;
}

export namespace ParticipantsRepository {
  export type Input = {
    userId: string;
  };
  export type Output = undefined | Participante;
}
