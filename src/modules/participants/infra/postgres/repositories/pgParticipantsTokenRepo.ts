import {
  CreateRefreshToken,
  DeleteRefreshTokenById,
  FindByUserIdAndRefreshToken,
} from '@/modules/participants/contracts/repositories';
import { ParticipantsToken } from '@/shared/infra/typeorm/models/ParticipantsToken';
import { getRepository } from 'typeorm';

export class PgParticipantsTokenRepo
  implements
    CreateRefreshToken,
    FindByUserIdAndRefreshToken,
    DeleteRefreshTokenById
{
  async create({
    expiresDate,
    userId,
    refreshToken,
  }: CreateRefreshToken.Input): Promise<void> {
    const { save, create } = getRepository(ParticipantsToken);
    await save(
      create({
        expires_date: expiresDate,
        participants_id: userId,
        refresh_token: refreshToken,
      })
    );
  }
  async find({
    token,
    userId,
  }: FindByUserIdAndRefreshToken.Input): Promise<FindByUserIdAndRefreshToken.Output> {
    const { findOne } = getRepository(ParticipantsToken);
    const exist = await findOne({
      participants_id: userId,
      refresh_token: token,
    });

    return exist
      ? {
          refreshTokenId: token,
        }
      : undefined;
  }
  async delete({
    refreshTokenId,
  }: DeleteRefreshTokenById.Input): Promise<void> {
    const repo = getRepository(ParticipantsToken);

    await repo.delete(refreshTokenId);
  }
}
