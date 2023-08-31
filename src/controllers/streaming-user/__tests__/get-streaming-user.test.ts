import setupIvsMocks from '../../../utils/tests/aws/ivs/setup-ivs-mock';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { getStreamingUserCallback } from '../get-streaming-user';
import { expectStatusCodeWithStandardHeaders } from '../../../utils/tests/expect';
import { StreamKeyEntry } from '../../../use-cases/ivs/get-stream-key';
import { GET_WEBHOOK_API_KEY } from '../../../../runtime-config';
describe('get stream keys webhook', () => {
  const id = 'test-gmail-com';
  beforeEach(() => {
    setupIvsMocks();
  });

  it('returns stream keys of the user', async () => {
    const result = await getStreamingUserCallback({
      pathParameters: { id },
      headers: { Authorization: GET_WEBHOOK_API_KEY() },
    } as unknown as APIGatewayProxyEvent);
    expectStatusCodeWithStandardHeaders(result, 200);
    const res = JSON.parse(result.body) as StreamKeyEntry[];
    expect(res).toStrictEqual({
      streamKey: 'default streamkey',
      playbackUrl: 'default test playback',
      ingestServer: 'rtmps://default test ingest point:443/app',
    });
  });
});
