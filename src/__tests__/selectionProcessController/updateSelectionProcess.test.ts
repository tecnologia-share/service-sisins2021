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
let selectionProcessId: string;
const futureDate = new Date();
futureDate.setFullYear(futureDate.getFullYear() + 1);
const pastDate = new Date();
pastDate.setFullYear(pastDate.getFullYear() - 1);

const createSelectionProcess = async () => {
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

  selectionProcessId = createSelectionProcessResponse.body.selectionProcess.id;
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

  it('Should be possible to update a selection process.', async () => {
    const response = await request(app)
      .patch('/api/selection-process')
      .set({ authorization: `Bearer ${adminToken}` })
      .send({
        id: selectionProcessId,
        name: 'Selection Process Name',
        startDate: pastDate.toJSON(),
        endDate: futureDate.toJSON(),
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe(
      'Selection process successfully updated.'
    );
    expect(response.body).toHaveProperty('selectionProcess');
  });

  test('Only the admin should be able to update a selection process.', async () => {
    const response = await request(app)
      .patch('/api/selection-process')
      .set({ authorization: `Bearer ${nonAdminToken}` })
      .send({
        id: selectionProcessId,
        name: 'Selection Process Name',
        startDate: pastDate.toJSON(),
        endDate: futureDate.toJSON(),
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(
      'You are not authorized to access this route'
    );
  });

  it('Should not be possible to update a selection process that does not exist.', async () => {
    const response = await request(app)
      .patch('/api/selection-process')
      .set({ authorization: `Bearer ${adminToken}` })
      .send({
        id: 'Non-existent id',
        name: 'Selection Process Name',
        startDate: pastDate.toJSON(),
        endDate: futureDate.toJSON(),
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Selection Process not found.');
  });

  it('Should not be possible to update with an invalid date format.', async () => {
    const response1 = await request(app)
      .patch('/api/selection-process')
      .set({ authorization: `Bearer ${adminToken}` })
      .send({
        id: selectionProcessId,
        name: 'Selection Process Name',
        startDate: '123/a',
        endDate: futureDate.toJSON(),
      });
    const response2 = await request(app)
      .patch('/api/selection-process')
      .set({ authorization: `Bearer ${adminToken}` })
      .send({
        id: selectionProcessId,
        name: 'Selection Process Name',
        startDate: pastDate.toJSON(),
        endDate: '12/03/2020',
      });
    const response3 = await request(app)
      .patch('/api/selection-process')
      .set({ authorization: `Bearer ${adminToken}` })
      .send({
        id: selectionProcessId,
        name: 'Selection Process Name',
        endDate: '12/03/2020',
      });
    const response4 = await request(app)
      .patch('/api/selection-process')
      .set({ authorization: `Bearer ${adminToken}` })
      .send({
        id: selectionProcessId,
        name: 'Selection Process Name',
        endDate: '12/03/2020',
      });

    expect(response1.status).toBe(400);
    expect(response1.body.message).toBe('Invalid Date.');
    expect(response2.status).toBe(400);
    expect(response2.body.message).toBe('Invalid Date.');
    expect(response3.status).toBe(400);
    expect(response3.body.message).toBe('Invalid Date.');
    expect(response4.status).toBe(400);
    expect(response4.body.message).toBe('Invalid Date.');
  });

  test('Start date cannot be greater than end date.', async () => {
    const newFutureDate = new Date();
    newFutureDate.setFullYear(newFutureDate.getFullYear() + 10);
    const newPastDate = new Date();
    newPastDate.setFullYear(newPastDate.getFullYear() - 10);

    const responseStartDate = await request(app)
      .patch('/api/selection-process')
      .set({ authorization: `Bearer ${adminToken}` })
      .send({
        id: selectionProcessId,
        name: 'Selection Process Name',
        startDate: newFutureDate.toJSON(),
      });
    const responseEndDate = await request(app)
      .patch('/api/selection-process')
      .set({ authorization: `Bearer ${adminToken}` })
      .send({
        id: selectionProcessId,
        name: 'Selection Process Name',
        endDate: newPastDate.toJSON(),
      });

    expect(responseStartDate.status).toBe(400);
    expect(responseStartDate.body.message).toBe(
      'endDate must be greater than startDate.'
    );
    expect(responseEndDate.status).toBe(400);
    expect(responseEndDate.body.message).toBe(
      'endDate must be greater than startDate.'
    );
  });

  it('Should be possible to update only a few properties.', async () => {
    const responseStartDate = await request(app)
      .patch('/api/selection-process')
      .set({ authorization: `Bearer ${adminToken}` })
      .send({
        id: selectionProcessId,
        startDate: pastDate.toJSON(),
      });
    const responseEndDate = await request(app)
      .patch('/api/selection-process')
      .set({ authorization: `Bearer ${adminToken}` })
      .send({
        id: selectionProcessId,
        endDate: futureDate.toJSON(),
      });
    const responseName = await request(app)
      .patch('/api/selection-process')
      .set({ authorization: `Bearer ${adminToken}` })
      .send({
        id: selectionProcessId,
        name: 'New Selection Process Name',
      });

    expect(responseStartDate.body.message).toBe(
      'Selection process successfully updated.'
    );
    expect(responseStartDate.status).toBe(200);
    expect(responseStartDate.body.message).toBe(
      'Selection process successfully updated.'
    );
    expect(responseEndDate.status).toBe(200);
    expect(responseEndDate.body.message).toBe(
      'Selection process successfully updated.'
    );
    expect(responseName.status).toBe(200);
    expect(responseName.body.message).toBe(
      'Selection process successfully updated.'
    );
    expect(responseName.body.selectionProcess.name).toBe(
      'New Selection Process Name'
    );
  });

  it('Should return 401 UNAUTHORIZED if the token sent is invalid', async () => {
    const response = await request(app)
      .patch('/api/selection-process')
      .set({ authorization: 'invalid_token' })
      .send({
        id: selectionProcessId,
        name: 'Selection Process Name',
        startDate: pastDate.toJSON(),
        endDate: futureDate.toJSON(),
      });

    expect(response.status).toBe(401);
  });
});
