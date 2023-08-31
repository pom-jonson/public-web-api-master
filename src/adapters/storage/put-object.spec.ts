import EntryLocation from '../../entities/entry-location';
import setupAwsMocks from '../../utils/tests/aws/setup-aws-mocks';
import * as AWS from 'aws-sdk';
import listEntries from './list-entries';
import { putObject } from './put-object';
import { createS3 } from './s3';

describe('put object', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupAwsMocks();
  });

  it(`not throw an error`, () => {
    expect(putObject('s3://my-bucket/folder/intro.mp4', Buffer.from(''))).resolves.not.toThrow();
  });

  it(`uploads the correct file`, async () => {
    const location = new EntryLocation('s3://my-bucket/folder/intro.mp4');
    await putObject(location.getFullUri(), Buffer.from(''));

    const entries = await listEntries(location, 'file');

    expect(entries.pop().key).toBe(location.key);
  });

  it('creates the bucket if the bucket doesnt exist', async () => {
    const s3 = createS3();

    expect(s3.headBucket({ Bucket: 'my-bucket' }).promise()).rejects.toStrictEqual({
      statusCode: 404,
    });

    await putObject('s3://my-bucket/folder/intro.mp4', Buffer.from(''));

    expect(s3.headBucket({ Bucket: 'my-bucket' }).promise()).resolves.toBeDefined();
  });
});
