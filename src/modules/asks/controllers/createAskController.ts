import { AsksDTO } from '@/modules/asks/dto/asksDTO';
import { AppError } from '@/shared/errors/AppError';
import { Pergunta } from '@/shared/infra/typeorm/models/Pergunta';
import { AsksTypes } from '@/shared/typings/AsksTypes';

import { NextFunction, Request, Response } from 'express';
import { getRepository } from 'typeorm';
import * as yup from 'yup';

class CreateAskController {
  async handle(request: Request, response: Response, _next: NextFunction) {
    const { type, ask, alternatives }: AsksDTO = request.body;
    const schema = yup.object().shape({
      type: yup.string().required(),
      ask: yup.string().required(),
      alternatives: yup
        .object()
        .shape({
          one: yup.string().optional(),
          two: yup.string().optional(),
          tree: yup.string().optional(),
          four: yup.string().optional(),
          five: yup.string().optional(),
        })
        .optional(),
    });

    try {
      await schema.validate(request.body);
    } catch (err) {
      return _next(new AppError('Something wrong with the request.'));
    }

    const haveAlternatives = alternatives !== undefined;
    if (type === AsksTypes.discursive) {
      if (haveAlternatives)
        return _next(
          new AppError('Question of type discursive do not have alternatives')
        );
    } else if (type === AsksTypes.alternative) {
      if (!haveAlternatives)
        return _next(
          new AppError('Question of type alternative have alternatives')
        );
    } else {
      const typeExist = Object.values(AsksTypes).includes(type);
      if (!typeExist) return _next(new AppError('Invalid type'));
    }

    const askRepository = getRepository(Pergunta);
    const question = askRepository.create({
      pergunta: ask,
      tipo: type,
      alternativa1: alternatives?.one,
      alternativa2: alternatives?.two,
      alternativa3: alternatives?.tree,
      alternativa4: alternatives?.four,
      alternativa5: alternatives?.five,
    });

    await askRepository.save(question);

    const questionCreated: AsksDTO = {
      ask: question.pergunta,
      type: question.tipo,
      alternatives: {
        one: question?.alternativa1,
        two: question?.alternativa2,
        tree: question?.alternativa3,
        four: question?.alternativa4,
        five: question?.alternativa5,
      },
    };

    return response
      .status(201)
      .json({ message: 'Question successfully created', questionCreated });
  }
}

export default CreateAskController;
