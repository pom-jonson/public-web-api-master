import { CreateChannelCommand, IvsClient, CreateChannelCommandOutput } from '@aws-sdk/client-ivs';

import { GET_INTERNAL_AWS_REGION, GET_RECORDING_CONFIGURATION_ARN } from '../../../runtime-config';
import handleAwsCallback from '../utils';

export type CreateChannelOutput = CreateChannelCommandOutput;
export async function createChannel(id: string): Promise<CreateChannelOutput> {
  const ivsClient = new IvsClient({ region: GET_INTERNAL_AWS_REGION() });

  const command = new CreateChannelCommand({
    name: id,
    latencyMode: 'NORMAL',
    type: 'BASIC',
    recordingConfigurationArn: GET_RECORDING_CONFIGURATION_ARN(),
  });

  return await handleAwsCallback(async () => {
    const createChannelResponse = await ivsClient.send(command);

    return createChannelResponse;
  });
}
