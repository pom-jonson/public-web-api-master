/* eslint-disable @typescript-eslint/no-unused-vars */
import getStreamingUser from './get-streaming-user';
import { StreamKeyInterface } from '../../adapters/ivs/get-streamkey-data';

describe('get streaming user data', () => {
  it('must return the correct streaming user data', async () => {
    const channelData = {
      playbackUrl: 'testPlaybackUrl',
      ingestEndpoint: 'testIngestServer',
    };
    const streamKeyData = [{ arn: 'testStreamKeyData' }];
    const result = await getStreamingUser(
      { id: 'testEMail-gmail-com' },
      {
        getChannelArn: jest.fn(),
        getChannelData: (s: string) => {
          return Promise.resolve(channelData);
        },
        getStreamKeyList: (s: string) => {
          return Promise.resolve(streamKeyData);
        },
        getStreamKeyData: (arn: string): Promise<StreamKeyInterface> => {
          return Promise.resolve({ value: streamKeyData[0].arn });
        },
      },
    );

    expect(result).toStrictEqual({
      streamKey: streamKeyData[0].arn,
      playbackUrl: channelData.playbackUrl,
      ingestServer: channelData.ingestEndpoint,
    });
  });
});
