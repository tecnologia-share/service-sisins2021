/* eslint-disable @typescript-eslint/no-explicit-any */
import request from 'supertest';
import app from '@/shared/infra/http/app';
import { Connection, createConnection } from 'typeorm';
import jwt from 'jsonwebtoken';
import { auth, env } from '@/config/env';
import { Participante } from '@/shared/infra/typeorm/models/Participante';
import { Pergunta } from '@/shared/infra/typeorm/models/Pergunta';
import { AsksTypes } from '@/shared/typings/AsksTypes';

const mockSendEmail = jest.fn();

jest.mock('@/shared/providers/SendMailProvider.ts', () => ({
  execute: () => mockSendEmail(),
}));

let token = '';
let connection: Connection;
let ask1Id: string;
let ask2Id: string;
let ask3Id: string;
let ask4Id: string;
let askNotExist: string;
let participantNotExist_id: string;
let token_emailConfirmed: string;
let token_emailUnconfirmed: string;
let token_idNotExist: string;
let participantUnconfirmedEmail_id: string;

const populateDatabase = async (connection: Connection) => {
  const participantRepository = connection.getRepository(Participante);
  const participant = participantRepository.create({
    email: 'this_email_exists@example.com',
    senha: '$2b$10$rwhECm2LRuac984QNLQQe..IufU1TC7pnsyERv1WxvbXzBI6stAQi',
    cidade: 'Test',
    estado: 'Test',
    nascimento: new Date(1999, 2, 27),
    cpf: '12345678912',
    nome: 'Test',
    pais: 'Test',
    telefone: '1234',
  });
  await participantRepository.save(participant);

  const participant_unconfirmed_email = participantRepository.create({
    email: 'inactive',
    senha: '$2b$10$rwhECm2LRuac984QNLQQe..IufU1TC7pnsyERv1WxvbXzBI6stAQi',
    cidade: 'Test',
    estado: 'Test',
    nascimento: new Date(1999, 2, 27),
    cpf: '12345678912',
    nome: 'Test',
    pais: 'Test',
    telefone: '1234',
  });
  await participantRepository.save(participant_unconfirmed_email);

  const asksRepository = connection.getRepository(Pergunta);
  const asks1 = asksRepository.create({
    pergunta: 'Aks one',
    tipo: AsksTypes.alternative,
    alternativa1: 'Alternative 1',
    alternativa2: 'Alternative 2',
    alternativa3: 'Alternative 3',
    alternativa4: 'Alternative 4',
    alternativa5: 'Alternative 5',
  });
  await asksRepository.save(asks1);

  const asks2 = asksRepository.create({
    pergunta: 'Aks two',
    tipo: AsksTypes.alternative,
    alternativa1: 'Alternative 1',
    alternativa2: 'Alternative 2',
    alternativa3: 'Alternative 3',
    alternativa4: 'Alternative 4',
    alternativa5: 'Alternative 5',
  });
  await asksRepository.save(asks2);

  const asks3 = asksRepository.create({
    pergunta: 'Ask tree',
    tipo: AsksTypes.alternative,
    alternativa1: 'Alternative 1',
    alternativa2: 'Alternative 2',
    alternativa3: 'Alternative 3',
    alternativa4: 'Alternative 4',
    alternativa5: 'Alternative 5',
  });
  await asksRepository.save(asks3);

  const asks4 = asksRepository.create({
    pergunta: 'Ask four',
    tipo: AsksTypes.alternative,
    alternativa1: 'Alternative 1',
    alternativa2: 'Alternative 2',
    alternativa3: 'Alternative 3',
    alternativa4: 'Alternative 4',
    alternativa5: 'Alternative 5',
  });
  await asksRepository.save(asks4);

  ask1Id = asks1.id;
  ask2Id = asks2.id;
  ask3Id = asks3.id;
  ask4Id = asks4.id;
  askNotExist = 'id_does_not_exist';
  participantNotExist_id = 'id_does_not_exist';
  participantUnconfirmedEmail_id = participant_unconfirmed_email.id;
};

const getToken = async () => {
  const response = await request(app).post('/api/authenticate').send({
    email: 'this_email_exists@example.com',
    password: 'correct_password',
  });
  token = response.body.token;
};

const getToken_emailConfirmed = async () => {
  token_emailConfirmed = jwt.sign(
    {
      email: 'this_email_exists@example.com',
      id: participantUnconfirmedEmail_id,
    },
    auth.jwtSecret as string,
    { expiresIn: '5h' }
  );
};
const getToken_emailUnconfirmed = async () => {
  token_emailUnconfirmed = jwt.sign(
    {
      email: 'email_unconfirmed@example.com',
      id: participantUnconfirmedEmail_id,
    },
    auth.jwtSecret as string,
    { expiresIn: '5h' }
  );
};
const getToken_idNotExist = async () => {
  token_idNotExist = jwt.sign(
    {
      email: 'emailNotExist@example.com',
      id: participantNotExist_id,
    },
    auth.jwtSecret as string,
    { expiresIn: '5h' }
  );
};

describe('Create a new Participant and to send email', () => {
  beforeAll(async () => {
    if (!connection) {
      connection = await createConnection();
    }
    await connection.dropDatabase();
    await connection.runMigrations();

    await populateDatabase(connection);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('The creation of the new personal account should be successful, if to send asks that exist.', async () => {
    const response = await request(app)
      .post('/api/register/')
      .send({
        name: 'new nome',
        email: 'newemail@example.com',
        password: 'new senha',
        cpf: '12345678912',
        phone: '1234',
        birth_date: new Date(2021, 3, 14),
        country: 'new pais',
        state: 'new estado',
        city: 'new cidade',
        asksAnswers: [
          {
            asksId: ask1Id,
            response: 1,
          },
          {
            asksId: ask2Id,
            response: 1,
          },
          {
            asksId: ask3Id,
            response: 1,
          },
          {
            asksId: ask4Id,
            response: 1,
          },
        ],
      });

    expect(response.status).toBe(201);
    expect(mockSendEmail.mock.calls.length).toBe(1);
  });

  it('Should not be possible to create an account if email already exist', async () => {
    const responseEmailAlreadyExit = await request(app)
      .post('/api/register/')
      .send({
        name: 'new nome',
        email: 'this_email_exists@example.com',
        password: 'new senha',
        phone: '1234',
        cpf: '12345678912',
        birth_date: new Date(2021, 3, 14),
        country: 'new pais',
        state: 'new estado',
        city: 'new cidade',
        asksAnswers: [
          {
            asksId: ask1Id,
            response: 1,
          },
          {
            asksId: ask2Id,
            response: 1,
          },
          {
            asksId: ask3Id,
            response: 1,
          },
          {
            asksId: ask4Id,
            response: 1,
          },
        ],
      });

    expect(responseEmailAlreadyExit.status).toBe(400);
  });

  it('It should not be possible to create an account if you do not submit all asks', async () => {
    const responseNotSubmitAllAsks = await request(app)
      .post('/api/register/')
      .send({
        name: 'new nome',
        email: 'newemail2@example.com',
        password: 'new senha',
        phone: '1234',
        cpf: '12345678912',
        birth_date: new Date(2021, 3, 14),
        country: 'new pais',
        state: 'new estado',
        city: 'new cidade',
        asksAnswers: [
          {
            asksId: ask1Id,
            response: 1,
          },
          {
            asksId: ask2Id,
            response: 1,
          },
          {
            asksId: ask3Id,
            response: 1,
          },
        ],
      });
    expect(responseNotSubmitAllAsks.status).toBe(400);
  });

  it('Should not be possible to create an account with asks that dont exist', async () => {
    const responseWithAsksNotExist = await request(app)
      .post('/api/register/')
      .send({
        name: 'new nome',
        email: 'newemail2@example.com',
        password: 'new senha',
        phone: '1234',
        cpf: '12345678912',
        birth_date: new Date(2021, 3, 14),
        country: 'new pais',
        state: 'new estado',
        city: 'new cidade',
        asksAnswers: [
          {
            asksId: askNotExist,
            response: 1,
          },
          {
            asksId: askNotExist,
            response: 1,
          },
          {
            asksId: askNotExist,
            response: 1,
          },
          {
            asksId: askNotExist,
            response: 1,
          },
        ],
      });

    expect(responseWithAsksNotExist.status).toBe(400);
  });

  it('It should not be possible to create an account if you do not send answers to all asks', async () => {
    const responseWithFewAnswers = await request(app)
      .post('/api/register/')
      .send({
        name: 'new nome',
        email: 'newemail2@example.com',
        password: 'new senha',
        phone: '1234',
        birth_date: new Date(2021, 3, 14),
        country: 'new pais',
        cpf: '12345678912',
        state: 'new estado',
        city: 'new cidade',
        asksAnswers: [
          {
            asksId: ask1Id,
            response: 1,
          },
          {
            asksId: ask2Id,
            response: 1,
          },
          {
            asksId: ask3Id,
            response: 1,
          },
          {
            asksId: ask4Id,
          },
        ],
      });

    expect(responseWithFewAnswers.status).toBe(400);
  });
});

describe('Verify email and finishes creating the participant', () => {
  beforeAll(async () => {
    if (!connection) {
      connection = await createConnection();
    }
    await connection.dropDatabase();
    await connection.runMigrations();

    await populateDatabase(connection);
    await getToken_emailConfirmed();
    await getToken_emailUnconfirmed();
    await getToken_idNotExist();
  });

  it('Should verify the email successfully if sent the token correctly', async () => {
    const response = await request(app).get(
      `/api/register/verify-email/${token_emailUnconfirmed}`
    );

    expect(response.status).toBe(302);
  });

  it('Should return 400 BAD REQUEST if sent a email that has already been confirmed', async () => {
    const responseEmailAlreadyConfirmed = await request(app).get(
      `/api/register/verify-email/${token_emailConfirmed}`
    );

    /** @TODO adicionar redirect para a tela de login */
    expect(responseEmailAlreadyConfirmed.status).toBe(400);
  });

  it('Should return 401 UNAUTHORIZED if sent the token incorrect', async () => {
    const responseTokenIncorrect = await request(app).get(
      `/api/register/verify-email/token_incorrect`
    );

    expect(responseTokenIncorrect.status).toBe(401);
  });

  it('Should return 404 NOT FOUND if a participant does not exist', async () => {
    const responseParticipantNotExist = await request(app).get(
      `/api/register/verify-email/${token_idNotExist}`
    );

    expect(responseParticipantNotExist.status).toBe(404);
  });
});

describe('Participant update email', () => {
  beforeAll(async () => {
    if (!connection) {
      connection = await createConnection();
    }
    await connection.dropDatabase();
    await connection.runMigrations();

    await populateDatabase(connection);
    await getToken();
  });

  // Participant update email › Should update the email successfully if the correct password and valid token are sent
  it('Should update the email successfully if the correct password and valid token are sent', async () => {
    const response = await request(app)
      .patch('/api/participants/update-email')
      .set({ authorization: `Bearer ${token}` })
      .send({
        email: 'another_email@example.com',
        password: 'correct_password',
      });

    expect(response.status).toBe(200);
  });

  it('Should return 400 BAD REQUEST if the password or email is not sent', async () => {
    const responseWithoutPassword = await request(app)
      .patch('/api/participants/update-email')
      .set({ authorization: `Bearer ${token}` })
      .send({
        email: 'another_email@example.com',
      });
    const responseWithoutEmail = await request(app)
      .patch('/api/participants/update-email')
      .set({ authorization: `Bearer ${token}` })
      .send({
        password: 'correct_password',
      });

    expect(responseWithoutPassword.status).toBe(400);
    expect(responseWithoutEmail.status).toBe(400);
  });

  it('Should return 401 UNAUTHORIZED if the password or token sent is invalid', async () => {
    const responseWithInvalidPassword = await request(app)
      .patch('/api/participants/update-email')
      .set({ authorization: `Bearer ${token}` })
      .send({
        email: 'another_email@example.com',
        password: 'incorrect_password',
      });
    const responseWithInvalidToken = await request(app)
      .patch('/api/participants/update-email')
      .set({ authorization: 'invalid_token' })
      .send({
        email: 'another_email@example.com',
        password: 'correct_password',
      });

    expect(responseWithInvalidPassword.status).toBe(401);
    expect(responseWithInvalidToken.status).toBe(401);
  });
});

describe('Participant update password', () => {
  beforeAll(async () => {
    if (!connection) {
      connection = await createConnection();
    }
    await connection.dropDatabase();
    await connection.runMigrations();

    await populateDatabase(connection);
    await getToken();
  });

  it('Should return 400 BAD REQUEST if the currentPassword or newPassword is not sent', async () => {
    const responseWithoutCurrentPassword = await request(app)
      .patch('/api/participants/update-password')
      .set({ authorization: `Bearer ${token}` })
      .send({
        newPassword: 'new_password',
      });
    const responseWithoutNewPassword = await request(app)
      .patch('/api/participants/update-password')
      .set({ authorization: `Bearer ${token}` })
      .send({
        currentPassword: 'correct_password',
      });

    expect(responseWithoutCurrentPassword.status).toBe(400);
    expect(responseWithoutNewPassword.status).toBe(400);
  });

  it('Should return 401 UNAUTHORIZED if the password or token sent is invalid', async () => {
    const responseWithInvalidPassword = await request(app)
      .patch('/api/participants/update-password')
      .set({ authorization: `Bearer ${token}` })
      .send({
        currentPassword: 'incorrect_password',
        newPassword: 'new_password',
      });
    const responseWithInvalidToken = await request(app)
      .patch('/api/participants/update-password')
      .set({ authorization: 'invalid_token' })
      .send({
        currentPassword: 'correct_password',
        newPassword: 'new_password',
      });

    expect(responseWithInvalidPassword.status).toBe(401);
    expect(responseWithInvalidToken.status).toBe(401);
  });

  it('Should update the password successfully if the correct password and valid token are sent', async () => {
    const response = await request(app)
      .patch('/api/participants/update-password')
      .set({ authorization: `Bearer ${token}` })
      .send({
        currentPassword: 'correct_password',
        newPassword: 'new_password',
      });

    expect(response.status).toBe(200);
  });
});

describe('Participant update personal data', () => {
  beforeAll(async () => {
    if (!connection) {
      connection = await createConnection();
    }
    await connection.dropDatabase();
    await connection.runMigrations();

    await populateDatabase(connection);
    await getToken();
  });

  it('Should successfully update personal data if an valid token are sent', async () => {
    const responseWithAllUpdates = await request(app)
      .patch('/api/participants')
      .set({ authorization: `Bearer ${token}` })
      .send({
        nome: 'new nome',
        telefone: '1234',
        nascimento: new Date(2021, 3, 14),
        pais: 'new pais',
        estado: 'new estado',
        cidade: 'new cidade',
      });

    const responseWithFewUpdates = await request(app)
      .patch('/api/participants')
      .set({ authorization: `Bearer ${token}` })
      .send({
        nome: 'new nome 2',
        cidade: 'new cidade 2',
      });

    expect(responseWithAllUpdates.status).toBe(200);
    expect(responseWithFewUpdates.status).toBe(200);
  });

  it('Should return 401 UNAUTHORIZED if the token sent is invalid', async () => {
    const response = await request(app)
      .patch('/api/participants')
      .set({ authorization: 'invalid_token' })
      .send({
        nome: 'new nome',
        telefone: '1234',
        nascimento: new Date(2021, 3, 14),
        pais: 'new pais',
        estado: 'new estado',
        cidade: 'new cidade',
      });

    expect(response.status).toBe(401);
  });
});
