import Clip, {
  CLIP_FILE_EXTENSION,
  CLIP_FILE_STEM_POSTFIX,
  TRANSCRIPTION_EXTENTIONS,
} from './clip';
import EntryLocation from './entry-location';

describe('clip', () => {
  ['s3://bucket/folder', 'bucket/folder'].forEach((locationUri) => {
    it('throws when clip locationUri is not file', () => {
      expect(() => new Clip(new EntryLocation(locationUri))).toThrowError();
    });
  });

  ['s3://bucket/folder/file.txt', 's3://bucket/folder/file.mp3'].forEach((locationUri) => {
    it('throws when clip file is not mp4', () => {
      expect(() => new Clip(new EntryLocation(locationUri))).toThrowError();
    });
  });

  [
    {
      locationUri: `s3://bucket/folder/file.${CLIP_FILE_EXTENSION}`,
      name: 'Folder',
    },
    {
      locationUri: `s3://another-bucket/another-folder/another-file.${CLIP_FILE_EXTENSION}`,
      name: 'Another Folder',
    },
  ].forEach(({ locationUri, name }) => {
    it('initializes from locationUri correctly', () => {
      const location = new EntryLocation(locationUri);

      const result = new Clip(location);
      expect(result).toMatchObject({
        name,
        location,
      });
    });
  });

  it('creates original correctly from project location', () => {
    const clip = Clip.getOriginal(new EntryLocation('bucket/project-folder/'));
    expect(clip.location.getFullPath()).toEqual(
      `bucket/project-folder/original/master-${CLIP_FILE_STEM_POSTFIX}.${CLIP_FILE_EXTENSION}`,
    );
  });

  [
    { path: 'bucket/project-folder/original/master-footage.mp4', expectedResult: true },
    { path: 'bucket/project-folder/master-footage.mp4', expectedResult: false },
    { path: 'bucket/project-folder/aboriginal/master-footage.mp4', expectedResult: false },
    { path: 'bucket/project-folder/original/footage.mp4', expectedResult: false },
  ].forEach(({ path, expectedResult }) => {
    it('finds out if clip is original correctly', () => {
      const clip = new Clip(new EntryLocation(path));
      expect(clip.isOriginal()).toEqual(expectedResult);
    });
  });

  [
    {
      locationUri: `s3://bucket/folder/file.${CLIP_FILE_EXTENSION}`,
      expectedUri: `s3://bucket/folder/file-transcription.${TRANSCRIPTION_EXTENTIONS.vtt}`,
    },
    {
      locationUri: `s3://another-bucket/another-folder/another-file.${CLIP_FILE_EXTENSION}`,
      expectedUri: `s3://another-bucket/another-folder/another-file-transcription.${TRANSCRIPTION_EXTENTIONS.vtt}`,
    },
  ].forEach(({ locationUri, expectedUri }) => {
    it('creates correct transcription locationUri', () => {
      const clip = new Clip(new EntryLocation(locationUri));
      expect(clip.getTranscriptionLocation()).toMatchObject(new EntryLocation(expectedUri));
    });
  });

  it('creates correct editing location', () => {
    const clip = new Clip(new EntryLocation(`bucket/folder/file.${CLIP_FILE_EXTENSION}`));
    expect(clip.getEditingLocation('top-and-tail')).toMatchObject(
      new EntryLocation(
        `bucket/top-and-tail/edited-${CLIP_FILE_STEM_POSTFIX}.${CLIP_FILE_EXTENSION}`,
      ),
    );
  });
});
