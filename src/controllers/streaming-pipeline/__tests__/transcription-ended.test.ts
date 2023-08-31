import setupAwsMocks from '../../../utils/tests/aws/setup-aws-mocks';
import { expectStatusCodeWithStandardHeaders } from '../../../utils/tests/expect';
import sampleEvent from '../../../adapters/events/samples/transcription-ended-event.json';
import transcriptionEndedCallback from '../transcription-ended';

describe('media conversion ended callback', () => {
  it(`must return empty body with 400 for unprocessable event`, async () => {
    const result = await transcriptionEndedCallback({
      someJson: 'goes here',
    });
    expectStatusCodeWithStandardHeaders(result, 400);
  });

  it('must return destination path with 202 for Recording End event', async () => {
    const awsMocks = setupAwsMocks();
    awsMocks.s3.add('eos-founders-editonthespot-com', {
      Key: 'projects/recorded-on-zoom-2022-02-02-10-44/processed/original/file.mp4',
    });
    awsMocks.s3.add('eos-founders-editonthespot-com', {
      Key: 'projects/recorded-on-zoom-2022-02-02-10-44/processed/original/file.vtt',
    });
    const uri =
      's3://eos-founders-editonthespot-com/projects/recorded-on-zoom-2022-02-02-10-44/processed/original/master-footage-transcription.json';
    awsMocks.transcribeMock.addJob(sampleEvent.detail.TranscriptionJobName, uri);

    const result = await transcriptionEndedCallback(sampleEvent);
    expectStatusCodeWithStandardHeaders(result, 202);
    expect(result.body).toBe(
      '"eos-founders-editonthespot-com/projects/recorded-on-zoom-2022-02-02-10-44/processed/top-and-tail/edited-footage.mp4"',
    );
  });
});
