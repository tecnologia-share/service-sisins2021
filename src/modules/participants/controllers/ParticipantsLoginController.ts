import { AppError } from '@/shared/errors/AppError';
import { ParticipantAuth } from '@/modules/participants/contracts/usecases';

import { NextFunction, Request, Response } from 'express';
import * as yup from 'yup';
import { inject, injectable } from 'tsyringe';

@injectable()
class ParticipantsLoginController {
  constructor(
    @inject('ParticipantAuth')
    private readonly authService: ParticipantAuth
  ) {}

  async authenticate(
    request: Request,
    response: Response,
    _next: NextFunction
  ) {
    try {
      const { email, password } = request.body;

      const schema = yup.object().shape({
        email: yup.string().required(),
        password: yup.string().required(),
      });

      try {
        await schema.validate(request.body, { abortEarly: false });
      } catch (error) {
        return _next(new AppError('Email and password are required.'));
      }
      const { token, refresh_token, user } = await this.authService.auth({
        email,
        password,
      });
      return response.status(200).json({ token, refresh_token, user });
    } catch (error) {
      return _next(error);
    }
  }
}

export default ParticipantsLoginController;
