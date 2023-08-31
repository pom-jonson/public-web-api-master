import { IvsClient, GetChannelCommand, GetChannelCommandOutput } from '@aws-sdk/client-ivs';

import { GET_INTERNAL_AWS_REGION } from '../../../runtime-config';
import handleAwsCallback from '../utils';

export interface ChannelData {
  playbackUrl?: string;
  ingestEndpoint?: string;
}

export async function getChannelData(channelArn: string): Promise<ChannelData> {
  const ivsClient = new IvsClient({ region: GET_INTERNAL_AWS_REGION() });

  const getChannelCommand = new GetChannelCommand({ arn: channelArn });

  return await handleAwsCallback(async () => {
    const channelData: GetChannelCommandOutput = await ivsClient.send(getChannelCommand);

    return {
      playbackUrl: channelData.channel.playbackUrl,
      // AWS returns ingest endpoint without rtmps:// and :443/app pre/suffixes
      ingestEndpoint: `rtmps://${channelData.channel.ingestEndpoint}:443/app`,
    };
  });
}
