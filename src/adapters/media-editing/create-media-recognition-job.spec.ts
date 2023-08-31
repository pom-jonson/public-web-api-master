import setupAwsMocks, { AwsMocks } from '../../utils/tests/aws/setup-aws-mocks';
import createMediaRecognitionJob from './create-media-recognition-job';
import EntryLocation from '../../entities/entry-location';

describe('media editing', () => {
  let awsMocks: AwsMocks;
  beforeEach(() => {
    jest.clearAllMocks();
    awsMocks = setupAwsMocks();
  });

  it('returns correct job name, output folder uri and file name', () => {
    const sourceFilePath = 's3://bucket/original/file.mp4';
    const outputType = 'top-and-tail';
    const outputFilePath = `s3://bucket/${outputType}/edited-file.mp4`;
    const transcriptionPath = 's3://bucket/original/file.vtt';

    createMediaRecognitionJob({
      sourceFilePath,
      outputFilePath,
      transcriptionPath,
    });

    const outputFileLocation = new EntryLocation(outputFilePath);
    const timestampsFolder = EntryLocation.buildPath(
      outputFileLocation.getFolderUri(),
      'timestamps.json',
    );

    const command = [
      '--video-uri',
      sourceFilePath,
      '--transcript-uri',
      transcriptionPath,
      '--time-stamp-uri',
      timestampsFolder,
    ];
    const taskParams = awsMocks.ecs.tasksParams.pop();
    expect(taskParams).toEqual(
      expect.objectContaining({
        cluster: 'fargate-clu',
        taskDefinition: 'top-and-tail-ai',
        launchType: 'FARGATE',
        overrides: {
          containerOverrides: [
            {
              command,
              name: 'top-and-tail-ai',
            },
          ],
        },
      }),
    );
  });
});
