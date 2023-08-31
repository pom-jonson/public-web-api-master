/* eslint-disable @typescript-eslint/ban-ts-comment */
import EntryLocation, { EntryType } from '../../entities/entry-location';
import listProjects, { Dependencies } from './list-projects';

describe('list projects', () => {
  const accountBucketPrefix = 'pref';
  const customerEmail = 'email@test.com';

  const getMockDeps = (folders: EntryLocation[], files?: EntryLocation[]): Dependencies => {
    return {
      bucket: accountBucketPrefix,
      listEntries: (_: EntryLocation, type: EntryType) => {
        return Promise.resolve(type === 'folder' ? folders : files);
      },
      getDeserializedObject: () =>
        //@ts-ignore
        Promise.resolve({
          projectName: 'Recorded On Zoom',
        }),
    };
  };

  it('returns empty list when there are no entries', async () => {
    const result = await listProjects({ customerEmail }, getMockDeps([]));
    expect(result).toEqual([]);
  });

  it('throws when there is no readable date in project', () => {
    expect(
      listProjects(
        { customerEmail },
        getMockDeps([new EntryLocation('projects/123abc-recorded-on-zoom-2021-12-21-14-a')]),
      ),
    ).rejects.toThrowError();
  });

  it('returns projects sorted by date descending', async () => {
    const folders = [
      new EntryLocation('projects/123abc-recorded-on-zoom-2020-12-21-04-58'),
      new EntryLocation('projects/gfd453-recorded-on-zoom-2022-02-02-07-59'),
      new EntryLocation('projects/lq10nr-recorded-on-zoom-2021-04-17-20-02'),
    ];
    const files = [
      new EntryLocation(`projects/123abc-recorded-on-zoom-2020-12-21-04-58/original/file.mp4`),
      new EntryLocation(`projects/123abc-recorded-on-zoom-2020-12-21-04-58/top-and-tail/file2.mp4`),
      new EntryLocation(`projects/lq10nr-recorded-on-zoom-2021-04-17-20-02/original/file10.mp4`),
      new EntryLocation(`projects/gfd453-recorded-on-zoom-2022-02-02-07-59/original/file3.mp4`),
      new EntryLocation(`projects/gfd453-recorded-on-zoom-2022-02-02-07-59/original/file4.vtt`),
      new EntryLocation(`projects/gfd453-recorded-on-zoom-2022-02-02-07-59/info.json`),
    ];

    const result = await listProjects({ customerEmail }, getMockDeps(folders, files));

    expect(result).toEqual([
      {
        id: 'gfd453',
        name: 'Recorded On Zoom',
        created: new Date('2022-02-02 07:59'),
        original: null,
        edits: [],
      },
      {
        id: 'lq10nr',
        name: 'Recorded On Zoom',
        created: new Date('2021-04-17 20:02'),
        original: null,
        edits: [],
      },
      {
        id: '123abc',
        name: 'Recorded On Zoom',
        created: new Date('2020-12-21 04:58'),
        original: null,
        edits: [],
      },
    ]);
  });
});
