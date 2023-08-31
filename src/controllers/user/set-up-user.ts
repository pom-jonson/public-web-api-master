import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { executeWebhookCallback } from '../middleware/execute-callback';
import { createChannel } from '../../adapters/ivs/create-channel';
import { getChannelArn } from '../../adapters/ivs/get-channel-list';
import { putObject } from '../../adapters/storage/put-object';
import { normalizeString } from '../../utils';
import setUpUser from '../../use-cases/users/set-user';
interface ParsedPayload {
  email: string;
}

export const setUpUserCallback = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> =>
  await executeWebhookCallback<ParsedPayload, unknown>(event, async ({ payload }) => {
    return {
      body: await setUpUser(
        { email: payload.email },
        { normalizeString, getChannelArn, createChannel, putObject },
      ),
      statusCode: 200,
    };
  });
