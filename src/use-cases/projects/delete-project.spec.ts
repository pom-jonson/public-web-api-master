/* eslint-disable @typescript-eslint/ban-ts-comment */
import EntryLocation from '../../entities/entry-location';
import deleteProject from './delete-project';
import { Dependencies } from './delete-project';
import { PROJECT_INFO_FILE } from '../../entities/project';

describe('delete project', () => {
  const id = 'lw0bq1';

  const getMockDeps = (files: EntryLocation[]): Dependencies => {
    return {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      listEntries: (_: EntryLocation) => {
        return Promise.resolve(files);
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      deleteObject: (_: EntryLocation) => {
        return Promise.resolve();
      },
    };
  };

  it('returns void upon project deletion', async () => {
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

    const result = await deleteProject({ projectPath }, getMockDeps(files));
    expect(result).toBeFalsy();
  });
});
