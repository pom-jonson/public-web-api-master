/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { APIGatewayProxyEvent } from 'aws-lambda';
import { PROJECT_INFO_FILE } from '../../../entities/project';
import { ProjectVM } from '../../../use-cases/projects/get-project';
import setupAwsMocks, { AwsMocks } from '../../../utils/tests/aws/setup-aws-mocks';
import { expectStatusCodeWithStandardHeaders } from '../../../utils/tests/expect';
import { getProjectCallback } from '../../projects/get-project';
import processTopAndTailCallback from '../process-top-and-tail';

describe('process top and tail', () => {
  let awsMocks: AwsMocks;

  const bucket = 'eos-projects-dev';
  const accountId = 'test-test-com';
  const id = 'pw9m1q';
  const bodyData = { start: 10, end: 20, enhanceVideo: true };
  const body = JSON.stringify(bodyData);
  const projectFolder = `${accountId}/projects/${id}-recorded-on-zoom-2022-02-02-10-44`;

  const projectInfoFile = `${projectFolder}/${PROJECT_INFO_FILE}`;
  const sourceFilePathPattern = `${projectFolder}/processed`;
  const sourceFileRelativePath = `${sourceFilePathPattern}/original/master-footage.mp4`;
  const sourceFilePath = `${bucket}/${sourceFileRelativePath}`;
  const outputFilePath = `${bucket}/${sourceFilePathPattern}/top-and-tail/edited-footage.mp4`;
  const introFileRelativePath = `${accountId}/assets/intro.png`;
  const outroFileRelativePath = `${accountId}/assets/outro.mp4`;
  const introFilePath = `${bucket}/${introFileRelativePath}`;
  const outroFilePath = `${bucket}/${outroFileRelativePath}`;

  const setupMocks = (addIntroOutro = true): void => {
    awsMocks = setupAwsMocks();
    awsMocks.s3.add(bucket, { Key: sourceFileRelativePath });
    if (addIntroOutro) {
      awsMocks.s3.add(bucket, { Key: introFileRelativePath });
      awsMocks.s3.add(bucket, { Key: outroFileRelativePath });
    }
    awsMocks.s3.add(bucket, {
      Key: projectInfoFile,
      Body: Buffer.from(
        JSON.stringify({
          projectName: 'Recorded On Zoom',
        }),
      ),
    });
  };

  [
    { body: undefined, resultCode: 400 },
    { body: { start: '', end: '' }, resultCode: 412 },
    { body: { start: 'some string', end: true }, resultCode: 412 },
  ].forEach(({ body, resultCode }) => {
    it('returns 4xx for invalid payload', async () => {
      setupMocks();

      const result = await processTopAndTailCallback({
        pathParameters: { id },
        body: JSON.stringify(body),
      } as unknown as APIGatewayProxyEvent);

      expectStatusCodeWithStandardHeaders(result, resultCode);
    });
  });

  it('returns output file url', async () => {
    setupMocks();

    const result = await processTopAndTailCallback({
      pathParameters: { id },
      body,
    } as unknown as APIGatewayProxyEvent);

    expectStatusCodeWithStandardHeaders(result, 202);
    expect(result.body).toBe(`"${outputFilePath}"`);
  });

  it('creates ecs task with the enhance flag disabled', async () => {
    setupMocks();

    await processTopAndTailCallback({
      pathParameters: { id },
      body: JSON.stringify({ ...bodyData, enhanceVideo: false }),
    } as unknown as APIGatewayProxyEvent);

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
                sourceFilePath,
                '--start-timestamp',
                String(bodyData.start),
                '--end-timestamp',
                String(bodyData.end),
                '--video-output',
                outputFilePath,
                '--intro-image',
                introFilePath,
                '--outro-video',
                outroFilePath,
              ],
            },
          ],
        },
      }),
    );
  });
  it('creates ecs task with the enhance flag enabled', async () => {
    setupMocks();

    await processTopAndTailCallback({
      pathParameters: { id },
      body,
    } as unknown as APIGatewayProxyEvent);

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
                sourceFilePath,
                '--start-timestamp',
                String(bodyData.start),
                '--end-timestamp',
                String(bodyData.end),
                '--video-output',
                outputFilePath,
                '--intro-image',
                introFilePath,
                '--outro-video',
                outroFilePath,
                `--enhance-video`,
              ],
            },
          ],
        },
      }),
    );
  });
  it('video edit changes status to processing', async () => {
    setupMocks();

    await processTopAndTailCallback({
      pathParameters: { id },
      body,
    } as unknown as APIGatewayProxyEvent);

    const result = await getProjectCallback({
      pathParameters: { id },
    } as unknown as APIGatewayProxyEvent);
    console.log(result.body);
    const project = JSON.parse(result.body.toString()) as ProjectVM;

    expect(project.edits).toStrictEqual([
      {
        id: 'top-and-tail',
        name: 'Top And Tail',
        status: 'Processing',
        timing: { start: 10, end: 20 },
      },
    ]);
  });

  it('creates task without intro/outro files', async () => {
    setupMocks(false);

    await processTopAndTailCallback({
      pathParameters: { id },
      body,
    } as unknown as APIGatewayProxyEvent);

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
                sourceFilePath,
                '--start-timestamp',
                String(bodyData.start),
                '--end-timestamp',
                String(bodyData.end),
                '--video-output',
                outputFilePath,
                '--enhance-video',
              ],
            },
          ],
        },
      }),
    );
  });
});
