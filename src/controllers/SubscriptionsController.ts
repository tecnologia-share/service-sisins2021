import { NextFunction, Request, Response } from 'express';
import { getRepository, getManager } from 'typeorm';
import * as yup from 'yup';

import { AppError } from '../errors/AppError';
import { Participante } from '../models/Participante';
import { Curso } from '../models/Curso';
import { Prova } from '../models/Prova';
import { QuestaoInscricao } from '../models/QuestaoInscricao';
import { ProvaInscricao } from '../models/ProvaInscricao';
import { Inscricao } from '../models/Inscricao';
import { SubscriptionStatus } from '../typings/SubscriptionStatus';

interface ExamAnswer {
  questionId: string;
  response: number;
}

class SubscriptionsController {
  async subscribe(request: Request, response: Response, _next: NextFunction) {
    const { courseId, reason, examAnswers, videoLink } = request.body;
    const { userId } = request;

    const schema = yup.object().shape({
      courseId: yup.string().required(),
      reason: yup.string().required(),
      examAnswers: yup
        .array()
        .of(
          yup.object().shape({
            questionId: yup.string().required(),
            response: yup.number().max(5).min(1).required(),
          })
        )
        .optional(),
      videoLink: yup.string().optional(),
    });

    try {
      await schema.validate(request.body, { abortEarly: false });
    } catch (error) {
      return _next(new AppError('Something wrong with the request.'));
    }

    const participantsRepository = getRepository(Participante);
    const participant = await participantsRepository.findOne(userId, {
      select: ['id'],
      relations: ['inscricoes'],
    });
    if (!participant) {
      return _next(new Error('Participant not found.'));
    }

    const coursesRepository = getRepository(Curso);
    const course = await coursesRepository.findOne(courseId, {
      select: ['id'],
      relations: ['processoSeletivo'],
    });

    if (!course) {
      return _next(new AppError('Course not found.', 404));
    }

    const currentDate = new Date();
    const openForSubscriptions =
      course.processoSeletivo.data_inicio <= currentDate &&
      course.processoSeletivo.data_final >= currentDate;
    if (!openForSubscriptions) {
      throw new AppError('This course is not open for subscriptions.');
    }

    const subscriptionsRepository = getRepository(Inscricao);
    const subscriptionsForThisSelectionProcess = await subscriptionsRepository
      .createQueryBuilder('inscricoes')
      .leftJoinAndSelect('inscricoes.curso', 'curso')
      .where(
        'curso.processo_seletivo_id = :selectionProcessId AND inscricoes.participante_id = :userId',
        {
          selectionProcessId: course.processoSeletivo.id,
          userId,
        }
      )
      .getMany();

    if (subscriptionsForThisSelectionProcess.length > 0) {
      for (let i = 0; i < subscriptionsForThisSelectionProcess.length; i++) {
        const subscription = subscriptionsForThisSelectionProcess[i];

        if (subscription.curso_id === courseId) {
          return _next(
            new AppError('Participant already subscribed in this course.')
          );
        }
      }

      if (participant.inscricoes.length >= 2) {
        return _next(
          new AppError('Participant already has two subscriptions.')
        );
      }
    }

    let alreadyFinishedPredecessorCourse = false;

    if (course.curso_continuacao_id) {
      const predecessorCourse = await coursesRepository.findOne(
        course.curso_continuacao_id
      );

      if (predecessorCourse) {
        alreadyFinishedPredecessorCourse = !!(await subscriptionsRepository.count(
          {
            where: {
              participante_id: userId,
              status: SubscriptionStatus.concluded,
              curso_id: predecessorCourse.id,
            },
          }
        ));
      }
    }

    const subscription = subscriptionsRepository.create({
      curso_id: courseId,
      motivo: reason,
      participante_id: userId,
      status: alreadyFinishedPredecessorCourse
        ? SubscriptionStatus.approved
        : SubscriptionStatus.notEvaluated,
      link_video: videoLink,
    });

    const examsRepository = getRepository(Prova);
    const exam = await examsRepository.findOne(
      { curso_id: courseId },
      {
        select: ['id'],
        relations: ['questoes'],
      }
    );

    let participantExam: ProvaInscricao | undefined;

    if (exam) {
      const participantExamsRepository = getRepository(ProvaInscricao);
      participantExam = participantExamsRepository.create({
        inscricao_id: subscription.id,
        prova_id: exam.id,
        questoesInscricoes: [],
      });

      const subscriptionsQuestionsRepository = getRepository(QuestaoInscricao);

      for (let i = 0; i < exam.questoes.length; i++) {
        const question = exam.questoes[i];

        const answer = (examAnswers as ExamAnswer[]).find(
          (currentAnswer) => currentAnswer.questionId === question.id
        );

        if (!answer) {
          return _next(new AppError('Some answer is missing.'));
        }

        const participantQuestion = subscriptionsQuestionsRepository.create({
          prova_inscricao_id: participantExam?.id,
          questao_id: question.id,
          resposta: answer.response,
        });

        participantExam?.questoesInscricoes.push(participantQuestion);
      }
    }

    await getManager().transaction(async (transactionalEntityManager) => {
      await transactionalEntityManager.save<Inscricao>(subscription);

      if (participantExam) {
        await transactionalEntityManager.save<ProvaInscricao>(participantExam);
      }
    });

    return response.status(201).json({
      message: 'Successful subscription.',
      subscription: {
        id: subscription.id,
        participantId: subscription.participante_id,
        courseId: subscription.curso_id,
        reason: subscription.motivo,
        status: subscription.status,
        videoLink: subscription.link_video,
        droppedOut: subscription.desistencia,
        created_at: subscription.created_at,
      },
    });
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
}

export default SubscriptionsController;
