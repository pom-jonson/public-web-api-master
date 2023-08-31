/* eslint-disable @typescript-eslint/no-unused-vars */
import { normalizeString } from '../../utils';
import setUpUser from './set-user';

describe('create streaming user data', () => {
  it('must return the correct streaming user id', async () => {
    const channelData = {
      playbackUrl: 'testPlaybackUrl',
      ingestEndpoint: 'testIngestServer',
    };
    const streamKeyData = [{ arn: 'testStreamKeyData' }];
    const result = await setUpUser(
      { email: 'test@gmail.com' },
      {
        normalizeString,
        getChannelArn: jest.fn(),
        putObject: jest.fn(),
        createChannel: jest.fn(),
      },
    );

    expect(result).toStrictEqual({ id: 'test-gmail-com' });
  });
});
