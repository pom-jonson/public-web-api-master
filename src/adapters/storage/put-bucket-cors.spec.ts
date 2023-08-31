import EntryLocation from '../../entities/entry-location';
import setupAwsMocks, { AwsMocks } from '../../utils/tests/aws/setup-aws-mocks';
import { putBucketCors } from './put-bucket-cors';

describe('put bucket cors', () => {
  let awsMock: AwsMocks;
  beforeEach(() => {
    jest.clearAllMocks();
    awsMock = setupAwsMocks();
  });

  it('resolves if provided a proper entry location', () => {
    awsMock.s3.add('my-bucket');
    expect(putBucketCors(new EntryLocation(`my-bucket/some-prefix`))).resolves.not.toThrowError();
  });
});
