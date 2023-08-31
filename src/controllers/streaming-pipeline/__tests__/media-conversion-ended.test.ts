import setupAwsMocks, { AwsMocks } from '../../../utils/tests/aws/setup-aws-mocks';
import setupDeepgramMocks from '../../../utils/tests/deepgram/setup-deepgram-mocks';
import { expectStatusCodeWithStandardHeaders } from '../../../utils/tests/expect';
import mediaConversionEndedCallback from '../media-conversion-ended';
import sampleEvent from '../../../adapters/events/samples/media-conversion-ended-event.json';

describe('media conversion ended callback', () => {
  let awsMocks: AwsMocks;
  beforeEach(() => {
    awsMocks = setupAwsMocks();
    setupDeepgramMocks();
  });

  it(`must return empty body with 400 for unprocessable event`, async () => {
    const result = await mediaConversionEndedCallback({
      someJson: 'goes here',
    });
    expectStatusCodeWithStandardHeaders(result, 400);
  });

  it('must return destination path with 202 for Recording End event', async () => {
    awsMocks.s3.add('eos-founders-editonthespot-com', {
      Key: 'projects/recorded-on-zoom-2022-02-02-10-44/processed/original/master-footage.mp4',
    });

    const result = await mediaConversionEndedCallback(sampleEvent);

    // FIXME: Fix test
    // expectStatusCodeWithStandardHeaders(result, 202);
    // expect(result.body).toBe(
    //   '"s3://eos-founders-editonthespot-com/projects/recorded-on-zoom-2022-02-02-10-44/processed/original/master-footage-transcription.vtt"',
    // );
  });
});
