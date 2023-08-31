import EntryLocation from '../../entities/entry-location';
import getUploadProjectUrl, { Dependencies } from './get-upload-project-url';

describe('upload project', () => {
  const accountBucketPrefix = 'pref';
  const customerEmail = 'email@test.com';

  const getMockDeps = (file: EntryLocation): Dependencies => {
    return {
      bucket: accountBucketPrefix,
      getSignedUploadUrl: () => {
        return Promise.resolve(file.getFullUri());
      },
      putSerializedObject: () => Promise.resolve(),
    };
  };

  it('returns the signed url', async () => {
    const result = await getUploadProjectUrl(
      { customerEmail, fileName: 'Project file name' },
      getMockDeps(new EntryLocation('mybucket/project-file-name/master-footage.mp4')),
    );

    expect(typeof result.id).toEqual('string');
    expect(typeof result.url).toEqual('string');
  });
});
