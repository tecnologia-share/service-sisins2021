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
let courseId: string;

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
      editalLink: 'link edital',
      manualLink: 'link manual',
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
};

describe('Create Exam tests', () => {
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
    await createCourse();
  });

  it('Should be possible to create an exam.', async () => {
    const response = await request(app)
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
        ],
      });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Exam successfully created.');
    expect(response.body).toHaveProperty('exam');
  });

  it('Should not be possible to create a exam if the user is not an admin.', async () => {
    const response = await request(app)
      .post('/api/exams')
      .set({ authorization: `Bearer ${nonAdminToken}` })
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
        ],
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(
      'You are not authorized to access this route'
    );
  });

  it('Should return 400 BAD REQUEST if any information is missing from the request.', async () => {
    const responseWithoutCourseId = await request(app)
      .post('/api/exams')
      .set({ authorization: `Bearer ${adminToken}` })
      .send({
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
        ],
      });
    const responseWithoutQuestions = await request(app)
      .post('/api/exams')
      .set({ authorization: `Bearer ${adminToken}` })
      .send({
        courseId,
      });
    const responseWithoutQuestionsProps = await request(app)
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
            points: 10,
          },
        ],
      });

    expect(responseWithoutCourseId.status).toBe(400);
    expect(responseWithoutCourseId.body.message).toBe(
      'Something wrong with the request.'
    );
    expect(responseWithoutQuestions.status).toBe(400);
    expect(responseWithoutQuestions.body.message).toBe(
      'Something wrong with the request.'
    );
    expect(responseWithoutQuestionsProps.status).toBe(400);
    expect(responseWithoutQuestionsProps.body.message).toBe(
      'Something wrong with the request.'
    );
  });

  it('Should not be possible to create an exam if the course does not exists.', async () => {
    const response = await request(app)
      .post('/api/exams')
      .set({ authorization: `Bearer ${adminToken}` })
      .send({
        courseId: 'Non-existent id',
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
        ],
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Course not found.');
  });

  it('Should not be possible to create an exam if the course already has an exam.', async () => {
    const response = await request(app)
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
        ],
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('This course already has an exam.');
  });

  it('Should not be possible to create an exam if the correct alternative not exists.', async () => {
    const response1 = await request(app)
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
            correctAlternative: 7,
            points: 10,
          },
        ],
      });
    const response2 = await request(app)
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
            correctAlternative: 0,
            points: 10,
          },
        ],
      });

    expect(response1.status).toBe(400);
    expect(response1.body.message).toBe('Something wrong with the request.');
    expect(response2.status).toBe(400);
    expect(response2.body.message).toBe('Something wrong with the request.');
  });

  it('Should return 401 UNAUTHORIZED if the token sent is invalid', async () => {
    const response = await request(app)
      .post('/api/exams')
      .set({
        authorization: 'invalid_token',
      })
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
        ],
      });

    expect(response.status).toBe(401);
  });
});
