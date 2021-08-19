import request from 'supertest';
import app from '../../app';
import { Connection, createConnection } from 'typeorm';
import { UsuarioShare } from '../../models/UsuarioShare';
import { UserRoles } from '../../typings/UserRoles';

let adminToken: string;
let connection: Connection;
let courseId: string;
let courseWithoutExamId: string;

const populateDatabase = async (connection: Connection) => {
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

const getTokens = async () => {
  const responseAdmin = await request(app)
    .post('/api/authenticate-share')
    .send({
      email: 'admin@example.com',
      password: 'correct_password',
    });

  adminToken = responseAdmin.body.token;
};

const createCourse = async () => {
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

  const selectionProcessId = selectionProcessResponse.body.selectionProcess.id;

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

  courseId = courseResponse.body.course.id;

  const courseWithoutExamResponse = await request(app)
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

  courseWithoutExamId = courseWithoutExamResponse.body.course.id;

  await request(app)
    .post('/api/exams')
    .set({ authorization: `Bearer ${adminToken}` })
    .send({
      courseId,
      questions: [
        {
          question: 'Correct Alternative is the 2.',
          image: 'Image Path',
          alternative1: 'Alternative 1',
          alternative2: 'Alternative 2',
          alternative3: 'Alternative 3',
          alternative4: 'Alternative 4',
          alternative5: 'Alternative 5',
          correctAlternative: 2,
          points: 10,
        },
        {
          question: 'Correct Alternative is the 3.',
          image: 'Image Path',
          alternative1: 'Alternative 1',
          alternative2: 'Alternative 2',
          alternative3: 'Alternative 3',
          alternative4: 'Alternative 4',
          alternative5: 'Alternative 5',
          correctAlternative: 3,
          points: 10,
        },
      ],
    });
};

describe('Show Course Exams tests', () => {
  beforeAll(async () => {
    if (!connection) {
      connection = await createConnection();
    }
    await connection.dropDatabase();
    await connection.runMigrations();

    await populateDatabase(connection);
    await getTokens();
    await createCourse();
  });

  it('Should be possible to get an exam from a course.', async () => {
    const response = await request(app).get(`/api/courses/${courseId}/exam`);

    expect(response.status).toBe(200);
    expect(response.body.exam).toHaveProperty('questions');
    expect(response.body.exam.questions).toHaveLength(2);
  });

  it('Should not be possible to get an exam if the course does not exists.', async () => {
    const response = await request(app).get(
      '/api/courses/non-existent-id/exam'
    );

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Course not found.');
  });

  it('Should not be possible to get an exam if the course has no exams.', async () => {
    const response = await request(app).get(
      `/api/courses/${courseWithoutExamId}/exam`
    );

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('This course has no exam.');
  });
});
