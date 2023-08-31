import setupDeepgramMocks from '../../utils/tests/deepgram/setup-deepgram-mocks';
import setupAwsMocks from '../../utils/tests/aws/setup-aws-mocks';
import deepgramTranscribe from './transcribe';
import EntryLocation from '../../entities/entry-location';
import listEntries from '../storage/list-entries';
import { TRANSCRIPTION_FOLDER } from '../../entities/clip';
describe('deepgram transcribe', () => {
  beforeEach(() => {
    setupDeepgramMocks();
    setupAwsMocks();
  });

  it('should return the correct response', async () => {
    const input = new EntryLocation(
      `projects/zzz-recorded-on-zoom-2022-02-02-10-44/processed/original/file.mp4`,
    );
    const test = await deepgramTranscribe(
      input,
      new EntryLocation(`projects/zzz-processed-on-zoom-2005-03-03-12-54/original/output.mp4`),
    );

    const entries = await listEntries(input, 'file');

    for (const entry of entries) {
      console.log(entry.key);
      expect(entry.key.includes(`original/${TRANSCRIPTION_FOLDER}`)).toBe(true);
    }

    expect(test).toStrictEqual('s3://projects/zzz-processed-on-zoom-2005-03-03-12-54/original');
  });
});
