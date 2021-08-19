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
let connection: Connection;
const futureDate = new Date();
futureDate.setFullYear(futureDate.getFullYear() + 1);
const pastDate = new Date();
pastDate.setFullYear(pastDate.getFullYear() - 1);

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
  });

  it('Should be possible to create a selection process.', async () => {
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

    expect(response.status).toBe(201);
    expect(response.body.message).toBe(
      'Selection process successfully created.'
    );
    expect(response.body).toHaveProperty('selectionProcess');
  });

  it('Should not be possible to create a selection process if the user is not an admin.', async () => {
    const response = await request(app)
      .post('/api/selection-process')
      .set({ authorization: `Bearer ${nonAdminToken}` })
      .send({
        name: 'Selection Process Name',
        startDate: pastDate.toJSON(),
        endDate: futureDate.toJSON(),
        editalLink: 'link edital',
        manualLink: 'link manual',
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(
      'You are not authorized to access this route'
    );
  });

  it('Should return 400 BAD REQUEST if any information is missing from the request.', async () => {
    const responseWithoutName = await request(app)
      .post('/api/selection-process')
      .set({ authorization: `Bearer ${adminToken}` })
      .send({
        startDate: pastDate.toJSON(),
        endDate: futureDate.toJSON(),
        editalLink: 'link edital',
        manualLink: 'link manual',
      });
    const responseWithoutStartDate = await request(app)
      .post('/api/selection-process')
      .set({ authorization: `Bearer ${adminToken}` })
      .send({
        name: 'Selection Process Name',
        endDate: futureDate.toJSON(),
        editalLink: 'link edital',
        manualLink: 'link manual',
      });
    const responseWithoutEndDate = await request(app)
      .post('/api/selection-process')
      .set({ authorization: `Bearer ${adminToken}` })
      .send({
        name: 'Selection Process Name',
        startDate: pastDate.toJSON(),
        editalLink: 'link edital',
        manualLink: 'link manual',
      });

    expect(responseWithoutName.status).toBe(400);
    expect(responseWithoutName.body.message).toBe(
      'Something wrong with the request.'
    );
    expect(responseWithoutStartDate.status).toBe(400);
    expect(responseWithoutStartDate.body.message).toBe(
      'Something wrong with the request.'
    );
    expect(responseWithoutEndDate.status).toBe(400);
    expect(responseWithoutEndDate.body.message).toBe(
      'Something wrong with the request.'
    );
  });

  it('Should return 400 BAD REQUEST if one of the dates is in the wrong format.', async () => {
    const responseStartDateError = await request(app)
      .post('/api/selection-process')
      .set({ authorization: `Bearer ${adminToken}` })
      .send({
        name: 'Selection Process Name',
        startDate: '2020-03-17',
        endDate: futureDate.toJSON(),
        editalLink: 'link edital',
        manualLink: 'link manual',
      });
    const responseEndDateError = await request(app)
      .post('/api/selection-process')
      .set({ authorization: `Bearer ${adminToken}` })
      .send({
        name: 'Selection Process Name',
        startDate: pastDate.toJSON(),
        endDate: '123456789',
        editalLink: 'link edital',
        manualLink: 'link manual',
      });

    expect(responseStartDateError.status).toBe(400);
    expect(responseStartDateError.body.message).toBe('Invalid Date.');
    expect(responseEndDateError.status).toBe(400);
    expect(responseEndDateError.body.message).toBe('Invalid Date.');
  });

  it('endDate must be greater than startDate.', async () => {
    const response = await request(app)
      .post('/api/selection-process')
      .set({ authorization: `Bearer ${adminToken}` })
      .send({
        name: 'Selection Process Name',
        startDate: futureDate.toJSON(),
        endDate: pastDate.toJSON(),
        editalLink: 'link edital',
        manualLink: 'link manual',
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      'endDate must be greater than startDate.'
    );
  });

  it('Should return 401 UNAUTHORIZED if the token sent is invalid', async () => {
    const response = await request(app)
      .post('/api/selection-process')
      .set({
        authorization: 'invalid_token',
      })
      .send({
        name: 'Selection Process Name',
        startDate: futureDate.toJSON(),
        endDate: pastDate.toJSON(),
        editalLink: 'link edital',
        manualLink: 'link manual',
      });

    expect(response.status).toBe(401);
  });
});
