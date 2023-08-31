import EntryLocation from '../../entities/entry-location';
import listAssets, { Dependencies } from './list-assets';

describe('list projects', () => {
  const accountBucketPrefix = 'test';
  const customerEmail = 'test@email.com';

  const getMockDeps = (files?: EntryLocation[]): Dependencies => {
    return {
      accountBucketPrefix,
      getPath: (_: EntryLocation) => Promise.resolve(_.key),
      listEntries: () => {
        return Promise.resolve(files);
      },
    };
  };

  [
    {
      result: {
        intro: { path: 'asset/intro.png' },
        outro: { path: 'asset/outro.jpeg' },
      },
      location: [
        new EntryLocation('s3://test-test-email-com/asset/intro.png'),
        new EntryLocation('s3://test-test-email-com/asset/outro.jpeg'),
      ],
    },
    {
      result: {
        intro: { path: 'asset/intro.asdfas' },
        outro: { path: 'asset/outro.erassd' },
      },
      location: [
        new EntryLocation('s3://test-test-email-com/asset/intro.asdfas'),
        new EntryLocation('s3://test-test-email-com/asset/outro.erassd'),
      ],
    },
  ].forEach(({ result, location }) => {
    it('returns the correct extention', async () => {
      const assets = await listAssets({ customerEmail }, getMockDeps(location));

      expect(assets).toStrictEqual(result);
    });
  });

  it('returns an object even if user has no assets', async () => {
    const assets = await listAssets({ customerEmail }, getMockDeps([]));

    expect(assets).toStrictEqual({
      intro: {
        path: null,
      },
      outro: {
        path: null,
      },
    });
  });
});
