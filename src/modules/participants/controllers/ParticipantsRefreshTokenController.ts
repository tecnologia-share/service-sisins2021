import { AppError } from '@/shared/errors/AppError';
import { ParticipantRefreshToken } from '@/modules/participants/contracts/usecases';

import { NextFunction, Request, Response } from 'express';
import * as yup from 'yup';
import { inject, injectable } from 'tsyringe';

@injectable()
class ParticipantsRefreshTokenController {
  constructor(
    @inject('ParticipantRefreshToken')
    private readonly refreshTokenService: ParticipantRefreshToken
  ) {}

  async handle(request: Request, response: Response, _next: NextFunction) {
    try {
      const token =
        request.body.token ||
        request.headers['x-access-token'] ||
        request.query.token;

      const schema = yup.object().shape({
        token: yup.string().required(),
      });

      try {
        await schema.validate(request.body, { abortEarly: false });
      } catch (error) {
        return _next(new AppError('Token is required.'));
      }
      const result = await this.refreshTokenService.refresh({
        token,
      });
      return response.status(200).json(result);
    } catch (error) {
      return _next(error);
    }
  }
}

export default ParticipantsRefreshTokenController;
