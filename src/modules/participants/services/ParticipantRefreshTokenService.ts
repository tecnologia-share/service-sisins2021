import { auth } from '@/config/env';
import { FindByUserIdAndRefreshToken } from '@/modules/participants/contracts/repositories';
import { ParticipantRefreshToken } from '@/modules/participants/contracts/usecases';
import { verify } from 'jsonwebtoken';

type Payload = {
  email: string;
  sub: string;
};

export class ParticipantRefreshTokenService implements ParticipantRefreshToken {
  constructor(
    private readonly findByUserIdAndRefreshToken: FindByUserIdAndRefreshToken
  ) {}

  async refresh({
    token,
  }: ParticipantRefreshToken.Input): Promise<ParticipantRefreshToken.Output> {
    const { sub: userId } = verify(token, auth.secretRefreshToken) as Payload;

    await this.findByUserIdAndRefreshToken.find({ userId, token });

    return { refresh_token: '' };
  }
}
