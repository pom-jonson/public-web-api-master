import Validator from 'validatorjs';
import parser from 'lambda-multipart-parser';
import { APIGatewayProxyEvent } from 'aws-lambda';
import InvalidRequestError from './invalid-request-error';
import ValidationFailedError from './validation-failed-error';

interface BodyParams {
  body: string;
  isBase64Encoded?: boolean;
}

export interface ValidationRules {
  [attribute: string]: string;
}

function tryParse(decodedBody: string): unknown {
  try {
    return JSON.parse(decodedBody);
  } catch (e) {
    return null;
  }
}

export default async function parseBody<TPayload>(
  event: BodyParams,
  validationRules?: ValidationRules,
): Promise<TPayload> {
  let result: TPayload;
  const { body, isBase64Encoded } = event;
  const decodedBody = isBase64Encoded ? Buffer.from(body, 'base64').toString() : body;

  try {
    result = tryParse(decodedBody) as TPayload;

    if (!result) {
      result = (await parser.parse(event as APIGatewayProxyEvent)) as unknown as TPayload;
    }
  } catch (error) {
    throw new InvalidRequestError(`Unable to parse request body.`);
  }

  if (validationRules) {
    const validation = new Validator(result, validationRules);
    if (validation.fails()) {
      throw new ValidationFailedError(validation.errors);
    }
  }

  return result;
}
