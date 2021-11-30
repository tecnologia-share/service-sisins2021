import { NextFunction, Request, Response } from 'express';
import { getRepository } from 'typeorm';
import * as yup from 'yup';
import { AppError } from '@/shared/errors/AppError';
import { ValidDate } from '@/shared/utils/ValidDate';
import { ProcessoSeletivo } from '@/shared/infra/typeorm/models/ProcessoSeletivo';
import { UsuarioShare } from '@/shared/infra/typeorm/models/UsuarioShare';

class SelectionProcessController {
  async create(request: Request, response: Response, _next: NextFunction) {
    const { name, startDate, endDate, editalLink, manualLink } = request.body;
    const { userId } = request;

    const schema = yup.object().shape({
      name: yup.string().required(),
      startDate: yup.string().required(),
      endDate: yup.string().required(),
      editalLink: yup.string().required(),
      manualLink: yup.string().required(),
    });

    try {
      await schema.validate(request.body, { abortEarly: false });
    } catch (error) {
      return _next(new AppError('Something wrong with the request.'));
    }

    if (!ValidDate(startDate) || !ValidDate(endDate)) {
      return _next(new AppError('Invalid Date.'));
    }

    if (new Date(startDate) >= new Date(endDate)) {
      return _next(new AppError('endDate must be greater than startDate.'));
    }

    const usersRepository = getRepository(UsuarioShare);
    const user = await usersRepository.findOne(userId);

    if (!user) {
      return _next(new Error('User not found.'));
    }

    const selectionProcessRepository = getRepository(ProcessoSeletivo);
    const selectionProcess = selectionProcessRepository.create({
      nome: name,
      data_inicio: startDate,
      data_final: endDate,
      link_edital: editalLink,
      link_manual: manualLink,
    });
    await selectionProcessRepository.save(selectionProcess);

    return response.status(201).json({
      message: 'Selection process successfully created.',
      selectionProcess: {
        id: selectionProcess.id,
        startDate: selectionProcess.data_inicio,
        endDate: selectionProcess.data_final,
        name: selectionProcess.nome,
        editalLink: selectionProcess.link_edital,
        manualLink: selectionProcess.link_manual,
        created_at: selectionProcess.created_at,
      },
    });
  }

  async update(request: Request, response: Response, _next: NextFunction) {
    const { id, name, startDate, endDate, editalLink, manualLink } =
      request.body;
    const { userId } = request;

    const usersRepository = getRepository(UsuarioShare);
    const user = await usersRepository.findOne(userId);

    if (!user) {
      return _next(new Error('User not found.'));
    }

    const selectionProcessRepository = getRepository(ProcessoSeletivo);
    const selectionProcess = await selectionProcessRepository.findOne(id);

    if (!selectionProcess) {
      return _next(new AppError('Selection Process not found.', 404));
    }

    if (name) {
      selectionProcess.nome = name;
    }
    if (editalLink) {
      selectionProcess.link_edital = editalLink;
    }
    if (manualLink) {
      selectionProcess.link_manual = manualLink;
    }

    const updateOnlyStartDate = startDate && !endDate;
    const updateOnlyEndDate = !startDate && endDate;
    const updateAllDates = startDate && endDate;

    if (updateOnlyStartDate) {
      if (!ValidDate(startDate)) {
        return _next(new AppError('Invalid Date.', 400));
      }
      if (new Date(startDate) >= new Date(selectionProcess.data_final)) {
        return _next(new AppError('endDate must be greater than startDate.'));
      }

      selectionProcess.data_final = startDate;
    } else if (updateOnlyEndDate) {
      if (!ValidDate(endDate)) {
        return _next(new AppError('Invalid Date.', 400));
      }
      if (new Date(selectionProcess.data_inicio) >= new Date(endDate)) {
        return _next(new AppError('endDate must be greater than startDate.'));
      }

      selectionProcess.data_inicio = endDate;
    } else if (updateAllDates) {
      if (!ValidDate(startDate) || !ValidDate(endDate)) {
        return _next(new AppError('Invalid Date.', 400));
      }
      if (new Date(startDate) >= new Date(endDate)) {
        return _next(new AppError('endDate must be greater than startDate.'));
      }

      selectionProcess.data_inicio = startDate;
      selectionProcess.data_final = endDate;
    }

    await selectionProcessRepository.save(selectionProcess);

    return response.status(200).json({
      message: 'Selection process successfully updated.',
      selectionProcess: {
        id: selectionProcess.id,
        startDate: selectionProcess.data_inicio,
        endDate: selectionProcess.data_final,
        name: selectionProcess.nome,
        created_at: selectionProcess.created_at,
      },
    });
  }

  async delete(request: Request, response: Response, _next: NextFunction) {
    const { id } = request.body;
    const { userId } = request;

    const usersRepository = getRepository(UsuarioShare);
    const user = await usersRepository.findOne(userId);

    if (!user) {
      return _next(new Error('User not found.'));
    }

    const selectionProcessRepository = getRepository(ProcessoSeletivo);
    const selectionProcess = await selectionProcessRepository.findOne(id, {
      relations: ['cursos'],
    });

    if (!selectionProcess) {
      return _next(new AppError('Selection Process not found.', 404));
    }

    if (selectionProcess.cursos.length > 0) {
      return _next(
        new AppError(
          'It is necessary to exclude courses associated with this selection process in order to exclude it.'
        )
      );
    }

    await selectionProcessRepository.remove(selectionProcess);

    return response.status(200).json({
      message: 'Selection process successfully deleted.',
    });
  }
}

export default SelectionProcessController;
