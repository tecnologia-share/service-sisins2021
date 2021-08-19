import request from 'supertest';
import app from '../../app';
import { Connection, createConnection } from 'typeorm';
import { Participante } from '../../models/Participante';
import { UserRoles } from '../../typings/UserRoles';
import { UsuarioShare } from '../../models/UsuarioShare';
import { Inscricao } from '../../models/Inscricao';

let connection: Connection;
let adminToken: string;
const qtySubscribes = 10;
let courseId: string;
let selectionProcessId: string;
let subscribeId: string;

const createSelectionProcess = async (adminToken: string): Promise<string> => {
  const futureDate = new Date();
  futureDate.setFullYear(futureDate.getFullYear() + 1);
  const pastDate = new Date();
  pastDate.setFullYear(pastDate.getFullYear() - 1);

  const selectionProcessResponse = await request(app)
    .post('/api/selection-process')
    .set({ authorization: `Bearer ${adminToken}` })
    .send({
      name: 'Selection Process Name',
      startDate: pastDate.toJSON(),
      endDate: futureDate.toJSON(),
      manualLink: 'link manual',
      editalLink: 'link edital',
    });

  return selectionProcessResponse.body.selectionProcess.id;
};

const createCourse = async (selectionProcessId: string): Promise<string> => {
  const courseResponse = await request(app)
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

  return courseResponse.body.course.id;
};

const createManyParticipants = async (connection: Connection, qty: number) => {
  const participantsArray: Participante[] = [];
  const usersRepository = connection.getRepository(Participante);

  for (let i = 0; i < qty; i++) {
    participantsArray.push(
      usersRepository.create({
        email: `participant_${i}_@example.com`,
        senha: '$2b$10$6FD3duMwr0qUTbREF.jE7O7AidMeeZPcGRTIAUh77Ml/jbpVnUYwy',
        cidade: `participant ${i}`,
        estado: `participant ${i}`,
        cpf: `1234567891${i}`,
        nascimento: new Date(1999, 2, 27),
        nome: `city ${i}`,
        pais: `country ${i}`,
        telefone: '1234',
      })
    );
  }

  await usersRepository.save(participantsArray);
};
const createAdmin = async (connection: Connection) => {
  const usersRepository = connection.getRepository(UsuarioShare);

  const adminUser = usersRepository.create({
    email: 'admin@example.com',
    senha: '$2b$10$c9v0imXbhfVuBgLfwaYSLubxb8.gpvr4MfX1ltmEDwIdh.x3ksj.y',
    nome: 'Admin',
    role: UserRoles.admin,
    cpf: '12345678912',
    cidade: 'Capela do Alto',
    estado: 'São Paulo',
    pais: 'Brasil',
    nascimento: new Date(),
    telefone: '15997965485',
  });
  await usersRepository.save(adminUser);
};

const subscribeParticipants = async (
  courseId: string,
  tokensParticipants: Array<string>
) => {
  for (const token of tokensParticipants) {
    await request(app)
      .post('/api/subscriptions')
      .set({ authorization: `Bearer ${token}` })
      .send({
        courseId,
        reason: 'My Reason',
        videoLink: 'link',
      });
  }
};

const getTokensOfManyParcipants = async (
  qty: number
): Promise<Array<string>> => {
  const responses = [];
  for (let i = 0; i < qty; i++) {
    responses.push(
      await request(app)
        .post('/api/authenticate')
        .send({
          email: `participant_${i}_@example.com`,
          password: 'correct_password',
        })
    );
  }
  const tokens = new Array<string>();
  responses.forEach(({ body }) => {
    tokens.push(body.token);
  });

  return tokens;
};

const getTokenAdmin = async (): Promise<string> => {
  const responseAdmin = await request(app)
    .post('/api/authenticate-share')
    .send({
      email: 'admin@example.com',
      password: 'correct_password',
    });

  return responseAdmin.body.token;
};

const getSubscribeId = async (): Promise<string> => {
  const subscribeRepository = connection.getRepository(Inscricao);

  const subscribe = await subscribeRepository.find();

  return subscribe[0].id;
};

describe('Show Subscribe tests', () => {
  beforeAll(async () => {
    if (!connection) {
      connection = await createConnection();
    }
    await connection.dropDatabase();
    await connection.runMigrations();

    await createAdmin(connection);
    adminToken = await getTokenAdmin();

    selectionProcessId = await createSelectionProcess(adminToken);
    courseId = await createCourse(selectionProcessId);

    await createManyParticipants(connection, qtySubscribes);
    const arrayTokens = await getTokensOfManyParcipants(qtySubscribes);
    await subscribeParticipants(courseId, arrayTokens);
    subscribeId = await getSubscribeId();
  });
  test('should be possible get data of subscribe', async () => {
    const response = await request(app)
      .get(`/api/subscribe/${subscribeId}`)
      .set({ authorization: `Bearer ${adminToken}` });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('subscribe');
  });

  test('Should not be possible to get subscribe if the id does not exists.', async () => {
    const response = await request(app)
      .get('/api/subscribe/non-existent-id')
      .set({ authorization: `Bearer ${adminToken}` });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Subscribe not found.');
  });

  it('Should return 401 UNAUTHORIZED if the token sent is invalid', async () => {
    const response = await request(app)
      .get(`/api/subscribe/${subscribeId}`)
      .set({ authorization: `invalid_token` });

    expect(response.status).toBe(401);
  });
});
