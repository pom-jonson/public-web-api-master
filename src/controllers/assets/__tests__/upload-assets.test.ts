import setupAwsMocks, { AwsMocks } from '../../../utils/tests/aws/setup-aws-mocks';
import sampleData from '../../../adapters/events/samples/sample-multiformdata-body.json';
import uploadAsset from '../upload-asset';
import listAssets from '../list-assets';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { expectStatusCodeWithStandardHeaders } from '../../../utils/tests/expect';
import listEntries from '../../../adapters/storage/list-entries';
import EntryLocation from '../../../entities/entry-location';

describe('upload assets', () => {
  let awsMock: AwsMocks;

  beforeEach(() => {
    jest.clearAllMocks();
    awsMock = setupAwsMocks();
  });

  it("doesn't upload file if the body is empty", async () => {
    awsMock.s3.add('eos-test');
    const oldList = await listEntries(
      new EntryLocation('eos-projects-dev/test-test-com/assets'),
      'file',
    );
    const result = await uploadAsset({
      ...sampleData,
      pathParameters: {
        intro: 'intro',
      },
      body: '',
    } as unknown as APIGatewayProxyEvent);

    const newList = await listEntries(
      new EntryLocation('eos-projects-dev/test-test-com/assets'),
      'file',
    );

    expectStatusCodeWithStandardHeaders(result, 500);
    expect(oldList).toStrictEqual(newList);
  });

  it('returns an empty list', async () => {
    awsMock.s3.add('eos-projects-dev');

    const list = await listEntries(
      new EntryLocation('eos-projects-dev/test-test-com/assets'),
      'file',
    );
    expect(list).toHaveLength(0);
  });

  it('uploads the file correctly', async () => {
    const result = await uploadAsset({
      ...sampleData,
      pathParameters: {
        type: 'intro',
      },
    } as unknown as APIGatewayProxyEvent);
    const newList = await listAssets({} as APIGatewayProxyEvent);
    expectStatusCodeWithStandardHeaders(result, 202);
    expectStatusCodeWithStandardHeaders(newList, 200);
    expect(JSON.parse(newList.body)).toStrictEqual({
      intro: { path: 'eos-projects-dev/test-test-com/assets/intro.png' },
      outro: { path: null },
    });
  });

  it('returns the correct result', async () => {
    const result = await uploadAsset({
      ...sampleData,
      pathParameters: {
        type: 'intro',
      },
    } as unknown as APIGatewayProxyEvent);

    expect(JSON.parse(result.body)).toStrictEqual({
      intro: { path: 'eos-projects-dev/test-test-com/assets/intro.png' },
    });
  });
});
