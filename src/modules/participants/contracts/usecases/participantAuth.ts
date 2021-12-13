export interface ParticipantAuth {
  auth: (params: ParticipantAuth.Input) => Promise<ParticipantAuth.Output>;
}

export namespace ParticipantAuth {
  export type Input = {
    email: string;
    password: string;
  };
  export type Output = {
    token: string;
    refresh_token: string;
    user: User;
  };

  type User = {
    name: string;
    email: string;
  };
}
