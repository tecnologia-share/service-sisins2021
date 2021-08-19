import request from 'supertest';
import app from '../../app';
import { Connection, createConnection } from 'typeorm';
import { createAdmin, createNonAdmin } from '../../utils/tests';

let adminToken: string;
let connection: Connection;

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

  const selectionProcessId = responseSelectionProcess.body.selectionProcess.id;
  const InactiveSelectionProcessId =
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

describe('Show Courses tests', () => {
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

  it('Should be possible get all courses.', async () => {
    const response = await request(app).get('/api/courses');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('courses');
    expect(response.body.courses).toHaveLength(2);
  });

  it('Should be possible get only active courses.', async () => {
    const response = await request(app).get('/api/courses?state=active');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('courses');
    expect(response.body.courses).toHaveLength(1);
    expect(response.body.courses[0].name).toBe('Active Course');
  });

  it('Should be possible get only inactive courses.', async () => {
    const response = await request(app).get('/api/courses?state=inactive');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('courses');
    expect(response.body.courses).toHaveLength(1);
    expect(response.body.courses[0].name).toBe('Inactive Course');
  });

  it('Should return error if the state does not exists.', async () => {
    const response = await request(app).get(
      '/api/courses?state=non-existent-state'
    );

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Invalid state.');
  });
});
