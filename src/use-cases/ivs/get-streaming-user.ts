import { ChannelData } from '../../adapters/ivs/get-channel-data';
import { StreamKeyInterface } from '../../adapters/ivs/get-streamkey-data';
import { StreamKeyList } from '../../adapters/ivs/get-streamkey-list';

interface Dependencies {
  getChannelArn(email: string): Promise<string>;
  getStreamKeyList(arn: string): Promise<StreamKeyList[]>;
  getChannelData(arn: string): Promise<ChannelData>;
  getStreamKeyData(arn: string): Promise<StreamKeyInterface>;
}

export interface GetStreamUserInput {
  id: string;
}

export interface StreamKeyEntry {
  streamKey: string;
  playbackUrl: string;
  ingestServer: string;
}

export default async function getStreamingUser(
  { id }: GetStreamUserInput,
  { getChannelArn, getChannelData, getStreamKeyData, getStreamKeyList }: Dependencies,
): Promise<StreamKeyEntry> {
  const channelArn = await getChannelArn(id);

  const channelData = await getChannelData(channelArn);

  const streamKeyList = await getStreamKeyList(channelArn);
  const streamKeyData = await getStreamKeyData(streamKeyList[0].arn);
  return {
    streamKey: streamKeyData.value,
    playbackUrl: channelData.playbackUrl,
    ingestServer: channelData.ingestEndpoint,
  };
}
