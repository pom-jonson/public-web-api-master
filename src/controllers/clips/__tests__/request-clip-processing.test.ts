import setupAwsMocks from '../../../utils/tests/aws/setup-aws-mocks';
import setupDeepgramMocks from '../../../utils/tests/deepgram/setup-deepgram-mocks';
import { expectStatusCodeWithStandardHeaders } from '../../../utils/tests/expect';
import requestClipProcessingCallback from '../request-clip-processing';
import { APIGatewayProxyEvent } from 'aws-lambda';

describe('media conversion ended callback', () => {
  // const id = 'pw9m1a';
  const accountId = 'random-id-com';
  // let awsMocks: AwsMocks;

  beforeAll(() => {
    setupAwsMocks();
    setupDeepgramMocks();
  });

  it(`must return empty body with 400 for unprocessable body`, async () => {
    const result = await requestClipProcessingCallback({
      body: {
        sourceFilePath: `${accountId}/projects/recorded-on-zoom-2022-02-02-10-44/processed/original/file.mp4`,
      },
    } as unknown as APIGatewayProxyEvent);
    expectStatusCodeWithStandardHeaders(result, 400);
  });

  // it('must return destination path with 202', async () => {
  //   awsMocks.s3.add('eos-projects-staging', {
  //     Key: `${accountId}/projects/${id}-recorded-on-zoom-2022-02-02-10-44/processed/original/file.mp4`,
  //   });
  //   awsMocks.s3.add('eos-projects-staging', {
  //     Key: `${accountId}/projects/${id}-recorded-on-zoom-2022-02-02-10-44/processed/original/file.vtt`,
  //   });

  //   const result = await requestClipProcessingCallback({
  //     headers: { identity: 'Token random@id.com' },
  //     pathParameters: { id },
  //   } as unknown as APIGatewayProxyEvent);
  //   expectStatusCodeWithStandardHeaders(result, 202);
  //   expect(typeof result.body).toBe('string');
  // });
});
