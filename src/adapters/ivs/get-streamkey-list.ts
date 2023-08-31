import {
  IvsClient,
  ListStreamKeysCommand,
  ListStreamKeysCommandOutput,
  StreamKeySummary,
} from '@aws-sdk/client-ivs';

export type StreamKeyList = StreamKeySummary;
import { GET_INTERNAL_AWS_REGION } from '../../../runtime-config';
import handleAwsCallback from '../utils';

export async function getStreamKeyList(channelArn: string): Promise<StreamKeyList[]> {
  const ivsClient = new IvsClient({ region: GET_INTERNAL_AWS_REGION() });
  const listStreamKeyListCommand = new ListStreamKeysCommand({ channelArn });

  return await handleAwsCallback(async () => {
    const { streamKeys }: ListStreamKeysCommandOutput = await ivsClient.send(
      listStreamKeyListCommand,
    );
    return streamKeys;
  });
}
