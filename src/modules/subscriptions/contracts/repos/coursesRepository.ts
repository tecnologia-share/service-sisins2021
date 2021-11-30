import { Curso } from '@/shared/infra/typeorm/models/Curso';

export interface CoursesRepository {
  findOne: (
    params: CoursesRepository.Input
  ) => Promise<CoursesRepository.Output>;
}

export namespace CoursesRepository {
  export type Input = {
    courseId: string;
  };
  export type Output = undefined | Curso;
}
