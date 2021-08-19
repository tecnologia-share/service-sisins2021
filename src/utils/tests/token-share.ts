import request from 'supertest';
import app from '../../app';

export const genTokenAdmin = async () => {
  const responseAdmin = await request(app)
    .post('/api/authenticate-share')
    .send({
      email: 'admin@example.com',
      password: 'correct_password',
    });

  return responseAdmin.body.token;
};

export const genTokenNonAdmin = async () => {
  const responseNonAdmin = await request(app)
    .post('/api/authenticate-share')
    .send({
      email: 'non_admin@example.com',
      password: 'correct_password',
    });

  return responseNonAdmin.body.token;
};
