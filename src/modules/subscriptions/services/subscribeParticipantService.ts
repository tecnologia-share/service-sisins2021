import { inject, injectable } from 'tsyringe';
import { getRepository, getManager } from 'typeorm';
import { AppError } from '@/shared/errors/AppError';
import { SubscriptionStatus } from '@/shared/typings/SubscriptionStatus';
import { SubscribeParticipant } from '../contracts/usecases/subscribeParticipant';
import { Curso } from '@/shared/infra/typeorm/models/Curso';
import { Inscricao } from '@/shared/infra/typeorm/models/Inscricao';
import { Prova } from '@/shared/infra/typeorm/models/Prova';
import { ProvaInscricao } from '@/shared/infra/typeorm/models/ProvaInscricao';
import { QuestaoInscricao } from '@/shared/infra/typeorm/models/QuestaoInscricao';
import {
  ParticipantsRepository,
  CoursesRepository,
} from '@/modules/subscriptions/contracts/repos';

@injectable()
export class SubscribeParticipantService implements SubscribeParticipant {
  constructor(
    @inject('ParticipantsRepository')
    private readonly participantsRepository: ParticipantsRepository,
    @inject('CoursesRepository')
    private readonly coursesRepository: CoursesRepository
  ) {}

  async execute({
    userId,
    courseId,
    examAnswers,
    reason,
    videoLink,
  }: SubscribeParticipant.Input): Promise<SubscribeParticipant.Output> {
    const participant = await this.participantsRepository.findOne({ userId });
    if (!participant) {
      throw new AppError('Participant not found.');
    }

    const isDroppleOut = participant.inscricoes.some(this.checkIsBlocked);
    if (isDroppleOut) {
      throw new AppError('Participant is blocked', 403);
    }

    const course = await this.coursesRepository.findOne({ courseId });
    if (!course) {
      throw new AppError('Course not found.', 404);
    }

    if (!this.openForSubscriptions(course)) {
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
          throw new AppError('Participant already subscribed in this course.');
        }
      }

      if (participant.inscricoes.length >= 2) {
        throw new AppError('Participant already has two subscriptions.');
      }
    }

    let alreadyFinishedPredecessorCourse = false;

    if (course.curso_continuacao_id) {
      const predecessorCourse = await this.coursesRepository.findOne({
        courseId: course.curso_continuacao_id,
      });

      if (predecessorCourse) {
        // eslint-disable-next-line prettier/prettier
        alreadyFinishedPredecessorCourse =
          !!(await subscriptionsRepository.count({
            where: {
              participante_id: userId,
              status: SubscriptionStatus.concluded,
              curso_id: predecessorCourse.id,
            },
            // eslint-disable-next-line prettier/prettier
          }));
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

        const answer = examAnswers?.find(
          (currentAnswer) => currentAnswer.questionId === question.id
        );

        if (!answer) {
          throw new AppError('Some answer is missing.');
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

    return {
      id: subscription.id,
      participantId: subscription.participante_id,
      courseId: subscription.curso_id,
      reason: subscription.motivo,
      status: subscription.status,
      videoLink: subscription.link_video,
      droppedOut: subscription.desistencia,
      created_at: subscription.created_at,
    };
  }

  private checkIsBlocked = ({ desistencia }: Inscricao) => {
    const checkDateBlocked = () => {
      const actualDate = new Date();
      return desistencia.getTime() >= actualDate.getTime();
    };
    return desistencia ? checkDateBlocked() : false;
  };

  private openForSubscriptions = (course: Curso): boolean => {
    const currentDate = new Date();

    return (
      course.processoSeletivo.data_inicio <= currentDate &&
      course.processoSeletivo.data_final >= currentDate
    );
  };
}
