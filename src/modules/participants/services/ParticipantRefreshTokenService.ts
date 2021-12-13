import { auth } from '@/config/env';
import {
  DeleteRefreshTokenById,
  FindByUserIdAndRefreshToken,
} from '@/modules/participants/contracts/repositories';
import { ParticipantRefreshToken } from '@/modules/participants/contracts/usecases';
import { AppError } from '@/shared/errors/AppError';
import { verify } from 'jsonwebtoken';

type Payload = {
  email: string;
  sub: string;
};

export class ParticipantRefreshTokenService implements ParticipantRefreshToken {
  constructor(
    private readonly findByUserIdAndRefreshToken: FindByUserIdAndRefreshToken,
    private readonly deleteRefreshTokenById: DeleteRefreshTokenById
  ) {}

  async refresh({
    token,
  }: ParticipantRefreshToken.Input): Promise<ParticipantRefreshToken.Output> {
    const { sub: userId } = verify(token, auth.secretRefreshToken) as Payload;

    const userToken = await this.findByUserIdAndRefreshToken.find({
      userId,
      token,
    });

    if (!userToken) throw new AppError('Refresh Token does not exist', 404);

    await this.deleteRefreshTokenById.delete(userToken);

    return { refresh_token: '' };
  }
}
