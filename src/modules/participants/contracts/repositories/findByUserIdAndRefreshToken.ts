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
  export type Output =
    | {
        refreshTokenId: string;
      }
    | undefined;
}
