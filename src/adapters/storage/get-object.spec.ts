import EntryLocation from '../../entities/entry-location';
import setupAwsMocks, { AwsMocks } from '../../utils/tests/aws/setup-aws-mocks';
import { getObject } from './get-object';

describe('get object', () => {
  let awsMocks: AwsMocks;
  beforeEach(() => {
    jest.clearAllMocks();
    awsMocks = setupAwsMocks();
  });

  it('returns Buffer', async () => {
    awsMocks.s3.add('my-bucket', {
      Key: 'some-prefix/credential.json',
      Body: Buffer.from(
        JSON.stringify({
          email: 'test@email.com',
          first_name: 'TEST',
          last_name: 'EOS',
        }),
      ),
    });
    const result = await getObject(new EntryLocation(`my-bucket/some-prefix/credential.json`));
    expect(result).toBeInstanceOf(Buffer);
  });

  it('throws an error if the entry location is not a file', () => {
    expect(
      getObject(new EntryLocation(`my-bucket/some-prefix/credentials/`)),
    ).rejects.toThrowError();
  });
});
