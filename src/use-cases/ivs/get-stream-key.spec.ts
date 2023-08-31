/* eslint-disable @typescript-eslint/no-unused-vars */
import getStreamKey from './get-stream-key';
import { normalizeString } from '../../utils';
import { StreamKeyInterface } from '../../adapters/ivs/get-streamkey-data';

describe('get stream key', () => {
  it('must return the correctStreamKey', async () => {
    const channelData = {
      playbackUrl: 'testPlaybackUrl',
      ingestEndpoint: 'testIngestServer',
    };
    const streamKeyData = [{ arn: 'testStreamKeyData' }];
    const result = await getStreamKey(
      { email: 'testEMail@gmail.com' },
      {
        normalizeString,
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

    expect(result).toStrictEqual([
      {
        streamKey: streamKeyData[0].arn,
        playbackUrl: channelData.playbackUrl,
        ingestServer: channelData.ingestEndpoint,
      },
    ]);
  });
});
