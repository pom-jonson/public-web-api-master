import EntryLocation from '../../entities/entry-location';
import setupAwsMocks, { AwsMocks } from '../../utils/tests/aws/setup-aws-mocks';
import { deleteObject } from './delete-object';
import { getObject } from './get-object';

describe('delete object', () => {
  let mocks: AwsMocks;

  beforeEach(() => {
    mocks = setupAwsMocks();
  });

  it('throws if location is not passed', () => {
    expect(deleteObject(undefined)).rejects.toThrowError();
  });

  it('throws if location is not file', () => {
    const location = new EntryLocation('folder');
    expect(deleteObject(location)).rejects.toThrowError();
  });

  it('doesnt trhow if object doesnt exist', () => {
    const location = new EntryLocation('some/path/file.txt');

    expect(deleteObject(location)).resolves.not.toThrowError();
  });

  it('object cannot be found after delete', async () => {
    mocks.s3.add('bucket', { Key: 'file.json' });
    const location = new EntryLocation('bucket/file.json');

    await deleteObject(location);

    expect(getObject(location)).rejects.toThrow();
  });
});
