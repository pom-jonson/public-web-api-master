import { deleteObject } from '../../adapters/storage/delete-object';
import { getPublicPath } from '../../adapters/storage/get-public-path';
import listEntries from '../../adapters/storage/list-entries';
import { putObject } from '../../adapters/storage/put-object';
import { FilePayload } from '../../controllers/assets/upload-asset';
import EntryLocation from '../../entities/entry-location';
import validPngImage from '../../utils/valid-png-image.json';
import smallPngImage from '../../utils/small-png-image.json';
import validJpgImage from '../../utils/valid-jpg-image.json';
import setupAwsMocks from '../../utils/tests/aws/setup-aws-mocks';
import listAssets from './list-assets';
import uploadAsset, { Dependencies } from './upload-asset';

describe('upload assets', () => {
  const accountBucketPrefix = 'test';
  const customerEmail = 'test@email.com';
  const mp4File = {
    filename: 'file.mp4',
    fieldname: 'file',
    content: Buffer.from(''),
  } as FilePayload;
  const pngFile = {
    filename: 'file.png',
    fieldname: 'file',
    content: Buffer.from(validPngImage),
  } as FilePayload;
  const pngSmallFile = {
    filename: 'file.png',
    fieldname: 'file',
    content: Buffer.from(smallPngImage),
  } as FilePayload;
  const jpgFile = {
    filename: 'file.png',
    fieldname: 'file',
    content: Buffer.from(validJpgImage),
  } as FilePayload;

  const getMockDeps = (): Dependencies => {
    return {
      bucket: accountBucketPrefix,
      getPublicPath: (_: EntryLocation) => Promise.resolve(_.key),
      listEntries,
      deleteObject,
      putObject,
    };
  };

  beforeEach(() => {
    setupAwsMocks();
  });

  it('returns an error for unsupported file', () => {
    expect(
      uploadAsset(
        { customerEmail, file: { ...mp4File, filename: 'file.txt' }, type: 'intro' },
        getMockDeps(),
      ),
    ).rejects.toThrowError();
  });

  it('returns newly uploaded asset', async () => {
    const result = await uploadAsset(
      { customerEmail, file: mp4File, type: 'intro' },
      getMockDeps(),
    );

    expect(result).toStrictEqual({
      intro: { path: 'test-email-com/assets/intro.mp4' },
    });
  });

  it('throws for unsupported image type', () => {
    expect(
      uploadAsset({ customerEmail, file: jpgFile, type: 'intro' }, getMockDeps()),
    ).rejects.toThrowError();
  });

  it('throws for smaller image', () => {
    expect(
      uploadAsset({ customerEmail, file: pngSmallFile, type: 'intro' }, getMockDeps()),
    ).rejects.toThrowError();
  });

  it('replaces previously uploaded asset', async () => {
    await uploadAsset({ customerEmail, file: pngFile, type: 'outro' }, getMockDeps());
    await uploadAsset({ customerEmail, file: pngFile, type: 'intro' }, getMockDeps());
    await uploadAsset({ customerEmail, file: mp4File, type: 'intro' }, getMockDeps());

    const result = await listAssets(
      { customerEmail },
      {
        accountBucketPrefix,
        getPath: getPublicPath,
        listEntries,
      },
    );
    expect(result).toStrictEqual({
      intro: { path: 'test/test-email-com/assets/intro.mp4' },
      outro: { path: 'test/test-email-com/assets/outro.png' },
    });
  });
});
