import { getStreamKeyData } from '../../adapters/ivs/get-streamkey-data';
import { getChannelArn } from '../../adapters/ivs/get-channel-list';
import { getChannelData } from '../../adapters/ivs/get-channel-data';
import { getStreamKeyList } from '../../adapters/ivs/get-streamkey-list';

import getStreamKey from '../../use-cases/ivs/get-stream-key';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import executeAuthenticatedCallback from '../middleware/execute-callback';
import { normalizeString } from '../../utils';

export const getStreamKeysCallback = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> =>
  await executeAuthenticatedCallback(event, async ({ email }) => {
    const items = await getStreamKey(
      { email },
      { getChannelArn, getChannelData, getStreamKeyData, getStreamKeyList, normalizeString },
    );
    return {
      body: {
        items,
      },
      statusCode: 200,
    };
  });
