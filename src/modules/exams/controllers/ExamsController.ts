import { NextFunction, Request, Response } from 'express';
import { getRepository } from 'typeorm';
import * as yup from 'yup';
import { AppError } from '@/shared/errors/AppError';
import { UsuarioShare } from '@/shared/infra/typeorm/models/UsuarioShare';
import { Prova } from '@/shared/infra/typeorm/models/Prova';
import { Curso } from '@/shared/infra/typeorm/models/Curso';
import { Questao } from '@/shared/infra/typeorm/models/Questao';

interface Question {
  id?: string;
  title: string;
  question: string;
  image: string;
  alternative1: string;
  alternative2: string;
  alternative3: string;
  alternative4: string;
  alternative5: string;
  correctAlternative: number;
  points: number;
}

class ExamsController {
  async create(request: Request, response: Response, _next: NextFunction) {
    const { courseId, questions, examTitle, examText } = request.body;
    const { userId } = request;

    const schema = yup.object().shape({
      courseId: yup.string().required(),
      examTitle: yup.string().optional(),
      examText: yup.string().optional(),
      questions: yup
        .array()
        .of(
          yup.object().shape({
            question: yup.string().required(),
            image: yup.string().required(),
            alternative1: yup.string().required(),
            alternative2: yup.string().required(),
            alternative3: yup.string().required(),
            alternative4: yup.string().required(),
            alternative5: yup.string().required(),
            correctAlternative: yup.number().max(5).min(1).required(),
            points: yup.number().required(),
          })
        )
        .required(),
    });

    try {
      await schema.validate(request.body, { abortEarly: false });
    } catch (error) {
      return _next(new AppError('Something wrong with the request.'));
    }

    const usersRepository = getRepository(UsuarioShare);
    const user = await usersRepository.findOne(userId);

    if (!user) {
      return _next(new Error('User not found.'));
    }

    const coursesRepository = getRepository(Curso);
    const course = await coursesRepository.findOne(courseId, {
      relations: ['provas'],
    });

    if (!course) {
      return _next(new AppError('Course not found.', 404));
    }

    if (course.provas.length > 0) {
      return _next(new AppError('This course already has an exam.'));
    }

    const examsRepository = getRepository(Prova);
    const exam = examsRepository.create({
      curso_id: courseId,
      title: examTitle,
      text: examText,
      questoes: [],
    });

    const questionsRepository = getRepository(Questao);

    (questions as Question[]).forEach((question) => {
      const newExamQuestion = questionsRepository.create({
        pergunta: question.question,
        imagem: question.image,
        alternativa1: question.alternative1,
        alternativa2: question.alternative2,
        alternativa3: question.alternative3,
        alternativa4: question.alternative4,
        alternativa5: question.alternative5,
        gabarito: question.correctAlternative,
        pontos: question.points,
      });

      exam.questoes.push(newExamQuestion);
    });

    await examsRepository.save(exam);

    return response.status(201).json({
      message: 'Exam successfully created.',
      exam: {
        id: exam.id,
        courseId: exam.curso_id,
        created_at: exam.created_at,
      },
    });
  }

  async update(request: Request, response: Response, _next: NextFunction) {
    const { id, questions, examTitle, examText } = request.body;
    const { userId } = request;

    const schema = yup.object().shape({
      id: yup.string().required(),
      examTitle: yup.string().optional(),
      examText: yup.string().optional(),
      questions: yup
        .array()
        .of(
          yup.object().shape({
            id: yup.string().optional(),
            question: yup.string().required(),
            image: yup.string().required(),
            alternative1: yup.string().required(),
            alternative2: yup.string().required(),
            alternative3: yup.string().required(),
            alternative4: yup.string().required(),
            alternative5: yup.string().required(),
            correctAlternative: yup.number().max(5).min(1).required(),
            points: yup.number().required(),
          })
        )
        .required(),
    });

    try {
      await schema.validate(request.body, { abortEarly: false });
    } catch (error) {
      return _next(new AppError('Something wrong with the request.'));
    }

    const usersRepository = getRepository(UsuarioShare);
    const user = await usersRepository.findOne(userId);

    if (!user) {
      return _next(new Error('User not found.'));
    }

    const examsRepository = getRepository(Prova);
    const exam = await examsRepository.findOne(id, { relations: ['questoes'] });

    if (!exam) {
      return _next(new AppError('Exam not found.', 404));
    }

    if (examTitle) exam.title = examTitle;
    if (examText) exam.text = examText;

    const questionsRepository = getRepository(Questao);

    const newQuestions: Questao[] = [];

    for (let i = 0; i < (questions as Question[]).length; i++) {
      const question = questions[i];
      if (question.id) {
        const questionToUpdate = exam.questoes.find(
          (item) => item.id === question.id
        );

        if (!questionToUpdate) {
          return _next(new AppError(`Question ${question.id} not found.`, 404));
        }

        newQuestions.push(questionToUpdate);
      } else {
        const newQuestion = questionsRepository.create({
          pergunta: question.question,
          imagem: question.image,
          gabarito: question.correctAlternative,
          alternativa1: question.alternative1,
          alternativa2: question.alternative2,
          alternativa3: question.alternative3,
          alternativa4: question.alternative4,
          alternativa5: question.alternative5,
          pontos: question.points,
        });

        newQuestions.push(newQuestion);
      }
    }

    exam.questoes = newQuestions;

    await examsRepository.save(exam);

    return response.status(200).json({
      message: 'Exam successfully updated.',
      exam: {
        id: exam.id,
        courseId: exam.curso_id,
        created_at: exam.created_at,
      },
    });
  }

  async delete(request: Request, response: Response, _next: NextFunction) {
    const { id } = request.body;
    const { userId } = request;

    const schema = yup.object().shape({
      id: yup.string().required(),
    });

    try {
      await schema.validate(request.body, { abortEarly: false });
    } catch (error) {
      return _next(new AppError('Something wrong with the request.'));
    }

    const usersRepository = getRepository(UsuarioShare);
    const user = await usersRepository.findOne(userId);

    if (!user) {
      return _next(new Error('User not found.'));
    }

    const examsRepository = getRepository(Prova);
    const exam = await examsRepository.findOne(id, { select: ['id'] });

    if (!exam) {
      return _next(new AppError('Exam not found.', 404));
    }

    await examsRepository.remove(exam);

    return response.status(200).json({
      message: 'Exam successfully deleted.',
    });
  }
}

export default ExamsController;
