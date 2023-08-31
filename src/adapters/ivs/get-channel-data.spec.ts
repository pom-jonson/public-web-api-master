import setupIvsMocks, { IVsMocks } from '../../utils/tests/aws/ivs/setup-ivs-mock';
import { getChannelData } from './get-channel-data';
describe('Get Channel data', () => {
  let ivsMocks: IVsMocks;
  beforeEach(() => {
    ivsMocks = setupIvsMocks();
  });

  it('should return the correct response', async () => {
    const expectedData = {
      channel: {
        playbackUrl: 'default test playback',
        ingestEndpoint: 'rtmps://default test ingest point:443/app',
      },
    };
    const testData = await getChannelData('test');
    expect(testData).toStrictEqual(expectedData.channel);
  });
});
