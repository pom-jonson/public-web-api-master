import EntryLocation from '../../entities/entry-location';
import setupAwsMocks, { AwsMocks } from '../../utils/tests/aws/setup-aws-mocks';
import { getPublicPath } from './get-public-path';

describe('get public path', () => {
  let awsMocks: AwsMocks;
  beforeEach(() => {
    jest.clearAllMocks();
  });

  beforeAll(() => {
    awsMocks = setupAwsMocks();
  });

  it('throws when location is not file', () => {
    awsMocks.s3.add('my-bucket');
    expect(getPublicPath(new EntryLocation(`my-bucket/some-prefix`))).rejects.toThrowError();
  });

  it('returns path', async () => {
    awsMocks.s3.add('my-bucket');
    const result = await getPublicPath(new EntryLocation(`my-bucket/some-prefix/file.mp4`));
    expect(result).toContain(`some-prefix/file.mp4`);
  });
});
