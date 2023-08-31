import { APIGatewayProxyResult } from 'aws-lambda';

/* istanbul ignore file */

export default function buildApiResult(
  statusCode: number,
  body?: string | Buffer,
  additionalHeaders: unknown = {},
): APIGatewayProxyResult {
  return {
    statusCode,
    body,
    headers: {
      ...(additionalHeaders as object),
      'Access-Control-Allow-Origin': '*',
    },
  } as APIGatewayProxyResult;
}
