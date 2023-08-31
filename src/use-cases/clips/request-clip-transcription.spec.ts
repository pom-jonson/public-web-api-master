import requestClipTranscription, { Dependencies } from './request-clip-transcription';

describe('request original clip', () => {
  const sourceFilePath = 'some-bucket/some/path/file.mp4';

  const getMockDeps = (): Dependencies => ({
    createTranscriptionJob: () => Promise.resolve(''),
  });

  it('returns output file', async () => {
    // FIXME: Fix test
    // const result = await requestClipTranscription({ filePath: sourceFilePath }, getMockDeps());
    // expect(result).toContain('some-bucket/some/path/file-transcription.vtt');
  });
});
