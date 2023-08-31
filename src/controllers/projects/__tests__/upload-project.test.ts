import { APIGatewayProxyEvent } from 'aws-lambda';
import setupAwsMocks, { AwsMocks } from '../../../utils/tests/aws/setup-aws-mocks';
import { expectStatusCodeWithStandardHeaders } from '../../../utils/tests/expect';
import uploadProjectCallback from '../upload-project';
import { UploadProjectResult } from '../../../use-cases/projects/get-upload-project-url';
describe('edit project', () => {
  let awsMocks: AwsMocks;
  beforeAll(() => {
    awsMocks = setupAwsMocks();
    awsMocks.s3.add('eos-test');
  });

  it('returns the presigned url for uploading', async () => {
    const result = await uploadProjectCallback({
      body: JSON.stringify({
        fileName: 'my-very-first-upload',
      }),
    } as unknown as APIGatewayProxyEvent);

    expectStatusCodeWithStandardHeaders(result, 200);
    expect(typeof (JSON.parse(result.body) as UploadProjectResult).url).toBe('string');
  });
});
