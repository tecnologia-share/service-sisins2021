import { auth } from '@/config/env';
import { ParticipantAuth } from '@/modules/participants/contracts/usecases';
import { AppError } from '@/shared/errors/AppError';
import { Participante } from '@/shared/infra/typeorm/models/Participante';
import dayjs from 'dayjs';
import { getRepository } from 'typeorm';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ParticipantsToken } from '@/shared/infra/typeorm/models/ParticipantsToken';

export class ParticipantAuthService implements ParticipantAuth {
  async auth({
    email,
    password,
  }: ParticipantAuth.Input): Promise<ParticipantAuth.Output> {
    const {
      jwtSecret,
      expiresInToken,
      secretRefreshToken,
      expiresInRefreshToken,
      expiresRefreshTokenDays,
    } = auth;

    const participantesRepository = getRepository(Participante);

    const participante = await participantesRepository.findOne({
      email,
    });

    if (!participante) {
      throw new AppError('Invalid email or password.', 401);
    }
    const passwordIsCorrect = await bcrypt.compare(
      password,
      participante.senha
    );
    if (!passwordIsCorrect) {
      throw new AppError('Invalid email or password.', 401);
    }

    const token = jwt.sign(
      {
        id: participante.id,
      },
      jwtSecret,
      { expiresIn: expiresInToken }
    );

    const refresh_token = jwt.sign(
      { email: participante.email },
      secretRefreshToken,
      {
        expiresIn: expiresInRefreshToken,
        subject: participante.id,
      }
    );

    const expires_date = this.addDays(expiresRefreshTokenDays);

    const participantsTokenRepo = getRepository(ParticipantsToken);
    await participantsTokenRepo.save(
      participantsTokenRepo.create({
        participants_id: participante.id,
        refresh_token,
        expires_date,
      })
    );

    return {
      token,
      refresh_token,
      user: {
        email,
        name: participante.nome,
      },
    };
  }

  private addDays(days: number): Date {
    return dayjs().add(days, 'days').toDate();
  }
}
