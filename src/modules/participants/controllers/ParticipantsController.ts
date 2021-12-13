import { AppError } from '@/shared/errors/AppError';
import { Participante } from '@/shared/infra/typeorm/models/Participante';
import SendMailService from '@/shared/providers/SendMailProvider';
import { Pergunta } from '@/shared/infra/typeorm/models/Pergunta';
import { PerguntaParticipante } from '@/shared/infra/typeorm/models/PerguntaParticipante';
import { auth, env } from '@/config/env';

import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { resolve } from 'path';
import { getRepository } from 'typeorm';
import * as yup from 'yup';

interface PayloadEmail {
  id: string;
  email: string;
}

interface AskAnswer {
  asksId: string;
  response: string;
}

interface IParticipant {
  name: string;
  email: string;
  password: string;
  cpf: string;
  phone: string;
  birth_date: Date;
  country: string;
  state: string;
  city: string;
  asksAnswers: Array<AskAnswer>;
}

class ParticipantsController {
  async create(request: Request, response: Response, _next: NextFunction) {
    const {
      name,
      email,
      password,
      phone,
      birth_date,
      country,
      cpf,
      state,
      city,
      asksAnswers,
    }: IParticipant = request.body;

    const schema = yup.object().shape({
      name: yup.string().required(),
      email: yup.string().email().required(),
      password: yup.string().required(),
      cpf: yup.string().required(),
      phone: yup.string().required(),
      birth_date: yup.date().required(),
      country: yup.string().required(),
      state: yup.string().required(),
      city: yup.string().required(),
      asksAnswers: yup
        .array()
        .of(
          yup.object().shape({
            asksId: yup.string().required(),
            response: yup.mixed().required(),
          })
        )
        .optional(),
    });

    try {
      await schema.validate(request.body);
    } catch (err) {
      return _next(new AppError('Something wrong with the request.'));
    }
    const participantsRepository = getRepository(Participante);
    const emailAlreadyExists = await participantsRepository.findOne({
      email,
    });

    if (emailAlreadyExists) {
      return _next(new AppError('Email already exists!'));
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const participant = participantsRepository.create({
      nome: name,
      email: 'inactive',
      senha: passwordHash,
      telefone: phone,
      nascimento: birth_date,
      cpf,
      pais: country,
      estado: state,
      cidade: city,
      perguntasParticipantes: [],
    });

    const asksRepository = getRepository(Pergunta);
    const asksParticipantsRepository = getRepository(PerguntaParticipante);
    const asks = await asksRepository.find();

    if (!(asks.length === asksAnswers.length))
      return _next(new AppError('You do not submit all asks'));

    for (let i = 0; i < asks.length; i++) {
      const ask = asks[i];

      const answer = (asksAnswers as AskAnswer[]).find(
        (currentAnswer) => currentAnswer.asksId === ask.id
      );

      if (!answer) {
        return _next(new AppError('Some answer is missing.'));
      }

      const newAsk = asksParticipantsRepository.create({
        pergunta_id: ask.id,
        resposta: answer.response,
        participante_id: participant.id,
      });

      participant.perguntasParticipantes.push(newAsk);
    }

    // START sending email
    const npsPath = resolve(
      __dirname,
      '../../shared/assets/emails/verificationEmail.hbs'
    );

    const token = jwt.sign(
      {
        email,
        id: participant.id,
      },
      auth.jwtSecret as string,
      { expiresIn: '5h' }
    );

    const variables = {
      name,
      link: `${env.hostBack}/api/register/verify-email/${token}`,
    };

    await participantsRepository.save(participant);

    await SendMailService.execute({
      to: email,
      subject: 'Cadastro',
      variables,
      path: npsPath,
    });
    // END sending email

    return response
      .status(201)
      .json({ message: `Confirmation email sent to ${email}.` });
  }
  async verifyEmail(request: Request, response: Response, _next: NextFunction) {
    const { token } = request.params;

    jwt.verify(token, auth.jwtSecret as string, async (err, decoded) => {
      if (err) {
        return _next(new AppError('Invalid token!', 401));
      }
      const { id, email } = decoded as PayloadEmail;
      const participantesRepository = getRepository(Participante);

      const participante = await participantesRepository.findOne(id);

      if (!participante) {
        return _next(new AppError('Participant not found.', 404));
      }

      const emailAlreadyExists = await participantesRepository.findOne({
        email,
      });

      /** @TODO redirect pra tela de dizendo que já existe o email ou pra tela de login*/
      if (emailAlreadyExists) {
        return _next(new AppError('Email already confirmed!'));
      }

      participante.email = email;

      participantesRepository.save(participante);

      /** @TODO página dizendo tipo "Teu email foi confirmado com sucesso, faça o login" */
      response.redirect(`${env.hostFront}`);
    });
  }
  async update(request: Request, response: Response, _next: NextFunction) {
    const { cidade, estado, nascimento, nome, pais, telefone } = request.body;
    const { userId } = request;

    const participantesRepository = getRepository(Participante);
    const participante = await participantesRepository.findOne(userId);
    if (!participante) {
      return _next(new Error('Participant not found.'));
    }

    if (cidade) participante.cidade = cidade;
    if (estado) participante.estado = estado;
    if (nascimento) participante.nascimento = nascimento;
    if (nome) participante.nome = nome;
    if (pais) participante.pais = pais;
    if (telefone) participante.telefone = telefone;

    await participantesRepository.save(participante);

    return response.status(200).json({ message: 'Participant updated.' });
  }

  async updateEmail(request: Request, response: Response, _next: NextFunction) {
    const { password, email } = request.body;
    const { userId } = request;

    const schema = yup.object().shape({
      email: yup.string().email().required(),
      password: yup.string().required(),
    });

    try {
      await schema.validate(request.body, { abortEarly: false });
    } catch (error) {
      return _next(new AppError('Email and password are required.'));
    }

    const participantesRepository = getRepository(Participante);
    const participante = await participantesRepository.findOne(userId);
    if (!participante) {
      return _next(new Error('Participant not found.'));
    }

    const senhaEstaCorreta = await bcrypt.compare(password, participante.senha);
    if (!senhaEstaCorreta) {
      return _next(new AppError('Invalid password.', 401));
    }

    /** @TODO Lógica para enviar email de confirmação */
    response
      .status(200)
      .json({ message: `Confirmation email sent to ${email}.` });
  }

  async updatePassword(
    request: Request,
    response: Response,
    _next: NextFunction
  ) {
    const { currentPassword, newPassword } = request.body;
    const { userId } = request;

    const schema = yup.object().shape({
      currentPassword: yup.string().required(),
      newPassword: yup.string().required(),
    });

    try {
      await schema.validate(request.body, { abortEarly: false });
    } catch (error) {
      return _next(
        new AppError('currentPassword and newPassword are required.')
      );
    }

    const participantesRepository = getRepository(Participante);
    const participante = await participantesRepository.findOne(userId);
    if (!participante) {
      return _next(new Error('Participant not found.'));
    }

    const passwordIsCorrect = await bcrypt.compare(
      currentPassword,
      participante.senha
    );
    if (!passwordIsCorrect) {
      return _next(new AppError('Invalid password.', 401));
    }

    participante.senha = newPassword;
    await participantesRepository.save(participante);

    return response.status(200).json({ message: 'Password updated.' });
  }
}

export default ParticipantsController;
