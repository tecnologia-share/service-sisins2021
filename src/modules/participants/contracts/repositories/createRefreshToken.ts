export interface CreateRefreshToken {
  create: (
    params: CreateRefreshToken.Input
  ) => Promise<void>;
}

export namespace CreateRefreshToken {
  export type Input = {
    expiresDate: Date;
    refreshToken: string;
    userId: string
  };
}
