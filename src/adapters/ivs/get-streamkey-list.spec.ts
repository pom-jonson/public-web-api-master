import setupIvsMocks, { IVsMocks } from '../../utils/tests/aws/ivs/setup-ivs-mock';
import { getStreamKeyList } from './get-streamkey-list';
describe('Get streamkey list data', () => {
  let ivsMocks: IVsMocks;
  beforeEach(() => {
    ivsMocks = setupIvsMocks();
  });

  it('should return the correct response', async () => {
    const expectedData = {
      streamKeys: [
        {
          arn: 'test arn',
        },
      ],
    };
    ivsMocks.IvsClientMock.setData({
      [ivsMocks.listStreamKeysCommandMock.constructor.name]: expectedData,
    });
    const testData = await getStreamKeyList('test');
    expect(testData).toStrictEqual(expectedData.streamKeys);
  });
});
