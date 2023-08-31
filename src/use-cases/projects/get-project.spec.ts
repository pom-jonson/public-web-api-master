/* eslint-disable @typescript-eslint/ban-ts-comment */
import EntryLocation, { EntryType } from '../../entities/entry-location';
import { InvalidParameterError } from '../exceptions';
import getProject, { Dependencies, TimingVM } from './get-project';
import { PROJECT_INFO_FILE } from '../../entities/project';
describe('get project', () => {
  const id = 'lw0bq1';

  function getJsonData<T>(fileLocation: EntryLocation): Promise<T> {
    let payload: unknown = { start: 10, end: 20 };

    if (fileLocation.fileName === PROJECT_INFO_FILE) {
      payload = {
        projectName: 'Processed On Zoom',
      };
    }
    return Promise.resolve(payload as T);
  }

  const getMockDeps = (
    params?: Partial<{
      files: EntryLocation[];
      getDeserializedObject<T>(fileLocation?: EntryLocation): Promise<T>;
    }>,
  ): Dependencies => {
    const defaultGetDeserialized = (): Promise<TimingVM> => Promise.resolve({ start: 10, end: 20 });

    return {
      listEntries: (_: EntryLocation, entryType: EntryType) => {
        return Promise.resolve(entryType === 'file' ? params?.files : []);
      },
      getPublicPath: (fileLocation: EntryLocation) => Promise.resolve(fileLocation.getFullUri()),
      //@ts-ignore
      getDeserializedObject: params?.getDeserializedObject ?? defaultGetDeserialized,
    };
  };

  [undefined, null, ''].forEach((projectPath) => {
    it('throws if project path is not passed', () => {
      expect(getProject({ projectPath }, getMockDeps())).rejects.toThrowError(
        InvalidParameterError.withGenericMessage('projectPath', projectPath),
      );
    });
  });

  it('returns project with original and edits in processed status', async () => {
    const projectPath = `projects/${id}-processed-on-zoom-2005-03-03-12-54`;
    const files = [
      new EntryLocation(
        `projects/${id}-processed-on-zoom-2005-03-03-12-54/original/master-footage.mp4`,
      ),
      new EntryLocation(`projects/${id}-processed-on-zoom-2005-03-03-12-54/clip1/file1.mp4`),
      new EntryLocation(`projects/${id}-processed-on-zoom-2005-03-03-12-54/clip1/edit.json`),
      new EntryLocation(`projects/${id}-processed-on-zoom-2005-03-03-12-54/clip2/file2.mp4`),
      new EntryLocation(`projects/${id}-processed-on-zoom-2005-03-03-12-54/clip2/timestamps.json`),
      new EntryLocation(`projects/${id}-processed-on-zoom-2005-03-03-12-54/${PROJECT_INFO_FILE}`),
    ];

    const result = await getProject(
      { projectPath },
      getMockDeps({
        files,
        getDeserializedObject: () =>
          //@ts-ignore
          Promise.resolve({
            projectName: 'Processed On Zoom',
          }),
      }),
    );
    expect(result).toStrictEqual({
      id,
      name: 'Processed On Zoom',
      created: new Date('2005-03-03 12:54'),
      original: { id: 'original', name: 'Original', fullPath: files[0].getFullUri() },
      edits: [
        { id: 'clip1', name: 'Clip1', fullPath: files[1].getFullUri(), status: 'Processed' },
        { id: 'clip2', name: 'Clip2', fullPath: files[3].getFullUri(), status: 'Processed' },
      ],
    });
  });

  it('returns edits in "Processing" status', async () => {
    const projectPath = `projects/${id}-processed-on-zoom-2021-01-02-01-14`;
    const files = [
      new EntryLocation(
        `projects/${id}-processed-on-zoom-2021-01-02-01-14/original/master-footage.mp4`,
      ),
      new EntryLocation(`projects/${id}-processed-on-zoom-2021-01-02-01-14/top-and-tail/edit.json`),
      new EntryLocation(`projects/${id}-processed-on-zoom-2021-01-02-01-14/${PROJECT_INFO_FILE}`),
    ];

    const result = await getProject(
      { projectPath },
      getMockDeps({
        files,
        getDeserializedObject: () =>
          //@ts-ignore
          Promise.resolve({
            projectName: 'Processed On Zoom',
            name: 'Top And Tail',
            type: 'top-and-tail',
            status: 'Processing',
            timing: { start: 3, end: 4 },
            lastModifiedDate: new Date(),
            history: [],
          }),
      }),
    );

    expect(result).toStrictEqual({
      id,
      name: 'Processed On Zoom',
      created: new Date('2021-01-02 01:14'),
      original: { id: 'original', name: 'Original', fullPath: files[0].getFullUri() },
      edits: [
        {
          id: 'top-and-tail',
          name: 'Top And Tail',
          status: 'Processing',
          timing: { start: 3, end: 4 },
        },
      ],
    });
  });

  it('returns edits in "InReview" status', async () => {
    const projectPath = `projects/${id}-processed-on-zoom-2021-01-02-01-14`;
    const files = [
      new EntryLocation(
        `projects/${id}-processed-on-zoom-2021-01-02-01-14/original/master-footage.mp4`,
      ),
      new EntryLocation(`projects/${id}-processed-on-zoom-2021-01-02-01-14/edit1/timestamps.json`),
      new EntryLocation(`projects/${id}-processed-on-zoom-2021-01-02-01-14/edit2/timestamps.json`),
      new EntryLocation(`projects/${id}-processed-on-zoom-2022-10-18-08-10/clip3/file3.TXT`),
      new EntryLocation(`projects/${id}-processed-on-zoom-2022-10-18-08-10/${PROJECT_INFO_FILE}`),
    ];

    const result = await getProject(
      { projectPath },
      getMockDeps({
        files,
        getDeserializedObject: getJsonData,
      }),
    );
    expect(result).toStrictEqual({
      id,
      name: 'Processed On Zoom',
      created: new Date('2021-01-02 01:14'),
      original: { id: 'original', name: 'Original', fullPath: files[0].getFullUri() },
      edits: [
        { id: 'edit1', name: 'Edit1', status: 'InReview', timing: { start: 10, end: 20 } },
        { id: 'edit2', name: 'Edit2', status: 'InReview', timing: { start: 10, end: 20 } },
      ],
    });
  });

  it("returns the project name using the folder name if the info.json doesn't exist", async () => {
    const projectPath = `projects/${id}-meeting-from-zoom-2021-01-02-01-14`;
    const files = [
      new EntryLocation(
        `projects/${id}-meeting-from-zoom-2021-01-02-01-14/original/master-footage.mp4`,
      ),
      new EntryLocation(`projects/${id}-meeting-from-zoom-2021-01-02-01-14/edit1/timestamps.json`),
      new EntryLocation(`projects/${id}-meeting-from-zoom-2021-01-02-01-14/edit2/timestamps.json`),
      new EntryLocation(`projects/${id}-meeting-from-zoom-2022-10-18-08-10/clip3/file3.TXT`),
    ];

    const result = await getProject(
      { projectPath },
      getMockDeps({
        files,
      }),
    );
    expect(result).toStrictEqual({
      id,
      name: 'Meeting From Zoom',
      created: new Date('2021-01-02 01:14'),
      original: { id: 'original', name: 'Original', fullPath: files[0].getFullUri() },
      edits: [
        { id: 'edit1', name: 'Edit1', status: 'InReview', timing: { start: 10, end: 20 } },
        { id: 'edit2', name: 'Edit2', status: 'InReview', timing: { start: 10, end: 20 } },
      ],
    });
  });
});
