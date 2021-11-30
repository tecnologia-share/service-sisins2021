import { AsksDTO } from '@/modules/asks/dto/asksDTO';
import { Pergunta } from '@/shared/infra/typeorm/models/Pergunta';

import { NextFunction, Request, Response } from 'express';
import { getRepository } from 'typeorm';

class ShowAsksController {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async handle(request: Request, response: Response, _next: NextFunction) {
    const asksRepository = getRepository(Pergunta);
    const asks = await asksRepository.find();

    const asksFormat = asks.map((item): AsksDTO => {
      const obj: AsksDTO = {
        id: item.id,
        ask: item.pergunta,
        type: item.tipo,
        alternatives: {
          one: item.alternativa1,
          two: item.alternativa2,
          tree: item.alternativa3,
          four: item.alternativa4,
          five: item.alternativa5,
        },
      };
      const checkAlternativesIsNull = Object.values({
        ...obj.alternatives,
      }).every((i) => i === null);

      if (checkAlternativesIsNull) delete obj.alternatives;
      return obj;
    });

    return response.status(200).json({ asks: asksFormat });
  }
}

export default ShowAsksController;
