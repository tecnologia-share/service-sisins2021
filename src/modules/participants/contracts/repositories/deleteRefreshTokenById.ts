import { ParticipantsToken } from "@/shared/infra/typeorm/models/ParticipantsToken";

export interface DeleteRefreshTokenById {
  delete: (params: DeleteRefreshTokenById.Input) => Promise<void>;
}

export namespace DeleteRefreshTokenById {
  export type Input = ParticipantsToken
}
