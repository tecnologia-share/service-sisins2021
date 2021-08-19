import request from 'supertest';
import app from '../../app';
import { Connection, createConnection } from 'typeorm';
import {
  createAdmin,
  createNonAdmin,
  genTokenAdmin,
  genTokenNonAdmin,
} from '../../utils/tests';

import { Curso } from '../../models/Curso';

let adminToken: string;
let nonAdminToken: string;
let connection: Connection;
let selectionProcessWithCourseId: string;
let selectionProcessWithoutCourseId: string;
const futureDate = new Date();
futureDate.setFullYear(futureDate.getFullYear() + 1);
const pastDate = new Date();
pastDate.setFullYear(pastDate.getFullYear() - 1);

const createSelectionProcess = async () => {
  const createSelectionProcessWithCourseResponse = await request(app)
    .post('/api/selection-process')
    .set({ authorization: `Bearer ${adminToken}` })
    .send({
      name: 'Selection Process Name',
      startDate: pastDate.toJSON(),
      endDate: futureDate.toJSON(),
      editalLink: 'link edital',
      manualLink: 'link manual',
    });
  const createSelectionProcessResponse = await request(app)
    .post('/api/selection-process')
    .set({ authorization: `Bearer ${adminToken}` })
    .send({
      name: 'Selection Process Name',
      startDate: pastDate.toJSON(),
      endDate: futureDate.toJSON(),
      editalLink: 'link edital',
      manualLink: 'link manual',
    });

  selectionProcessWithCourseId =
    createSelectionProcessWithCourseResponse.body.selectionProcess.id;
  selectionProcessWithoutCourseId =
    createSelectionProcessResponse.body.selectionProcess.id;

  const coursesRepository = connection.getRepository(Curso);
  const course = coursesRepository.create({
    categoria: 'Example',
    descricao: 'Description',
    horario: 'From 8h to 9h',
    nome: 'Course Name',
    professor: 'Professor Name',
    processo_seletivo_id: selectionProcessWithCourseId,
    tempo_duracao: '6 meses',
  });
  await coursesRepository.save(course);
};

describe('Update Selection Process tests', () => {
  beforeAll(async () => {
    if (!connection) {
      connection = await createConnection();
    }
    await connection.dropDatabase();
    await connection.runMigrations();

    await createAdmin(connection);
    await createNonAdmin(connection);
    adminToken = await genTokenAdmin();
    nonAdminToken = await genTokenNonAdmin();
    await createSelectionProcess();
  });

  it('Should not be possible to exclude a selection process that has courses.', async () => {
    const response = await request(app)
      .delete('/api/selection-process')
      .set({ authorization: `Bearer ${adminToken}` })
      .send({
        id: selectionProcessWithCourseId,
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      'It is necessary to exclude courses associated with this selection process in order to exclude it.'
    );
  });

  it('Should not be possible to exclude a selection process that does not exist.', async () => {
    const response = await request(app)
      .delete('/api/selection-process')
      .set({ authorization: `Bearer ${adminToken}` })
      .send({
        id: 'Some id',
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Selection Process not found.');
  });

  test('Only the admin can delete a selection process.', async () => {
    const response = await request(app)
      .delete('/api/selection-process')
      .set({ authorization: `Bearer ${nonAdminToken}` })
      .send({
        id: selectionProcessWithoutCourseId,
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(
      'You are not authorized to access this route'
    );
  });

  it('Should be possible to exclude a selection process.', async () => {
    const response = await request(app)
      .delete('/api/selection-process')
      .set({ authorization: `Bearer ${adminToken}` })
      .send({
        id: selectionProcessWithoutCourseId,
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe(
      'Selection process successfully deleted.'
    );
  });

  it('Should return 401 UNAUTHORIZED if the token sent is invalid', async () => {
    const response = await request(app)
      .delete('/api/selection-process')
      .set({ authorization: 'invalid_token' })
      .send({
        id: selectionProcessWithoutCourseId,
      });

    expect(response.status).toBe(401);
  });
});
