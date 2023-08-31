import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { authenticate, authenticateWebhook } from './auth/authenticate';
import Identity from './auth/identity';
import buildApiResult from './build-api-result';
import handleErrors from './handle-errors';
import parseBody, { ValidationRules } from './parse-body';
import configureAws from '../../adapters/configuration';
/* istanbul ignore file */

interface ExecutCallbackResult {
  statusCode?: number;
  body?: unknown;
  additionalHeaders?: unknown;
}

interface WarmerPayload {
  warmer: boolean;
}

export default async function executeAuthenticatedCallback<TPayload, TParameters>(
  event: APIGatewayProxyEvent,
  callback: (
    identity?: Identity,
    params?: TParameters,
    payload?: TPayload,
  ) => Promise<ExecutCallbackResult>,
  validationRules?: ValidationRules,
): Promise<APIGatewayProxyResult> {
  return await handleErrors(async () => {
    if ((event as unknown as WarmerPayload)?.warmer) {
      configureAws();

      return buildApiResult(200, 'warmed');
    }

    const identity = await authenticate(event.headers);

    const payload =
      (event.body || validationRules) &&
      (await parseBody<Promise<TPayload>>(event, validationRules));

    const params = event.pathParameters as unknown as TParameters;

    const { statusCode, body, additionalHeaders } = await callback(identity, params, payload);
    const stringifiedBody = body && body instanceof Buffer ? body : JSON.stringify(body);

    return buildApiResult(statusCode ?? 200, stringifiedBody, additionalHeaders);
  });
}

export async function executeCallback(
  callback: () => Promise<unknown>,
  successCode = 200,
): Promise<APIGatewayProxyResult> {
  return await handleErrors(async () => {
    const result = await callback();
    const body = result ? JSON.stringify(result) : undefined;
    return buildApiResult(successCode, body);
  });
}

export async function executeWebhookCallback<TPayload, TParameters>(
  event: APIGatewayProxyEvent,
  callback: (req: { params?: TParameters; payload?: TPayload }) => Promise<ExecutCallbackResult>,
  successCode = 200,
): Promise<APIGatewayProxyResult> {
  return await handleErrors(async () => {
    authenticateWebhook(event.headers);
    const payload = event.body && (await parseBody<Promise<TPayload>>(event));

    const params = event.pathParameters as unknown as TParameters;
    const { body, statusCode } = await callback({ params, payload });

    const stringifiedBody = body && body instanceof Buffer ? body : JSON.stringify(body);
    return buildApiResult(statusCode ?? successCode, stringifiedBody);
  });
}
