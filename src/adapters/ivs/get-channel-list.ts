import { IvsClient, ListChannelsCommand, ListChannelsCommandOutput } from '@aws-sdk/client-ivs';

import { GET_INTERNAL_AWS_REGION } from '../../../runtime-config';
import handleAwsCallback from '../utils';

export async function getChannelArn(id: string): Promise<string | undefined> {
  const ivsClient = new IvsClient({ region: GET_INTERNAL_AWS_REGION() });

  const listCommand = new ListChannelsCommand({
    filterByName: id,
  });

  return await handleAwsCallback(async () => {
    const channelList: ListChannelsCommandOutput = await ivsClient.send(listCommand);
    return channelList?.channels?.length != 0 ? channelList.channels[0].arn : undefined;
  });
}
