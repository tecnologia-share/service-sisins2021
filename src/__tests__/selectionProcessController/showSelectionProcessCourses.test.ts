import request from 'supertest';
import app from '../../app';
import { Connection, createConnection } from 'typeorm';
import { createAdmin, createNonAdmin } from '../../utils/tests';

let adminToken: string;
let connection: Connection;
let selectionProcessId: string;
let InactiveSelectionProcessId: string;

const getToken = async () => {
  const responseAdmin = await request(app)
    .post('/api/authenticate-share')
    .send({
      email: 'admin@example.com',
      password: 'correct_password',
    });

  adminToken = responseAdmin.body.token;
};

const createSelectionProcess = async () => {
  const futureDate = new Date();
  futureDate.setFullYear(futureDate.getFullYear() + 1);
  const pastDate = new Date();
  pastDate.setFullYear(pastDate.getFullYear() - 1);

  const responseSelectionProcess = await request(app)
    .post('/api/selection-process')
    .set({ authorization: `Bearer ${adminToken}` })
    .send({
      name: 'Selection Process Name',
      startDate: pastDate.toJSON(),
      endDate: futureDate.toJSON(),
      editalLink: 'link edital',
      manualLink: 'link manual',
    });

  const responseInactiveSelectionProcess = await request(app)
    .post('/api/selection-process')
    .set({ authorization: `Bearer ${adminToken}` })
    .send({
      name: 'Selection Process Name',
      startDate: pastDate.toJSON(),
      endDate: new Date().toJSON(),
      editalLink: 'link edital',
      manualLink: 'link manual',
    });

  selectionProcessId = responseSelectionProcess.body.selectionProcess.id;
  InactiveSelectionProcessId =
    responseInactiveSelectionProcess.body.selectionProcess.id;

  await request(app)
    .post('/api/courses')
    .set({ authorization: `Bearer ${adminToken}` })
    .send({
      name: 'Active Course',
      category: 'Category',
      description: 'Description',
      time: 'Time',
      professor: 'Professor',
      selectionProcessId,
      duration: '6 meses',
    });

  await request(app)
    .post('/api/courses')
    .set({ authorization: `Bearer ${adminToken}` })
    .send({
      name: 'Inactive Course',
      category: 'Category',
      description: 'Description',
      time: 'Time',
      professor: 'Professor',
      selectionProcessId: InactiveSelectionProcessId,
      duration: '6 meses',
    });
};

describe('Show Selection Process Courses tests', () => {
  beforeAll(async () => {
    if (!connection) {
      connection = await createConnection();
    }
    await connection.dropDatabase();
    await connection.runMigrations();

    await createAdmin(connection);
    await createNonAdmin(connection);
    await getToken();
    await createSelectionProcess();
  });

  it('Should be possible get all courses of a selection process.', async () => {
    const activesCourses = await request(app).get(
      `/api/selection-process/${selectionProcessId}/courses`
    );
    const inactivesCourses = await request(app).get(
      `/api/selection-process/${InactiveSelectionProcessId}/courses`
    );

    expect(activesCourses.status).toBe(200);
    expect(activesCourses.body).toHaveProperty('courses');
    expect(activesCourses.body.courses).toHaveLength(1);
    expect(activesCourses.body.courses[0].name).toBe('Active Course');
    expect(inactivesCourses.status).toBe(200);
    expect(inactivesCourses.body).toHaveProperty('courses');
    expect(inactivesCourses.body.courses).toHaveLength(1);
    expect(inactivesCourses.body.courses[0].name).toBe('Inactive Course');
  });

  it('Should return error if the selection process does not exists.', async () => {
    const response = await request(app).get(
      `/api/selection-process/non-existent-id/courses`
    );

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Selection Process not found.');
  });
});
