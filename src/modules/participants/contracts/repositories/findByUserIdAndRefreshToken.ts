import { ParticipantsToken } from '@/shared/infra/typeorm/models/ParticipantsToken';

export interface FindByUserIdAndRefreshToken {
  find: (
    params: FindByUserIdAndRefreshToken.Input
  ) => Promise<FindByUserIdAndRefreshToken.Output>;
}

export namespace FindByUserIdAndRefreshToken {
  export type Input = {
    userId: string;
    token: string;
  };
  export type Output = ParticipantsToken | undefined;
}
