import { getRepository, Repository } from 'typeorm';
import { CoursesRepository } from '../../../../modules/subscriptions/contracts/repos/coursesRepository';
import { Curso } from '../models/Curso';

export class DbCoursesRepository implements CoursesRepository {
  private readonly ormRepository: Repository<Curso>;

  constructor() {
    this.ormRepository = getRepository(Curso);
  }

  async findOne({
    courseId,
  }: CoursesRepository.Input): Promise<CoursesRepository.Output> {
    return this.ormRepository.findOne(courseId, {
      relations: ['processoSeletivo'],
    });
  }
}
