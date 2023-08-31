import EntryLocation from '../../entities/entry-location';
import setupAwsMocks from '../../utils/tests/aws/setup-aws-mocks';
import { expectString } from '../../utils/tests/expect';
import createTranscriptionJob from './create-transcription-job';

describe('create transcription job', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupAwsMocks();
  });

  it(`returns correct job name`, async () => {
    const location = new EntryLocation('s3://bucket/original/file.mp4');
    const output = new EntryLocation(`s3://bucket/original/file-transcription.vtt`);

    const result = await createTranscriptionJob(location, output);

    expectString(result.jobName, `transcribe-([a-z0-9]){10}`);
  });

  it(`returns correct file key`, async () => {
    const location = new EntryLocation('s3://bucket/original/file.mp4');
    const output = new EntryLocation(`s3://bucket/original/file-transcription.vtt`);

    const result = await createTranscriptionJob(location, output);

    expectString(result.fileKey, 'original/file-transcription.json');
  });
});
