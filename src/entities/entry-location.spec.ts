import EntryLocation from './entry-location';

describe('location', () => {
  [
    {
      path: 'just-bucket',
      expectedResult: {
        bucket: 'just-bucket',
        key: '',
        type: 'folder',
        fileName: undefined,
      },
    },
    {
      path: 'no-prefix-bucket/path',
      expectedResult: {
        bucket: 'no-prefix-bucket',
        key: 'path',
        type: 'folder',
        fileName: undefined,
      },
    },
    {
      path: 's3://bucket/file-in-root.txt',
      expectedResult: {
        bucket: 'bucket',
        key: 'file-in-root.txt',
        type: 'file',
        fileName: 'file-in-root.txt',
      },
    },
    {
      path: 'https://s3.us-west-2.amazonaws.com/bucket2/another-path/file.mp4',
      expectedResult: {
        bucket: 'bucket2',
        key: 'another-path/file.mp4',
        type: 'file',
        fileName: 'file.mp4',
      },
    },
  ].forEach(({ path, expectedResult }) => {
    it('initializes with correct bucket, key and file name', () => {
      const location = new EntryLocation(path);
      expect(location).toEqual(expect.objectContaining(expectedResult));
    });
  });

  [
    {
      bucket: 'bucket',
      key: 'path',
      expectedResult: {
        type: 'folder',
        relativePath: 'path',
        fileName: undefined,
      },
    },
    {
      bucket: 'bucket',
      key: 'another/path/some-file.mp4',
      expectedResult: {
        type: 'file',
        relativePath: 'another/path',
        fileName: 'some-file.mp4',
      },
    },
  ].forEach(({ bucket, key, expectedResult }) => {
    it('initializes correct type, relative path and file name', () => {
      const location = EntryLocation.fromPartsOfPath(bucket, key);
      expect(location).toEqual(expect.objectContaining(expectedResult));
    });
  });

  [
    {
      path: 'path',
      expectedResult: false,
    },
    {
      path: 'another/path/some-file.mp4',
      expectedResult: true,
    },
    {
      path: 's3://bucket/path/file.txt',
      expectedResult: true,
    },
  ].forEach(({ path, expectedResult }) => {
    it('identifies if specified is path to file correctly', () => {
      expect(EntryLocation.isFile(path)).toEqual(expectedResult);
    });
  });

  [
    { path: 's3://bucket', result: '' },
    { path: 's3://bucket/some/path/file.json', result: 'path' },
  ].forEach(({ path, result }) => {
    it('returns correct folder', () => {
      const location = new EntryLocation(path);
      expect(location.getFolder()).toEqual(result);
    });
  });

  it('returns correct folder location', () => {
    const location = new EntryLocation('s3://bucket/some/path/file.json');
    expect(location.getFolderLocation()).toEqual(new EntryLocation('s3://bucket/some/path'));
  });

  it('returns correct bucket location', () => {
    const location = new EntryLocation('s3://bucket/some/path/file.json');
    expect(location.getBucketLocation()).toEqual(new EntryLocation('s3://bucket'));
  });

  [
    { path: 's3://bucket/some/path/file.json', result: 'json' },
    { path: 's3://bucket/some/path', result: undefined },
  ].forEach(({ path, result }) => {
    it('returns correct file extension or undefined', () => {
      const location = new EntryLocation(path);
      expect(location.getFileExtension()).toEqual(result);
    });
  });

  [
    { path: 's3://bucket/some/path/file2.json', result: 'file2' },
    { path: 's3://bucket/some/path', result: undefined },
  ].forEach(({ path, result }) => {
    it(`return correct file stem or undefined`, () => {
      const location = new EntryLocation(path);
      expect(location.getFileStem()).toEqual(result);
    });
  });

  [
    {
      uri: 's3://bucket/some/path',
      expectedResult: 'bucket/some/path',
    },
    {
      uri: 's3://bucket-only',
      expectedResult: 'bucket-only',
    },
  ].forEach(({ uri, expectedResult }) => {
    it('returns correct full path', () => {
      const location = new EntryLocation(uri);
      expect(location.getFullPath()).toEqual(expectedResult);
    });
  });

  [
    {
      uri: 's3://bucket/some/path',
      expectedResult: 'bucket/some/path',
    },
    {
      uri: 's3://bucket-only',
      expectedResult: 'bucket-only',
    },
    {
      uri: 's3://bucket/path/file.mp4',
      expectedResult: 'bucket/path',
    },
  ].forEach(({ uri, expectedResult }) => {
    it('returns correct folder path', () => {
      const location = new EntryLocation(uri);
      expect(location.getFolderPath()).toEqual(expectedResult);
    });
  });

  [
    {
      url: 'https://s3.us-west-2.amazonaws.com/folder/path',
      expectedResult: 's3://folder/path',
    },
    {
      url: 'https://s3.us-west-2.amazonaws.com/folder/path/file.mp4',
      expectedResult: 's3://folder/path/file.mp4',
    },
    {
      url: 'https://s3.us-west-2.amazonaws.com/folder',
      expectedResult: 's3://folder',
    },
  ].forEach(({ url, expectedResult }) => {
    it('returns correct uri', () => {
      const location = new EntryLocation(url);
      expect(location.getFullUri()).toEqual(expectedResult);
    });
  });

  [
    {
      url: 'https://s3.us-west-2.amazonaws.com/folder/another-path',
      expectedResult: 's3://folder/another-path',
    },
    {
      url: 'https://s3.us-west-2.amazonaws.com/folder/also-path/file.mp4',
      expectedResult: 's3://folder/also-path',
    },
    {
      url: 'https://s3.us-west-2.amazonaws.com/folder',
      expectedResult: 's3://folder',
    },
  ].forEach(({ url, expectedResult }) => {
    it('returns correct folder uri', () => {
      const location = new EntryLocation(url);
      expect(location.getFolderUri()).toEqual(expectedResult);
    });
  });

  [
    {
      url: 'bucket',
      key: 'file.sdf',
      offset: 0,
      expectedResult: 'bucket/file.sdf',
    },
    {
      url: 'bucket/folder',
      key: '',
      offset: 1,
      expectedResult: 'bucket',
    },
    {
      url: 'bucket/folder/file.mp4',
      key: 'another-file.mp4',
      offset: 1,
      expectedResult: 'bucket/folder/another-file.mp4',
    },
    {
      url: 'bucket/folder/file.mp4',
      key: undefined,
      offset: 2,
      expectedResult: 'bucket',
    },
    {
      url: 'bucket/folder',
      key: 'another-folder/another-file.mp4',
      offset: 0,
      expectedResult: 'bucket/folder/another-folder/another-file.mp4',
    },
    {
      url: 'bucket/folder/file.mp4',
      key: 'another-folder/another-file.txt',
      offset: 2,
      expectedResult: 'bucket/another-folder/another-file.txt',
    },
    {
      url: 'bucket',
      key: 'another-bucket',
      offset: 1,
      expectedResult: 'another-bucket',
    },
  ].forEach(({ url, key, offset, expectedResult }) => {
    it('modifies location correctly', () => {
      const modifiedLocation = new EntryLocation(url).getModification(key, offset);
      expect(modifiedLocation.getFullPath()).toEqual(expectedResult);
    });
  });

  [
    {
      locationUri: 'bucket/path',
      subLocationUri: 'bucket',
      expectedResult: true,
    },
    {
      locationUri: 'bucket-too/path',
      subLocationUri: 'bucket',
      expectedResult: false,
    },
    {
      locationUri: 's3://Bucket/Very/Long/Path/file.txt',
      subLocationUri: 'bucket/very/long',
      expectedResult: true,
    },
  ].forEach(({ locationUri, subLocationUri, expectedResult }) => {
    it('identifies if specified is path to file correctly', () => {
      const subLocation = new EntryLocation(subLocationUri);
      const location = new EntryLocation(locationUri);
      expect(subLocation.isSubLocationOf(location)).toEqual(expectedResult);
    });
  });
});
