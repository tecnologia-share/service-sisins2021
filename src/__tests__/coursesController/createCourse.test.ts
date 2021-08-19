import request from 'supertest';
import app from '../../app';
import { Connection, createConnection } from 'typeorm';
import {
  createAdmin,
  createNonAdmin,
  genTokenAdmin,
  genTokenNonAdmin,
} from '../../utils/tests';

let adminToken: string;
let nonAdminToken: string;
let selectionProcessId: string;
let connection: Connection;

const createSelectionProcess = async () => {
  const futureDate = new Date();
  futureDate.setFullYear(futureDate.getFullYear() + 1);
  const pastDate = new Date();
  pastDate.setFullYear(pastDate.getFullYear() - 1);

  const response = await request(app)
    .post('/api/selection-process')
    .set({ authorization: `Bearer ${adminToken}` })
    .send({
      name: 'Selection Process Name',
      startDate: pastDate.toJSON(),
      endDate: futureDate.toJSON(),
      editalLink: 'link edital',
      manualLink: 'link manual',
    });

  selectionProcessId = response.body.selectionProcess.id;
};

describe('Create Selection Process tests', () => {
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

  it('Should be possible to create a course.', async () => {
    const response = await request(app)
      .post('/api/courses')
      .set({ authorization: `Bearer ${adminToken}` })
      .send({
        name: 'Name',
        category: 'Category',
        description: 'Description',
        time: 'Time',
        professor: 'Professor',
        selectionProcessId,
        duration: '6 meses',
      });

    expect(response.body.message).toBe('Course successfully created.');
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('course');
  });

  test('Only the admin can create a course.', async () => {
    const response = await request(app)
      .post('/api/courses')
      .set({ authorization: `Bearer ${nonAdminToken}` })
      .send({
        name: 'Name',
        category: 'Category',
        description: 'Description',
        time: 'Time',
        professor: 'Professor',
        selectionProcessId,
        duration: '6 meses',
      });

    expect(response.body.message).toBe(
      'You are not authorized to access this route'
    );
    expect(response.status).toBe(401);
  });

  test('A selection process is required to create a course.', async () => {
    const response = await request(app)
      .post('/api/courses')
      .set({ authorization: `Bearer ${adminToken}` })
      .send({
        name: 'Name',
        category: 'Category',
        description: 'Description',
        time: 'Time',
        professor: 'Professor',
        selectionProcessId: 'Non-existent id',
        duration: '6 meses',
      });

    expect(response.body.message).toBe('Selection process not found.');
    expect(response.status).toBe(404);
  });

  it('Should return an error if any property is missing from the request body.', async () => {
    const responseWithoutName = await request(app)
      .post('/api/courses')
      .set({ authorization: `Bearer ${adminToken}` })
      .send({
        category: 'Category',
        description: 'Description',
        time: 'Time',
        professor: 'Professor',
        selectionProcessId,
        duration: '6 meses',
      });
    const responseWithoutCategory = await request(app)
      .post('/api/courses')
      .set({ authorization: `Bearer ${adminToken}` })
      .send({
        name: 'Name',
        description: 'Description',
        time: 'Time',
        professor: 'Professor',
        selectionProcessId,
        duration: '6 meses',
      });
    const responseWithoutDescription = await request(app)
      .post('/api/courses')
      .set({ authorization: `Bearer ${adminToken}` })
      .send({
        name: 'Name',
        category: 'Category',
        time: 'Time',
        professor: 'Professor',
        selectionProcessId,
        duration: '6 meses',
      });
    const responseWithoutTime = await request(app)
      .post('/api/courses')
      .set({ authorization: `Bearer ${adminToken}` })
      .send({
        name: 'Name',
        category: 'Category',
        description: 'Description',
        professor: 'Professor',
        selectionProcessId,
        duration: '6 meses',
      });
    const responseWithoutProfessor = await request(app)
      .post('/api/courses')
      .set({ authorization: `Bearer ${adminToken}` })
      .send({
        name: 'Name',
        category: 'Category',
        description: 'Description',
        time: 'Time',
        selectionProcessId,
        duration: '6 meses',
      });
    const responseWithoutSelectionProcessId = await request(app)
      .post('/api/courses')
      .set({ authorization: `Bearer ${adminToken}` })
      .send({
        name: 'Name',
        category: 'Category',
        description: 'Description',
        time: 'Time',
        professor: 'Professor',
        duration: '6 meses',
      });

    expect(responseWithoutName.body.message).toBe(
      'Something wrong with the request.'
    );
    expect(responseWithoutName.status).toBe(400);
    expect(responseWithoutCategory.body.message).toBe(
      'Something wrong with the request.'
    );
    expect(responseWithoutCategory.status).toBe(400);
    expect(responseWithoutDescription.body.message).toBe(
      'Something wrong with the request.'
    );
    expect(responseWithoutDescription.status).toBe(400);
    expect(responseWithoutTime.body.message).toBe(
      'Something wrong with the request.'
    );
    expect(responseWithoutTime.status).toBe(400);
    expect(responseWithoutProfessor.body.message).toBe(
      'Something wrong with the request.'
    );
    expect(responseWithoutProfessor.status).toBe(400);
    expect(responseWithoutSelectionProcessId.body.message).toBe(
      'Something wrong with the request.'
    );
    expect(responseWithoutSelectionProcessId.status).toBe(400);
  });

  it('Should return 401 UNAUTHORIZED if the token sent is invalid', async () => {
    const response = await request(app)
      .post('/api/courses')
      .set({
        authorization: 'invalid_token',
      })
      .send({
        name: 'Name',
        category: 'Category',
        description: 'Description',
        time: 'Time',
        professor: 'Professor',
        selectionProcessId,
        duration: '6 meses',
      });

    expect(response.status).toBe(401);
  });
});
