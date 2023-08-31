import EntryLocation from '../../entities/entry-location';
import setupAwsMocks, { AwsMocks } from '../../utils/tests/aws/setup-aws-mocks';
import { getDeserializedObject } from './get-deserialized-object';

describe('get deserialized object', () => {
  let awsMocks: AwsMocks;
  beforeEach(() => {
    jest.clearAllMocks();
    awsMocks = setupAwsMocks();
  });

  it('returns deserialized object', async () => {
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
    const result = await getDeserializedObject(
      new EntryLocation(`my-bucket/some-prefix/credential.json`),
    );
    expect(typeof result).toBe('object');
    expect(result).toEqual({
      email: 'test@email.com',
      first_name: 'TEST',
      last_name: 'EOS',
    });
  });

  it('throws an error if the entry location is not a file', () => {
    expect(
      getDeserializedObject(new EntryLocation(`my-bucket/some-prefix/credentials/`)),
    ).rejects.toThrowError();
  });
});
