/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../../../errors/AppError';
import { env } from '../../../env';

interface tokenPayload {
  id: string;
}

export const verifyJWT = () => {
  return (request: Request, response: Response, _next: NextFunction) => {
    const authorization = request.headers['authorization'];
    const token = authorization?.split(' ')[1];

    if (!token) throw new AppError('Invalid token.', 401);

    jwt.verify(token, env.jwtSecret as string, (error, decoded) => {
      if (error) throw new AppError('Invalid token.', 401);

      if (decoded) {
        request.userId = (decoded as tokenPayload).id;
      }

      return _next();
    });
  };
};
