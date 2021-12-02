import { env } from '@/config/env';
import { ParticipantAuth } from '@/modules/participants/contracts/usecases';
import { AppError } from '@/shared/errors/AppError';
import { Participante } from '@/shared/infra/typeorm/models/Participante';

import { getRepository } from 'typeorm';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export class ParticipantAuthService implements ParticipantAuth {
  async auth({
    email,
    password,
  }: ParticipantAuth.Input): Promise<ParticipantAuth.Output> {
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
      env.jwtSecret as string,
      { expiresIn: '24h' }
    );

    return { token };
  }
}
