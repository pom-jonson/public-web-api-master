/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { APIGatewayProxyEvent } from 'aws-lambda';
import { listProjectsCallback } from '../list-projects';
import { expectStatusCodeWithStandardHeaders } from '../../../utils/tests/expect';
import setupAwsMocks, { AwsMocks } from '../../../utils/tests/aws/setup-aws-mocks';
import { GET_PROJECT_BUCKET } from '../../../../runtime-config';
import { ListProjectVM } from '../../../use-cases/projects/list-projects';

describe('list projects', () => {
  let awsMocks: AwsMocks;
  const accountId = 'test-test-com';

  beforeEach(() => {
    awsMocks = setupAwsMocks();
  });

  const initializeSpecifiedAccountTest = (): void => {
    awsMocks.s3.add(GET_PROJECT_BUCKET(), {
      Key: `${accountId}/projects/asd1fg-processed-on-zoom-2000-01-01-00-00/some-name/file1.mp4`,
    });
    awsMocks.s3.add(GET_PROJECT_BUCKET(), {
      Key: `${accountId}projects/asd1fg-processed-on-zoom-2000-01-01-00-00/info.json`,
      Body: Buffer.from(
        JSON.stringify({
          projectName: 'Processed On Zoom',
        }),
      ),
    });
    awsMocks.s3.add(GET_PROJECT_BUCKET(), {
      Key: `${accountId}/projects/asd1fg-processed-on-zoom-2000-01-01-00-00/another-name/file2.mp4`,
    });
    awsMocks.s3.add(GET_PROJECT_BUCKET(), {
      Key: `${accountId}/projects/asd1fg-processed-on-zoom-2000-01-01-00-00/info.json`,
      Body: Buffer.from(
        JSON.stringify({
          projectName: 'Processed On Zoom',
        }),
      ),
    });
    awsMocks.s3.add(GET_PROJECT_BUCKET(), {
      Key: `${accountId}/projects/keq09v-filmed-on-twitch-2010-12-12-12-12/some-name/file3.mp4`,
    });
    awsMocks.s3.add(GET_PROJECT_BUCKET(), {
      Key: `${accountId}/projects/keq09v-filmed-on-twitch-2010-12-12-12-12/info.json`,
      Body: Buffer.from(
        JSON.stringify({
          projectName: 'Filmed On Twitch',
        }),
      ),
    });
    awsMocks.s3.add(GET_PROJECT_BUCKET(), {
      Key: 'another-account/projects/l1pamd-processed-on-zoom-2021-05-05-05-05/completely-different-name/file3.mp4',
    });

    awsMocks.s3.add(GET_PROJECT_BUCKET(), {
      Key: 'another-account/projects/l1pamd-processed-on-zoom-2021-05-05-05-05/info.json',
      Body: Buffer.from(
        JSON.stringify({
          projectName: 'Processed On Zoom',
        }),
      ),
    });
    awsMocks.s3.add(GET_PROJECT_BUCKET(), {
      Key: `${accountId}/projects/keq09v-filmed-on-twitch-2010-12-12-12-12/some-name`,
    });

    awsMocks.s3.add(GET_PROJECT_BUCKET(), {
      Key: `${accountId}/projects/keq09v-filmed-on-twitch-2010-12-12-12-12/info.json`,
      Body: Buffer.from(
        JSON.stringify({
          projectName: 'Processed On Zoom',
        }),
      ),
    });
  };
  it('must return empty array when bucket for account id doesnt exist', async () => {
    const result = await listProjectsCallback({} as APIGatewayProxyEvent);
    expectStatusCodeWithStandardHeaders(result, 200);
    expect(JSON.parse(result.body)).toStrictEqual([]);
  });

  it('must return 500 when unexpected error occurs', async () => {
    awsMocks.s3.setThrowError();
    awsMocks.s3.add(GET_PROJECT_BUCKET(), {
      Key: `${accountId}/test`,
    });
    const result = await listProjectsCallback({} as APIGatewayProxyEvent);
    expectStatusCodeWithStandardHeaders(result, 500);
  });

  it('must return projects for specified account', async () => {
    initializeSpecifiedAccountTest();

    const result = await listProjectsCallback({} as APIGatewayProxyEvent);

    expectStatusCodeWithStandardHeaders(result, 200);

    const projects = JSON.parse(result.body) as ListProjectVM[];

    expect(projects).toHaveLength(2);

    expect(projects[0].id).toBe('keq09v');
    expect(projects[0].name).toBe('Processed On Zoom');
    expect(projects[1].id).toBe('asd1fg');
    expect(projects[1].name).toBe('Processed On Zoom');
  });
});
