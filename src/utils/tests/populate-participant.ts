import { Connection } from 'typeorm';
import { Participante } from '../../models/Participante';
export const createParticipant = async (connection: Connection) => {
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
};
