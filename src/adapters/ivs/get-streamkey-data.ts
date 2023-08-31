import {
  GetStreamKeyCommand,
  IvsClient,
  GetStreamKeyCommandOutput,
  StreamKey,
} from '@aws-sdk/client-ivs';

import { GET_INTERNAL_AWS_REGION } from '../../../runtime-config';
import handleAwsCallback from '../utils';

export type StreamKeyInterface = StreamKey;

export async function getStreamKeyData(arn: string): Promise<StreamKeyInterface> {
  const ivsClient = new IvsClient({ region: GET_INTERNAL_AWS_REGION() });
  const getStreamKeyCommand = new GetStreamKeyCommand({ arn });

  return await handleAwsCallback(async () => {
    const { streamKey }: GetStreamKeyCommandOutput = await ivsClient.send(getStreamKeyCommand);
    return streamKey;
  });
}
