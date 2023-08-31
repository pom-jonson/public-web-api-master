import { InvalidParameterError, NotFoundError } from '../../use-cases/exceptions';
import UnauthorizedError from './auth/unauthorized-error';
import handleErrors from './handle-errors';
import InvalidRequestError from './invalid-request-error';
import ValidationFailedError from './validation-failed-error';

describe('handle errors', () => {
  it(`returns status code 500 when string is thrown`, async () => {
    const str = '123';
    const result = await handleErrors(() => {
      throw str;
    });

    expect(JSON.parse(result.body)).toBe(str);
    expect(result.statusCode).toBe(500);
  });

  [
    { statusCode: 400, error: new InvalidRequestError('') },
    { statusCode: 400, error: new InvalidParameterError('') },
    { statusCode: 401, error: new UnauthorizedError('') },
    { statusCode: 404, error: new NotFoundError('') },
    { statusCode: 412, error: new ValidationFailedError('') },
    { statusCode: 500, error: new Error('') },
  ].forEach(({ statusCode, error }) => {
    it(`returns ${statusCode} status code for ${JSON.stringify(error)} error`, async () => {
      const result = await handleErrors(() => {
        throw error;
      });
      expect(result.statusCode).toBe(statusCode);
    });
  });
});
