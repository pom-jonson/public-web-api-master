import { GET_PROJECT_BUCKET } from '../../../../runtime-config';
import setupAwsMocks, { AwsMocks } from '../../../utils/tests/aws/setup-aws-mocks';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { getProjectCallback } from '../get-project';
import { expectStatusCodeWithStandardHeaders } from '../../../utils/tests/expect';
import { ProjectVM } from '../../../use-cases/projects/get-project';

describe('get project', () => {
  let awsMocks: AwsMocks;
  const id = 'asd1fg';
  const accountId = 'test-test-com';
  const bucket = GET_PROJECT_BUCKET();

  beforeEach(() => {
    awsMocks = setupAwsMocks();
  });

  it('returns project with clip', async () => {
    const keys = [
      `${accountId}/projects/${id}-processed-on-zoom-2000-01-01-00-00/original/master-footage.mp4`,
      `${accountId}/projects/${id}-processed-on-zoom-2000-01-01-00-00/name/file2.mp4`,
      `${accountId}/projects/${id}-processed-on-zoom-2000-01-01-00-00/another-name/timestamps.json`,
      `${accountId}/projects/${id}-processed-on-zoom-2000-01-01-00-00/info.json`,
    ];
    awsMocks.s3.add(bucket, { Key: keys[0] });
    awsMocks.s3.add(bucket, { Key: keys[1] });
    awsMocks.s3.add(bucket, {
      Key: keys[2],
      Body: Buffer.from(
        JSON.stringify({
          start: 10,
          end: 20,
        }),
      ),
    });
    awsMocks.s3.add(bucket, {
      Key: keys[3],
      Body: Buffer.from(
        JSON.stringify({
          projectName: 'Processed On Zoom',
        }),
      ),
    });

    const result = await getProjectCallback({
      pathParameters: { id },
    } as unknown as APIGatewayProxyEvent);
    expectStatusCodeWithStandardHeaders(result, 200);

    const project = JSON.parse(result.body) as ProjectVM;

    expect(project).toStrictEqual({
      id,
      name: 'Processed On Zoom',
      created: new Date('2000-01-01 00:00').toJSON(),
      original: { id: 'original', name: 'Original', fullPath: `${bucket}/${keys[0]}` },
      edits: [
        { id: 'name', name: 'Name', status: 'Processed', fullPath: `${bucket}/${keys[1]}` },
        {
          id: 'another-name',
          name: 'Another Name',
          status: 'InReview',
          timing: { start: 10, end: 20 },
        },
      ],
    });
  });
});
