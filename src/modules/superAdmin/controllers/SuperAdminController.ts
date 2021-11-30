import { NextFunction, Request, Response } from 'express';
import { getRepository } from 'typeorm';
import * as yup from 'yup';
import { AppError } from '@/shared/errors/AppError';
import bcrypt from 'bcrypt';
import { UsuarioShare as UserShare } from '@/shared/infra/typeorm/models/UsuarioShare';

class SuperAdminController {
  async create(request: Request, response: Response, _next: NextFunction) {
    const {
      name,
      email,
      password,
      cpf,
      role,
      phone,
      birth_date,
      country,
      state,
      city,
    } = request.body;

    const schema = yup.object().shape({
      name: yup.string().required(),
      email: yup.string().email().required(),
      password: yup.string().required(),
      cpf: yup.string().required(),
      role: yup.string().required(),
      phone: yup.string().required(),
      birth_date: yup.date().required(),
      country: yup.string().required(),
      state: yup.string().required(),
      city: yup.string().required(),
    });
    try {
      await schema.validate(request.body);
    } catch (err) {
      return _next(new AppError('Something wrong with the request.'));
    }

    const userShareRepository = getRepository(UserShare);

    const emailAlreadyExists = await userShareRepository.findOne({
      email,
    });

    if (emailAlreadyExists) {
      return _next(new AppError('Email already exists!'));
    }

    const cpfAlreadyExists = await userShareRepository.findOne({
      cpf,
    });

    if (cpfAlreadyExists) {
      return _next(new AppError('CPF already exists!'));
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userShare = userShareRepository.create({
      nome: name,
      email,
      senha: passwordHash,
      telefone: phone,
      nascimento: birth_date,
      cpf,
      role,
      pais: country,
      estado: state,
      cidade: city,
    });

    await userShareRepository.save(userShare);

    return response
      .status(201)
      .json({ message: `User Share successfully created.` });
  }
}

export default SuperAdminController;
