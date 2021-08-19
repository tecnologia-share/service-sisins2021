import request from 'supertest';
import app from '../../app';
import { Connection, createConnection } from 'typeorm';
import {
  createAdmin,
  createNonAdmin,
  genTokenAdmin,
  genTokenNonAdmin,
  createCourse,
} from '../../utils/tests';

let adminToken: string;
let nonAdminToken: string;
let courseId: string;
let connection: Connection;

describe('Update Course', () => {
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
    await createCourse(adminToken);
  });

  it('Should be possible to edit a course.', async () => {
    const response = await request(app)
      .patch('/api/courses')
      .set({ authorization: `Bearer ${adminToken}` })
      .send({
        id: courseId,
        name: 'Another Name',
        category: 'Another Category',
        description: 'Another Description',
        time: 'Another Time',
        professor: 'Another Professor',
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Course successfully updated.');
    expect(response.body).toHaveProperty('course');
  });

  it('Should be possible to edit a course only if that course exists.', async () => {
    const response = await request(app)
      .patch('/api/courses')
      .set({ authorization: `Bearer ${adminToken}` })
      .send({
        id: 'Non-existent id',
        name: 'Another Name',
        category: 'Another Category',
        description: 'Another Description',
        time: 'Another Time',
        professor: 'Another Professor',
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Course not found.');
  });

  test('Only the admin can edit a course.', async () => {
    const response = await request(app)
      .patch('/api/courses')
      .set({ authorization: `Bearer ${nonAdminToken}` })
      .send({
        id: courseId,
        name: 'Name',
        category: 'Category',
        description: 'Description',
        time: 'Time',
        professor: 'Professor',
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(
      'You are not authorized to access this route'
    );
  });

  it('Should return 401 UNAUTHORIZED if the token sent is invalid', async () => {
    const response = await request(app)
      .patch('/api/courses')
      .set({ authorization: 'invalid_token' })
      .send({
        id: courseId,
        name: 'Another Name',
        category: 'Another Category',
        description: 'Another Description',
        time: 'Another Time',
        professor: 'Another Professor',
      });

    expect(response.status).toBe(401);
  });
});
