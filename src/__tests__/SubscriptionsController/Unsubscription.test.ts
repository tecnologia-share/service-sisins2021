import request from 'supertest';
import app from '../../app';
import { Connection, createConnection } from 'typeorm';
import { Participante } from '../../models/Participante';
import { Curso } from '../../models/Curso';
import { ProcessoSeletivo } from '../../models/ProcessoSeletivo';
import { SubscriptionStatus } from '../../typings/SubscriptionStatus';
import { Inscricao } from '../../models/Inscricao';

let token: string;
let connection: Connection;
let courseId: string;
let courseInactiveId: string;

const populateDatabase = async (connection: Connection) => {
  const participantsRepository = connection.getRepository(Participante);
  const participant = participantsRepository.create({
    email: 'this_email_exists@example.com',
    senha: '$2b$10$c9v0imXbhfVuBgLfwaYSLubxb8.gpvr4MfX1ltmEDwIdh.x3ksj.y',
    cidade: 'Test',
    estado: 'Test',
    cpf: '12345678912',
    nascimento: new Date(1999, 2, 27),
    nome: 'Test',
    pais: 'Test',
    telefone: '1234',
  });
  await participantsRepository.save(participant);

  const futureDate = new Date();
  futureDate.setFullYear(futureDate.getFullYear() + 1);
  const pastDate = new Date();
  pastDate.setFullYear(pastDate.getFullYear() - 1);

  const selectiveProcessRepository = connection.getRepository(ProcessoSeletivo);
  const selectiveProcess = selectiveProcessRepository.create({
    data_inicio: new Date(),
    data_final: futureDate,
    nome: 'Selective Process Name',
    link_edital: 'link edital',
    link_manual: 'link manual',
  });
  await selectiveProcessRepository.save(selectiveProcess);
  const selectiveProcessInactive = selectiveProcessRepository.create({
    data_inicio: pastDate,
    data_final: pastDate,
    nome: 'Selective Process Name',
    link_edital: 'link edital',
    link_manual: 'link manual',
  });
  await selectiveProcessRepository.save(selectiveProcessInactive);

  const coursesRepository = connection.getRepository(Curso);
  const course = coursesRepository.create({
    categoria: 'Example',
    descricao: 'Description',
    horario: 'From 8h to 9h',
    nome: 'Course Name',
    professor: 'Professor Name',
    tempo_duracao: '6 meses',
    processo_seletivo_id: selectiveProcess.id,
  });
  await coursesRepository.save(course);

  const courseInactive = coursesRepository.create({
    categoria: 'Example',
    descricao: 'Description',
    horario: 'From 8h to 9h',
    nome: 'Course Name',
    professor: 'Professor Name',
    tempo_duracao: '6 meses',
    processo_seletivo_id: selectiveProcessInactive.id,
  });
  await coursesRepository.save(courseInactive);

  const subscriptionsRepository = connection.getRepository(Inscricao);
  const subscriptionInactive = subscriptionsRepository.create({
    curso_id: courseInactive.id,
    motivo: 'Some reason',
    participante_id: participant.id,
    status: SubscriptionStatus.notEvaluated,
  });
  await subscriptionsRepository.save(subscriptionInactive);

  courseId = course.id;
  courseInactiveId = courseInactive.id;
};

const getToken = async () => {
  const response = await request(app).post('/api/authenticate').send({
    email: 'this_email_exists@example.com',
    password: 'correct_password',
  });

  token = response.body.token;
};

const enrollInTheCourses = async () => {
  await request(app)
    .post('/api/subscriptions')
    .set({ authorization: `Bearer ${token}` })
    .send({
      courseId,
      reason: 'My Reason',
    });
};

describe('Unsubscriptions tests', () => {
  beforeAll(async () => {
    if (!connection) {
      connection = await createConnection();
    }
    await connection.dropDatabase();
    await connection.runMigrations();

    await populateDatabase(connection);
    await getToken();
    await enrollInTheCourses();
  });

  it('Should return 400 BAD REQUEST if the courseId is not sent.', async () => {
    const response = await request(app)
      .delete('/api/subscriptions')
      .set({ authorization: `Bearer ${token}` });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('courseId is required.');
  });

  it('Should return 400 BAD REQUEST if the participant is not enrolled in the course.', async () => {
    const response = await request(app)
      .delete('/api/subscriptions')
      .set({ authorization: `Bearer ${token}` })
      .send({ courseId: 'some-other-course-id' });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      'Participant is not enrolled in this course.'
    );
  });

  it('Should be possible to unsubscribe from a course.', async () => {
    const response = await request(app)
      .delete('/api/subscriptions')
      .set({ authorization: `Bearer ${token}` })
      .send({ courseId });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Successful unsubscription.');
  });

  it('it should not be possible to unsubscribe from a closed enrollment course.', async () => {
    const response = await request(app)
      .delete('/api/subscriptions')
      .set({ authorization: `Bearer ${token}` })
      .send({ courseId: courseInactiveId });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      'This course is not open for unsubscriptions.'
    );
  });

  it('Should return 401 UNAUTHORIZED if the token sent is invalid', async () => {
    const response = await request(app)
      .delete('/api/subscriptions')
      .set({ authorization: 'invalid_token' })
      .send({
        courseId,
      });

    expect(response.status).toBe(401);
  });
});
