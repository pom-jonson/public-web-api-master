import setupIvsMocks, { IVsMocks } from '../../utils/tests/aws/ivs/setup-ivs-mock';
import { getChannelArn } from './get-channel-list';
describe('Get Channel arn', () => {
  let ivsMocks: IVsMocks;
  beforeEach(() => {
    ivsMocks = setupIvsMocks();
  });

  it('should return the correct response', async () => {
    const expectedData = {
      channels: [
        {
          arn: 'playbackUrl',
        },
      ],
    };
    ivsMocks.IvsClientMock.setData({
      [ivsMocks.listChannelsCommandMock.constructor.name]: expectedData,
    });
    const testData = await getChannelArn('test');
    expect(testData).toStrictEqual(expectedData.channels[0].arn);
  });

  it('should throw an error', () => {
    const expectedData = {
      channels: [
        {
          arn: 'playbackUrl',
        },
      ],
    };
    ivsMocks.IvsClientMock.setError({ isError: true });
    ivsMocks.IvsClientMock.setData({
      [ivsMocks.listChannelsCommandMock.constructor.name]: expectedData,
    });
    expect(getChannelArn('test')).rejects.toBeFalsy();
  });
});
