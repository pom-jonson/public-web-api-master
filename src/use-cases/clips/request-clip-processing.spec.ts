import requestClipProcessing, { Dependencies } from './request-clip-processing';

describe('request clip processing', () => {
  const getMockDeps = (params?: Partial<{ outputPath?: string }>): Dependencies => ({
    createProcessingJob: () => Promise.resolve(params?.outputPath),
  });

  it('returns output folder uri', async () => {
    const outputType = 'top-and-tail';
    const outputPath = `bucket/${outputType}/edited-footage.mp4`;
    const result = await requestClipProcessing(
      { sourceFilePath: `bucket/folder/file.mp4`, outputType },
      getMockDeps({ outputPath }),
    );
    expect(result).toContain(outputPath);
  });
});
