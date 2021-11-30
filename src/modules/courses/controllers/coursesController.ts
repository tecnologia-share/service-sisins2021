import { NextFunction, Request, Response } from 'express';
import { getRepository } from 'typeorm';
import * as yup from 'yup';
import { Curso } from '@/shared/infra/typeorm/models/Curso';
import { ProcessoSeletivo } from '@/shared/infra/typeorm/models/ProcessoSeletivo';
import { UsuarioShare } from '@/shared/infra/typeorm/models/UsuarioShare';
import { CourseStates } from '@/shared/typings/CourseStates';
import { AppError } from '@/shared/errors/AppError';

class CoursesController {
  async create(request: Request, response: Response, _next: NextFunction) {
    const {
      name,
      category,
      description,
      time,
      professor,
      selectionProcessId,
      duration,
      predecessorCourseId,
    } = request.body;
    const { userId } = request;

    const schema = yup.object().shape({
      name: yup.string().required(),
      category: yup.string().required(),
      description: yup.string().required(),
      time: yup.string().required(),
      professor: yup.string().required(),
      selectionProcessId: yup.string().required(),
      duration: yup.string().required(),
      predecessorCourseId: yup.string().optional(),
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

    const selecrionProcessRepository = getRepository(ProcessoSeletivo);
    const selectionProcess = await selecrionProcessRepository.findOne(
      selectionProcessId,
      { select: ['id'] }
    );

    if (!selectionProcess) {
      return _next(new AppError('Selection process not found.', 404));
    }

    const coursesRepository = getRepository(Curso);
    const course = coursesRepository.create({
      descricao: description,
      categoria: category,
      horario: time,
      nome: name,
      professor: professor,
      processo_seletivo_id: selectionProcessId,
      tempo_duracao: duration,
      curso_continuacao_id: predecessorCourseId,
    });

    await coursesRepository.save(course);

    return response.status(201).json({
      message: 'Course successfully created.',
      course: {
        id: course.id,
        name: course.nome,
        category: course.categoria,
        description: course.descricao,
        time: course.horario,
        professor: course.professor,
        selectionProcessId: course.processo_seletivo_id,
        created_at: course.created_at,
        duration: course.tempo_duracao,
        predecessorCourseId: course.curso_continuacao_id,
      },
    });
  }

  async showExam(request: Request, response: Response, _next: NextFunction) {
    const { id } = request.params;

    const coursesRepository = getRepository(Curso);
    const course = await coursesRepository.findOne(id, {
      relations: ['provas', 'provas.questoes'],
    });

    if (!course) {
      return _next(new AppError('Course not found.', 404));
    }

    if (course.provas.length === 0) {
      return _next(new AppError('This course has no exam.', 404));
    }

    return response.status(200).json({
      exam: {
        id: course.provas[0].id,
        title: course.provas[0].title,
        text: course.provas[0].text,
        created_at: course.provas[0].created_at,
        questions: course.provas[0].questoes.map((question) => {
          return {
            id: question.id,
            question: question.pergunta,
            alternative1: question.alternativa1,
            alternative2: question.alternativa2,
            alternative3: question.alternativa3,
            alternative4: question.alternativa4,
            alternative5: question.alternativa5,
            correctAlternative: question.gabarito,
            image: question.imagem,
            points: question.pontos,
            created_at: question.created_at,
          };
        }),
      },
    });
  }

  async showSelectionProcessCourses(
    request: Request,
    response: Response,
    _next: NextFunction
  ) {
    const { id } = request.params;

    const selectionProcessRepository = getRepository(ProcessoSeletivo);
    const selectionProcess = await selectionProcessRepository.findOne(id, {
      relations: ['cursos', 'cursos.provas'],
    });

    if (!selectionProcess) {
      return _next(new AppError('Selection Process not found.', 404));
    }

    return response.status(200).json({
      courses: selectionProcess.cursos.map((course) => {
        return {
          id: course.id,
          name: course.nome,
          category: course.categoria,
          description: course.descricao,
          time: course.horario,
          professor: course.professor,
          hasExam: course.provas.length > 0,
          selectionProcessId: course.processo_seletivo_id,
          created_at: course.created_at,
        };
      }),
    });
  }

  async show(request: Request, response: Response, _next: NextFunction) {
    const { state } = request.query;

    let courses: Curso[];
    const coursesRepository = getRepository(Curso);

    if (state) {
      if (!Object.keys(CourseStates).includes(state as string)) {
        return _next(new AppError('Invalid state.'));
      }

      const currentDate = new Date();

      switch (state) {
        case CourseStates.active:
          courses = await coursesRepository
            .createQueryBuilder('cursos')
            .leftJoinAndSelect('cursos.provas', 'provas')
            .innerJoin('cursos.processoSeletivo', 'processos_seletivos')
            .where(
              'processos_seletivos.data_inicio <= :currentDate AND data_final >= :currentDate',
              {
                currentDate: currentDate.toJSON(),
              }
            )
            .getMany();
          break;
        default:
          courses = await coursesRepository
            .createQueryBuilder('cursos')
            .leftJoinAndSelect('cursos.provas', 'provas')
            .innerJoin('cursos.processoSeletivo', 'processos_seletivos')
            .where(
              'processos_seletivos.data_inicio > :currentDate OR data_final < :currentDate',
              {
                currentDate: currentDate.toJSON(),
              }
            )
            .getMany();
      }
    } else {
      courses = await coursesRepository.find({
        relations: ['provas'],
      });
    }

    return response.status(200).json({
      courses: courses.map((course) => {
        return {
          id: course.id,
          name: course.nome,
          category: course.categoria,
          description: course.descricao,
          time: course.horario,
          professor: course.professor,
          hasExam: course.provas.length > 0,
          numberOfQuestions: course.provas.length,
          selectionProcessId: course.processo_seletivo_id,
          created_at: course.created_at,
        };
      }),
    });
  }

  async update(request: Request, response: Response, _next: NextFunction) {
    const { id, name, category, description, time, professor } = request.body;
    const { userId } = request;

    const usersRepository = getRepository(UsuarioShare);
    const user = await usersRepository.findOne(userId);

    if (!user) {
      return _next(new Error('User not found.'));
    }

    const coursesRepository = getRepository(Curso);
    const course = await coursesRepository.findOne(id);

    if (!course) {
      return _next(new AppError('Course not found.', 404));
    }

    if (name) course.nome = name;
    if (category) course.categoria = category;
    if (description) course.descricao = description;
    if (time) course.horario = time;
    if (professor) course.professor = professor;

    await coursesRepository.save(course);

    return response.status(200).json({
      message: 'Course successfully updated.',
      course: {
        id: course.id,
        category: course.categoria,
        description: course.descricao,
        time: course.horario,
        name: course.nome,
        professor: course.professor,
        selectionProcessId: course.processo_seletivo_id,
        created_at: course.created_at,
      },
    });
  }

  async delete(request: Request, response: Response, _next: NextFunction) {
    const { id } = request.body;
    const { userId } = request;

    const usersRepository = getRepository(UsuarioShare);
    const user = await usersRepository.findOne(userId);

    if (!user) {
      return _next(new Error('User not found.'));
    }

    const coursesRepository = getRepository(Curso);
    const course = await coursesRepository.findOne(id);

    if (!course) {
      return _next(new AppError('Course not found.', 404));
    }

    await coursesRepository.remove(course);

    return response.status(200).json({
      message: 'Course successfully deleted.',
    });
  }

  async showCourseSubscribes(
    request: Request,
    response: Response,
    _next: NextFunction
  ) {
    const { id } = request.params;

    const coursesRepository = getRepository(Curso);
    const course = await coursesRepository.findOne(id, {
      relations: ['inscricoes'],
    });
    if (!course) return _next(new AppError('Course not found.', 404));

    const subscribes = course.inscricoes;

    return response.status(200).json({ subscribes });
  }
}

export default CoursesController;
