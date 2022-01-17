import { NextFunction, Request, Response } from 'express';
import { getRepository } from 'typeorm';
import * as yup from 'yup';
import { AppError } from '@/shared/errors/AppError';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UsuarioShare } from '@/shared/infra/typeorm/models/UsuarioShare';
import { auth } from '@/config/env';

class AuthController {
  async authenticateShare(
    request: Request,
    response: Response,
    _next: NextFunction
  ) {
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

    const usersRepository = getRepository(UsuarioShare);

    const user = await usersRepository.findOne({
      email,
    });

    if (!user) {
      return _next(new AppError('Invalid email or password.', 401));
    }

    const passwordIsCorrect = await bcrypt.compare(password, user.senha);
    if (!passwordIsCorrect) {
      return _next(new AppError('Invalid email or password.', 401));
    }

    const token = jwt.sign(
      {
        id: user.id,
      },
      auth.jwtShareSecret as string,
      { expiresIn: '24h' }
    );

    return response.status(200).json({ token });
  }
}

export default AuthController;
