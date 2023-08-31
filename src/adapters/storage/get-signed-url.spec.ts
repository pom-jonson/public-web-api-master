import EntryLocation from '../../entities/entry-location';
import setupAwsMocks, { AwsMocks } from '../../utils/tests/aws/setup-aws-mocks';
import { getSignedUrl, SignedUrlOperations } from './get-signed-url';

describe('get public path', () => {
  let awsMocks: AwsMocks;
  beforeEach(() => {
    jest.clearAllMocks();
  });

  beforeAll(() => {
    awsMocks = setupAwsMocks();
  });
  it('throws when location is not file', () => {
    expect(
      getSignedUrl(new EntryLocation(`my-bucket/some-prefix`), SignedUrlOperations.GET),
    ).rejects.toThrowError();
  });

  Object.keys(SignedUrlOperations).map((key) => {
    it('returns path', async () => {
      awsMocks.s3.add('eos-e2etests-editonthespot-com');
      const result = await getSignedUrl(
        new EntryLocation(`eos-e2etests-editonthespot-com/some-prefix/file.mp4`),
        key as SignedUrlOperations,
      );
      expect(result).toContain(`some-prefix/file.mp4`);
    });
  });
});
