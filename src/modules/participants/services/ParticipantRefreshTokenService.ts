import { auth } from '@/config/env';
import {
  CreateRefreshToken,
  DeleteRefreshTokenById,
  FindByUserIdAndRefreshToken,
} from '@/modules/participants/contracts/repositories';
import { ParticipantRefreshToken } from '@/modules/participants/contracts/usecases';
import { AppError } from '@/shared/errors/AppError';
import dayjs from 'dayjs';
import { verify, sign } from 'jsonwebtoken';

type Payload = {
  email: string;
  sub: string;
};

export class ParticipantRefreshTokenService implements ParticipantRefreshToken {
  constructor(
    private readonly findByUserIdAndRefreshToken: FindByUserIdAndRefreshToken,
    private readonly deleteRefreshTokenById: DeleteRefreshTokenById,
    private readonly createRefreshToken: CreateRefreshToken
  ) {}

  async refresh({
    token,
  }: ParticipantRefreshToken.Input): Promise<ParticipantRefreshToken.Output> {
    const { sub: userId, email } = verify(
      token,
      auth.secretRefreshToken
    ) as Payload;

    const userToken = await this.findByUserIdAndRefreshToken.find({
      userId,
      token,
    });

    if (!userToken) throw new AppError('Refresh Token does not exist', 404);

    await this.deleteRefreshTokenById.delete(userToken);

    const refreshToken = sign({ email }, auth.secretRefreshToken, {
      expiresIn: auth.expiresInRefreshToken,
      subject: userId,
    });

    const expiresDate = this.addDays(auth.expiresRefreshTokenDays);

    await this.createRefreshToken.create({
      expiresDate,
      refreshToken,
      userId,
    });

    return { refreshToken };
  }

  private addDays(days: number): Date {
    return dayjs().add(days, 'days').toDate();
  }
}
