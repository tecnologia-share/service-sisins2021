import request from 'supertest';
import app from '../../app';
import { createConnection } from 'typeorm';
import { createParticipant } from '../../utils/tests';

describe('Authentication tests', () => {
  beforeAll(async () => {
    const connection = await createConnection();
    await connection.dropDatabase();
    await connection.runMigrations();

    await createParticipant(connection);
  });

  it('Should return a token if the email and password sent are correct', async () => {
    const response = await request(app).post('/api/authenticate').send({
      email: 'this_email_exists@example.com',
      password: 'correct_password',
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });

  it('Should return 401 UNAUTHORIZED if the email does not exist', async () => {
    const response = await request(app).post('/api/authenticate').send({
      email: 'user@example.com',
      password: 'password',
    });

    expect(response.status).toBe(401);
  });

  it('Should return 401 UNAUTHORIZED if the email exists, but password is incorrect', async () => {
    const response = await request(app).post('/api/authenticate').send({
      email: 'this_email_exists@example.com',
      password: 'incorrect_password',
    });

    expect(response.status).toBe(401);
  });

  it('Should return 400 BAD REQUEST if no email or password is given', async () => {
    const responseWithoutEmail = await request(app)
      .post('/api/authenticate')
      .send({
        password: 'password',
      });
    const responseWithoutPassword = await request(app)
      .post('/api/authenticate')
      .send({
        email: 'user@example.com',
      });

    expect(responseWithoutEmail.status).toBe(400);
    expect(responseWithoutPassword.status).toBe(400);
  });
});
