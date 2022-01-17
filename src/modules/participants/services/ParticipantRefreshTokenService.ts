import { auth } from '@/config/env';
import {
  CreateRefreshToken,
  DeleteRefreshTokenById,
  FindByUserIdAndRefreshToken,
} from '@/modules/participants/contracts/repositories';
import { ParticipantRefreshToken } from '@/modules/participants/contracts/usecases';
import { AppError } from '@/shared/errors/AppError';
import dayjs from 'dayjs';
import { verify, sign, TokenExpiredError } from 'jsonwebtoken';
import { inject, injectable } from 'tsyringe';

type Payload = {
  email: string;
  sub: string;
};

@injectable()
export class ParticipantRefreshTokenService implements ParticipantRefreshToken {
  constructor(
    @inject('PgParticipantsTokenRepo')
    private readonly findByUserIdAndRefreshToken: FindByUserIdAndRefreshToken,
    @inject('PgParticipantsTokenRepo')
    private readonly deleteRefreshTokenById: DeleteRefreshTokenById,
    @inject('PgParticipantsTokenRepo')
    private readonly createRefreshToken: CreateRefreshToken
  ) {}

  async refresh({
    token,
  }: ParticipantRefreshToken.Input): Promise<ParticipantRefreshToken.Output> {
    let userId: string;
    let email: string;

    try {
      const decoded = verify(token, auth.secretRefreshToken) as Payload;
      userId = decoded.sub;
      email = decoded.email;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new AppError('Refresh Token Expired', 401);
      }

      throw new AppError('Refresh Token does not exist', 404);
    }

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

    const newToken = sign(
      {
        id: userId,
      },
      auth.jwtSecret,
      { expiresIn: auth.expiresInToken }
    );

    return { refreshToken, token: newToken };
  }

  private addDays(days: number): Date {
    return dayjs().add(days, 'days').toDate();
  }
}
