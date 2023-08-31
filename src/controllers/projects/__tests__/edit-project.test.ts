import { APIGatewayProxyEvent } from 'aws-lambda';
import setupAwsMocks, { AwsMocks } from '../../../utils/tests/aws/setup-aws-mocks';
import { editProjectCallback } from '../edit-project';
import { listProjectsCallback } from '../list-projects';

describe('edit project', () => {
  const id = 'akwp4o';
  const name = 'Nice Name';
  const bucket = 'eos-projects-dev';
  const accountId = 'test-test-com';
  let awsMocks: AwsMocks;

  beforeEach(() => {
    awsMocks = setupAwsMocks();
  });

  it('returns 404 if project is not found', async () => {
    const result = await editProjectCallback({
      pathParameters: { id },
      body: JSON.stringify({ name: 'some new name' }),
    } as unknown as APIGatewayProxyEvent);

    expect(result.statusCode).toEqual(404);
  });

  [
    { body: undefined, resultCode: 400 },
    { body: { name: '' }, resultCode: 412 },
    { body: { name2: 'i am broken' }, resultCode: 412 },
    {
      body: {
        name: 'veeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeery long string veeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeery long string veeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeery long string veeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeery long string ',
      },
      resultCode: 412,
    },
  ].forEach(({ body, resultCode }) => {
    it('returns 4xx for invalid payload', async () => {
      awsMocks.s3.add(bucket, {
        Key: `${accountId}/projects/${id}-${name}-2005-03-03-12-54/proj/file.mp4`,
      });

      const result = await editProjectCallback({
        pathParameters: { id },
        body: JSON.stringify(body),
      } as unknown as APIGatewayProxyEvent);

      expect(result.statusCode).toEqual(resultCode);
    });
  });

  it('renames project and moves its entries', async () => {
    awsMocks.s3.add(bucket, {
      Key: `${accountId}/projects/${id}-processed-on-zoom-2005-03-03-12-54/proj/file.mp4`,
    });

    await editProjectCallback({
      pathParameters: { id },
      body: JSON.stringify({ name }),
    } as unknown as APIGatewayProxyEvent);
    const result = await listProjectsCallback({} as APIGatewayProxyEvent);

    expect(JSON.parse(result.body)).toEqual([
      {
        id,
        name,
        created: new Date('2005-03-03 12:54').toJSON(),
        original: null,
        edits: [],
      },
    ]);
  });

  it('returns 208 with empty body when name is the same as previous', async () => {
    awsMocks.s3.add(bucket, {
      Key: `${accountId}/projects/${id}-${name}-2005-03-03-12-54/proj/file.mp4`,
    });

    const result = await editProjectCallback({
      pathParameters: { id },
      body: JSON.stringify({ name }),
    } as unknown as APIGatewayProxyEvent);

    expect(result.statusCode).toEqual(208);
    expect(result.body).toBeUndefined();
  });
});
