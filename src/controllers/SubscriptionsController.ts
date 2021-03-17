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
    const { courseId, reason, examAnswers } = request.body;
    const { userId } = request;

    const schema = yup.object().shape({
      courseId: yup.string().required(),
      reason: yup.string().required(),
      examAnswers: yup
        .array()
        .of(
          yup.object().shape({
            questionId: yup.string().required(),
            response: yup.number().required(),
          })
        )
        .optional(),
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
    if (participant.inscricoes.length > 0) {
      for (let i = 0; i < participant.inscricoes.length; i++) {
        const subscription = participant.inscricoes[i];

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
      return _next(new AppError('This course is not open for subscriptions.'));
    }

    const subscriptionsRepository = getRepository(Inscricao);
    const subscription = subscriptionsRepository.create({
      curso_id: courseId,
      motivo: reason,
      participante_id: userId,
      status: SubscriptionStatus.notEvaluated,
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
          pontos: 10,
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
        participante_id: subscription.participante_id,
        curso_id: subscription.curso_id,
        motivo: subscription.motivo,
        status: subscription.status,
        desistencia: subscription.desistencia,
        created_at: subscription.created_at,
      },
    });
  }
}

export default SubscriptionsController;
