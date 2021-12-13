import { FindByUserIdAndRefreshToken } from '@/modules/participants/contracts/repositories';
import { ParticipantRefreshTokenService } from '@/modules/participants/services';
import { MockProxy, mock } from 'jest-mock-extended';
import jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');

type Payload = {
  email: string;
  sub: string;
};

describe('ParticipantsRefreshTokenService', () => {
  let findByUserIdAndRefreshToken: MockProxy<FindByUserIdAndRefreshToken>;
  let jwtMock: jest.Mocked<typeof jwt>;
  let verifyPayload: Payload;
  let sut: ParticipantRefreshTokenService;

  beforeAll(() => {
    findByUserIdAndRefreshToken = mock();
    sut = new ParticipantRefreshTokenService(findByUserIdAndRefreshToken);
    verifyPayload = { email: 'any_email', sub: 'any_user_id' };
    jwtMock = jwt as jest.Mocked<typeof jwt>;
    jwtMock.verify.mockImplementation(() => verifyPayload);
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
});
