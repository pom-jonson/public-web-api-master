import setupIvsMocks from '../../../utils/tests/aws/ivs/setup-ivs-mock';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { getStreamKeysCallback } from '../get-stream-keys';
import { expectStatusCodeWithStandardHeaders } from '../../../utils/tests/expect';
import { StreamKeyEntry } from '../../../use-cases/ivs/get-stream-key';
describe('get stream keys', () => {
  beforeEach(() => {
    setupIvsMocks();
  });

  it('returns stream keys of the user', async () => {
    const result = await getStreamKeysCallback({} as unknown as APIGatewayProxyEvent);
    expectStatusCodeWithStandardHeaders(result, 200);

    const res = JSON.parse(result.body) as StreamKeyEntry[];
    expect(res).toStrictEqual({
      items: [
        {
          playbackUrl: 'default test playback',
          ingestServer: 'rtmps://default test ingest point:443/app',
          streamKey: 'default streamkey',
        },
      ],
    });
  });
});
