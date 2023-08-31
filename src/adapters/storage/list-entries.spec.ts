import EntryLocation, { EntryType } from '../../entities/entry-location';
import setupAwsMocks, { AwsMocks } from '../../utils/tests/aws/setup-aws-mocks';
import { expectEqualArrays } from '../../utils/tests/expect';
import listEntries from './list-entries';

describe('list entries', () => {
  let awsMocks: AwsMocks;

  beforeEach(() => {
    jest.clearAllMocks();
    awsMocks = setupAwsMocks();
  });

  it('throws when requested to list files with included root', () => {
    expect(
      listEntries(new EntryLocation(`s3://my-bucket/prefix`), 'file', true),
    ).rejects.toThrowError();
  });

  ['', 's3://'].forEach((prefix) => {
    it('must return list with or without storage prefix', async () => {
      const file1 = awsMocks.s3.add('my-bucket', { Key: 'some-prefix/file1.mp4' });
      const file2 = awsMocks.s3.add('my-bucket', { Key: 'some-prefix/file2.mp4' });

      const result = await listEntries(new EntryLocation(`${prefix}my-bucket/some-prefix`), 'file');

      expectEqualArrays(result, [
        EntryLocation.fromPartsOfPath('my-bucket', file1.Key),
        EntryLocation.fromPartsOfPath('my-bucket', file2.Key),
      ]);
    });
  });

  ['file', 'folder'].forEach((entryType) => {
    it(`must not include empty entries when param is ${entryType}`, async () => {
      const file = awsMocks.s3.add('my-bucket', { Key: 'prefix/folder/file1.mp4' });
      const folder = awsMocks.s3.add('my-bucket', { Key: 'prefix/folder' });

      const result = await listEntries(
        new EntryLocation(`s3://my-bucket/prefix`),
        entryType as EntryType,
      );

      if (entryType === 'file') {
        expectEqualArrays(result, [EntryLocation.fromPartsOfPath('my-bucket', file.Key)]);
      } else {
        expectEqualArrays(result, [EntryLocation.fromPartsOfPath('my-bucket', folder.Key)]);
      }
    });
  });

  it(`must include root folder`, async () => {
    awsMocks.s3.add('my-bucket', { Key: 'folder/file1.mp4' });
    awsMocks.s3.add('my-bucket', { Key: 'folder' });

    const result = await listEntries(new EntryLocation(`s3://my-bucket/fold`), 'folder', true);

    expectEqualArrays(result, [new EntryLocation('my-bucket/folder')]);
  });

  it('returns empty array if bucket doesn`t exist', async () => {
    const result = await listEntries(new EntryLocation(`s3://my-bucket/fold`), 'folder', true);

    expectEqualArrays(result, []);
  });
});
