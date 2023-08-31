import setupAwsMocks, { AwsMocks } from '../../utils/tests/aws/setup-aws-mocks';
import createVideoTrimmingJob from './create-video-trimming-job';

describe('create video trimming job', () => {
  let awsMocks: AwsMocks;

  beforeEach(() => {
    jest.clearAllMocks();
    awsMocks = setupAwsMocks();
  });

  it('does not throw', () => {
    expect(
      createVideoTrimmingJob({
        sourceFilePath:
          's3://eos-founders-editonthespot-com/projects/d1r0l6-meeting-with-amit-2022-05-04-01-36/processed/original/master-footage.mp4',
        outputFilePath:
          's3://eos-founders-editonthespot-com/projects/d1r0l6-meeting-with-amit-2022-05-04-01-36/processed/top-and-tail/footage.mp4',
        timing: { start: 3.5, end: 160 },
        introFilePath: 's3://eos-founders-editonthespot-com/assets/opener.png',
        outroFilePath: 's3://eos-founders-editonthespot-com/assets/end-screen.mp4',
      }),
    ).resolves.not.toThrow();
  });

  it('does not throw even there are no intro/outro file', () => {
    expect(
      createVideoTrimmingJob({
        sourceFilePath:
          's3://eos-founders-editonthespot-com/projects/d1r0l6-meeting-with-amit-2022-05-04-01-36/processed/original/master-footage.mp4',
        outputFilePath:
          's3://eos-founders-editonthespot-com/projects/d1r0l6-meeting-with-amit-2022-05-04-01-36/processed/top-and-tail/footage.mp4',
        timing: { start: 3.5, end: 160 },
      }),
    ).resolves.not.toThrow();
  });

  [
    {
      sourceFilePath: 's3://eos-test/projects/proj1/processed/original/master-footage.mp4',
      outputFilePath: 's3://eos-test/projects/proj1/processed/top-and-tail/footage.mp4',
      timing: { start: 1, end: 4 },
      introFilePath: 's3://eos-test/assets/intro.mp4',
      outroFilePath: 's3://eos-test/assets/outro.png',
      introType: 'video',
      outroType: 'image',
      enhanceVideo: true,
    },
    {
      sourceFilePath: 's3://eos-test/projects/proj1/processed/original/master-footage.mp4',
      outputFilePath: 's3://eos-test/projects/proj1/processed/top-and-tail/footage.mp4',
      timing: { start: 5, end: 7 },
      introFilePath: 's3://eos-test/assets/intro.png',
      outroFilePath: 's3://eos-test/assets/outro.mp4',
      introType: 'image',
      outroType: 'video',
      enhanceVideo: true,
    },
  ].forEach((params) => {
    it('passes correct titles for image and video intro/outro', () => {
      createVideoTrimmingJob(params);

      const taskParams = awsMocks.ecs.tasksParams.pop();
      expect(taskParams).toEqual(
        expect.objectContaining({
          cluster: 'fargate-clu',
          taskDefinition: 'top-and-tail',
          launchType: 'FARGATE',
          overrides: {
            containerOverrides: [
              {
                name: 'top-and-tail',
                command: [
                  '--video-input',
                  params.sourceFilePath,
                  '--start-timestamp',
                  String(params.timing.start),
                  '--end-timestamp',
                  String(params.timing.end),
                  '--video-output',
                  params.outputFilePath,
                  `--intro-${params.introType}`,
                  params.introFilePath,
                  `--outro-${params.outroType}`,
                  params.outroFilePath,
                  '--enhance-video',
                ],
              },
            ],
          },
        }),
      );
    });
  });
});
