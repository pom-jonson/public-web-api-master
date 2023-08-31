import { APIGatewayProxyResult } from 'aws-lambda';
import buildApiResult from './build-api-result';
import { InvalidParameterError, NotFoundError } from '../../use-cases/exceptions';
import UnauthorizedError from './auth/unauthorized-error';
import InvalidRequestError from './invalid-request-error';
import ValidationFailedError from './validation-failed-error';

export default async function handleErrors(
  callback: () => Promise<APIGatewayProxyResult>,
): Promise<APIGatewayProxyResult> {
  try {
    return await callback();
  } catch (e) {
    if (e instanceof InvalidRequestError || e instanceof InvalidParameterError) {
      return buildApiResult(400, e.message);
    }
    if (e instanceof UnauthorizedError) {
      return buildApiResult(401, e.message);
    }
    if (e instanceof NotFoundError) {
      return buildApiResult(404, e.message);
    }
    if (e instanceof ValidationFailedError) {
      return buildApiResult(412, JSON.stringify(e.validationErrors));
    }
    if (e instanceof Error) {
      return buildApiResult(500, e.message);
    }

    return buildApiResult(500, JSON.stringify(e));
  }
}
