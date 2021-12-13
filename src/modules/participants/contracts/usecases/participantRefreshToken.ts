export interface ParticipantRefreshToken {
  refresh: (
    params: ParticipantRefreshToken.Input
  ) => Promise<ParticipantRefreshToken.Output>;
}

export namespace ParticipantRefreshToken {
  export type Input = {
    token: string;
  };
  export type Output = {
    refreshToken: string;
  };
}
