import {
  CreateRefreshToken,
  DeleteRefreshTokenById,
  FindByUserIdAndRefreshToken,
} from '@/modules/participants/contracts/repositories';
import { ParticipantRefreshTokenService } from '@/modules/participants/services';
import { AppError } from '@/shared/errors/AppError';
import { MockProxy, mock } from 'jest-mock-extended';
import jwt from 'jsonwebtoken';
import dayjs from 'dayjs';
import { mocked } from 'ts-jest/utils';
import { set, reset } from 'mockdate';

jest.mock('jsonwebtoken');
jest.mock('dayjs');

type Payload = {
  email: string;
  sub: string;
};

describe('ParticipantsRefreshTokenService', () => {
  let findByUserIdAndRefreshToken: MockProxy<FindByUserIdAndRefreshToken>;
  let deleteRefreshTokenById: MockProxy<DeleteRefreshTokenById>;
  let createRefreshToken: MockProxy<CreateRefreshToken>;
  let jwtMock: jest.Mocked<typeof jwt>;
  let addSpy: jest.Mock;
  let toDateSpy: jest.Mock;
  let verifyPayload: Payload;
  let sut: ParticipantRefreshTokenService;

  beforeAll(() => {
    set(new Date());
    findByUserIdAndRefreshToken = mock();
    deleteRefreshTokenById = mock();
    createRefreshToken = mock();
    verifyPayload = { email: 'any_email', sub: 'any_user_id' };
    jwtMock = jwt as jest.Mocked<typeof jwt>;
    jwtMock.verify.mockImplementation(() => verifyPayload);
    jwtMock.sign.mockImplementation(() => 'valid_refresh_token');
    toDateSpy = jest.fn().mockReturnValue(new Date());
    addSpy = jest.fn().mockImplementation(() => ({ toDate: toDateSpy }));
    mocked(dayjs).mockImplementation(
      jest.fn().mockImplementation(() => ({ add: addSpy }))
    );
  });

  beforeEach(async () => {
    findByUserIdAndRefreshToken.find.mockResolvedValue({
      refreshTokenId: 'old_refresh_token',
    });
    deleteRefreshTokenById.delete.mockResolvedValue();
    createRefreshToken.create.mockResolvedValue();
    sut = new ParticipantRefreshTokenService(
      findByUserIdAndRefreshToken,
      deleteRefreshTokenById,
      createRefreshToken
    );
  });

  afterAll(() => {
    reset();
  });

  test('should calls FindByUserIdAndRefreshToken with correct input', async () => {
    await sut.refresh({ token: 'any_token' });
    expect(findByUserIdAndRefreshToken.find).toHaveBeenCalledWith({
      token: 'any_token',
      userId: verifyPayload.sub,
    });
  });

  test('should rethrows if FindByUserIdAndRefreshToken throws', async () => {
    const error = new Error('infra_error');
    findByUserIdAndRefreshToken.find.mockRejectedValueOnce(error);
    const promise = sut.refresh({ token: 'any_token' });
    expect(promise).rejects.toThrow(error);
  });

  test('should throws if not found refresh token', async () => {
    findByUserIdAndRefreshToken.find.mockResolvedValueOnce(undefined);
    const promise = sut.refresh({ token: 'any_token' });
    expect(promise).rejects.toBeInstanceOf(
      new AppError('Refresh Token does not exist', 404)
    );
  });

  test('should calls DeleteRefreshTokenById with correct input', async () => {
    await sut.refresh({ token: 'any_token' });
    expect(deleteRefreshTokenById.delete).toHaveBeenCalledWith({
      refreshTokenId: 'old_refresh_token',
    });
  });

  test('should calls CreateRefreshToken with correct input', async () => {
    await sut.refresh({ token: 'any_token' });
    expect(createRefreshToken.create).toHaveBeenCalledWith({
      expiresDate: new Date(),
      refreshToken: 'valid_refresh_token',
      userId: verifyPayload.sub,
    });
  });
});
