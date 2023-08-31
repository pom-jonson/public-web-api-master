import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GET_API_ALLOWED_ORIGINS } from '../../runtime-config';

/* istanbul ignore file */

export const allowCorsCallback = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const origin = event.headers['origin'];
  const originAllowed = GET_API_ALLOWED_ORIGINS().split(', ').includes(origin);

  return Promise.resolve({
    statusCode: 204,
    headers: {
      'Access-Control-Allow-Origin': originAllowed ? origin : undefined,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
      'Access-Control-Allow-Headers':
        'Origin, X-Requested-With, Content-Type, Accept, Authorization, Identity',
      'Cache-Control': 'max-age=86400',
    },
  } as unknown as APIGatewayProxyResult);
};
