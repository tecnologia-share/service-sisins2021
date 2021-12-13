export interface DeleteRefreshTokenById {
  delete: (params: DeleteRefreshTokenById.Input) => Promise<void>;
}

export namespace DeleteRefreshTokenById {
  export type Input = {
    refreshTokenId: string;
  };
}
