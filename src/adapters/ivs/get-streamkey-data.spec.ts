import setupIvsMocks, { IVsMocks } from '../../utils/tests/aws/ivs/setup-ivs-mock';
import { getStreamKeyData } from './get-streamkey-data';
describe('Get streamkey data', () => {
  let ivsMocks: IVsMocks;
  beforeEach(() => {
    ivsMocks = setupIvsMocks();
  });

  it('should return the correct response', async () => {
    const expectedData = {
      streamKey: {
        value: 'testStreamKey',
      },
    };
    ivsMocks.IvsClientMock.setData({
      [ivsMocks.getStreamKeyCommandMock.constructor.name]: expectedData,
    });
    const testData = await getStreamKeyData('test');
    expect(testData).toStrictEqual(expectedData.streamKey);
  });
});
