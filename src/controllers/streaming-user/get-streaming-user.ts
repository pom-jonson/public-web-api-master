import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { executeWebhookCallback } from '../middleware/execute-callback';
import { getChannelArn } from '../../adapters/ivs/get-channel-list';
import { getChannelData } from '../../adapters/ivs/get-channel-data';
import { getStreamKeyList } from '../../adapters/ivs/get-streamkey-list';
import { getStreamKeyData } from '../../adapters/ivs/get-streamkey-data';
import getStreamingUser from '../../use-cases/ivs/get-streaming-user';

interface ParsedParams {
  id: string;
}

export const getStreamingUserCallback = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> =>
  await executeWebhookCallback<unknown, ParsedParams>(event, async ({ params }) => {
    return {
      body: await getStreamingUser(
        { id: params.id },
        {
          getChannelArn,
          getChannelData,
          getStreamKeyList,
          getStreamKeyData,
        },
      ),
      statusCode: 200,
    };
  });
