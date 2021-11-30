import { AppError } from '@/shared/errors/AppError';
import { Participante } from '@/shared/infra/typeorm/models/Participante';
import { Curso } from '@/shared/infra/typeorm/models/Curso';
import { Inscricao } from '@/shared/infra/typeorm/models/Inscricao';
import { SubscriptionStatus } from '@/shared/typings/SubscriptionStatus';
import { container } from '@/shared/container';
import { SubscribeParticipantService } from '@/modules/subscriptions/services/subscribeParticipantService';

import { NextFunction, Request, Response } from 'express';
import { getRepository } from 'typeorm';
import * as yup from 'yup';

class SubscriptionsController {
  async subscribe(request: Request, response: Response, _next: NextFunction) {
    try {
      const { userId, body } = request;

      if (body.option1.courseId === body?.option2?.courseId)
        throw new AppError('invalid option2: course has already been chosen');

      const subscribeParticipant = container.resolve(
        SubscribeParticipantService
      );

      const subscription1 = await subscribeParticipant.execute({
        ...body.option1,
        userId,
      });

      let subscription2;
      if (body?.option2) {
        subscription2 = await subscribeParticipant.execute({
          ...body.option2,
          userId,
        });
      }

      return response.status(201).json({
        message: 'Successful subscription.',
        subscription1,
        subscription2,
      });
    } catch (error) {
      return _next(error);
    }
  }

  async unsubscribe(request: Request, response: Response, _next: NextFunction) {
    const { courseId } = request.body;
    const { userId } = request;

    const schema = yup.object().shape({
      courseId: yup.string().required(),
    });

    try {
      await schema.validate(request.body, { abortEarly: false });
    } catch (error) {
      return _next(new AppError('courseId is required.'));
    }

    const participantsRepository = getRepository(Participante);
    const participant = await participantsRepository.findOne(userId, {
      select: ['id'],
    });
    if (!participant) {
      return _next(new Error('Participant not found.'));
    }

    const subscriptionsRepository = getRepository(Inscricao);
    const subscription = await subscriptionsRepository.findOne(
      { curso_id: courseId, participante_id: userId },
      {
        select: ['id'],
      }
    );

    if (!subscription) {
      return _next(new AppError('Participant is not enrolled in this course.'));
    }

    const coursesRepository = getRepository(Curso);
    const course = await coursesRepository.findOne(courseId, {
      select: ['id'],
      relations: ['processoSeletivo'],
    });

    if (!course) {
      return _next(new Error('Course not found.'));
    }

    const currentDate = new Date();
    const openForSubscriptions =
      course.processoSeletivo.data_inicio <= currentDate &&
      course.processoSeletivo.data_final >= currentDate;
    if (!openForSubscriptions) {
      return _next(
        new AppError('This course is not open for unsubscriptions.')
      );
    }

    await subscriptionsRepository.remove(subscription);

    return response.status(200).json({
      message: 'Successful unsubscription.',
    });
  }

  async showSubscribe(
    request: Request,
    response: Response,
    _next: NextFunction
  ) {
    const { id } = request.params;

    const subscribeRepository = getRepository(Inscricao);
    const subscribe = await subscribeRepository.findOne(id, {
      relations: ['provasInscricoes', 'participante', 'avaliacoes'],
    });
    if (!subscribe) {
      return _next(new AppError('Subscribe not found.', 404));
    }

    return response.status(200).json({ subscribe });
  }

  async evaluate(request: Request, response: Response, _next: NextFunction) {
    const { id, status } = request.body;

    const schema = yup.object().shape({
      id: yup.string().required(),
      status: yup.string().required().oneOf(Object.values(SubscriptionStatus)),
    });

    try {
      await schema.validate(request.body, { abortEarly: false });
    } catch (error) {
      return _next(
        new AppError((error as yup.ValidationError).errors.join(' - '))
      );
    }

    const subscribeRepository = getRepository(Inscricao);
    const subscribe = await subscribeRepository.findOne(id);
    if (!subscribe) {
      return _next(new AppError('Subscribe not found.', 404));
    }
    const result: { status: string; blocked_date?: string } = {
      status: '',
      blocked_date: '',
    };
    if (status == SubscriptionStatus.droppedOut) {
      const desistencia = new Date();
      desistencia.setFullYear(desistencia.getFullYear() + 1);
      subscribe.status = status;
      subscribe.desistencia = desistencia;
      result.status = status;
      result.blocked_date = desistencia.toDateString();
    } else {
      subscribe.status = status;
      result.status = status;
      delete result.blocked_date;
    }

    await subscribeRepository.save(subscribe);

    return response.status(200).json(result);
  }
}

export default SubscriptionsController;
