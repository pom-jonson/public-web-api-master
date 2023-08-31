import EntryLocation from '../../entities/entry-location';
import setupAwsMocks, { AwsMocks } from '../../utils/tests/aws/setup-aws-mocks';
import listEntries from './list-entries';
import moveEntry from './move-entry';

describe('move entry', () => {
  let awsMocks: AwsMocks;

  beforeEach(() => {
    jest.clearAllMocks();
    awsMocks = setupAwsMocks();
  });

  [
    { locationFrom: 'i/am/file.ext', locationTo: 'i/am/folder' },
    { locationFrom: 'this/is/folder', locationTo: 'that/is/some.file' },
  ].forEach(({ locationFrom, locationTo }) => {
    it('throws if location types dont match', () => {
      expect(
        moveEntry(new EntryLocation(locationFrom), new EntryLocation(locationTo)),
      ).rejects.toThrowError();
    });
  });

  it('moves file to a new location', async () => {
    awsMocks.s3.add('some-bucket', { Key: 'path/file.mpx' });
    await moveEntry(
      new EntryLocation('some-bucket/path/file.mpx'),
      new EntryLocation('also-bucket/path-too/file.mpx'),
    );

    const newObject = await listEntries(new EntryLocation('also-bucket/path-too'), 'file');
    expect(newObject).toStrictEqual([new EntryLocation('also-bucket/path-too/file.mpx')]);

    const oldObject = await listEntries(new EntryLocation('some-bucket'), 'file');
    expect(oldObject).toStrictEqual([]);
  });

  it('moves folder to a new location', async () => {
    awsMocks.s3.add('bucket', { Key: 'folder/path/file.mpx' });
    awsMocks.s3.add('bucket', { Key: 'folder/longer/path/file2.mpx' });
    await moveEntry(
      new EntryLocation('bucket/folder'),
      new EntryLocation('another-bucket/another-folder'),
    );

    const newObject = await listEntries(new EntryLocation('another-bucket'), 'file');
    expect(newObject).toStrictEqual([
      new EntryLocation('another-bucket/another-folder/longer/path/file2.mpx'),
      new EntryLocation('another-bucket/another-folder/path/file.mpx'),
    ]);

    const oldObject = await listEntries(new EntryLocation('bucket'), 'file');
    expect(oldObject).toStrictEqual([]);
  });
});
