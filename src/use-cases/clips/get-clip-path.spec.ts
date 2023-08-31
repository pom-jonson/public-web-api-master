import EntryLocation from '../../entities/entry-location';
import getClipPath from './get-clip-path';

describe('get clip path by location', () => {
  [undefined, '', 'bucket/folder/file.mp3'].forEach((folderPath) => {
    it('throws when location is invalid', () => {
      expect(
        getClipPath({ folderPath }, { listEntries: () => Promise.resolve([]) }),
      ).rejects.toThrowError();
    });
  });

  it('throws when clip cant be found', () => {
    const fileLocation = new EntryLocation('bucket/folder/file.wrong-extension');
    expect(
      getClipPath(
        { folderPath: 'bucket/folder' },
        { listEntries: () => Promise.resolve([fileLocation]) },
      ),
    ).rejects.toThrowError();
  });

  it('throws when folder containts multiple clips', () => {
    const clipLocation1 = new EntryLocation('bucket/folder/file.mp4');
    const clipLocation2 = new EntryLocation('bucket/folder/file2.mp4');
    const folderPath = 'bucket/folder';

    expect(
      async () =>
        await getClipPath(
          { folderPath },
          {
            listEntries: () => Promise.resolve([clipLocation1, clipLocation2]),
          },
        ),
    ).rejects.toThrowError();
  });

  it('returns clip path', async () => {
    const filePath = 'bucket/folder/file.mp4';
    const clipLocation = new EntryLocation(filePath);
    const folderPath = 'bucket/folder';

    const result = await getClipPath(
      { folderPath },
      {
        listEntries: () => Promise.resolve([clipLocation]),
      },
    );

    expect(result).toBe(filePath);
  });
});
