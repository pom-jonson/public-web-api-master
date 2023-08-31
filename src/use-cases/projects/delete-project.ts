import EntryLocation, { EntryType } from '../../entities/entry-location';
import { verifyParam } from '../../utils';

export interface Dependencies {
  listEntries(
    folderLocation: EntryLocation,
    entryType: EntryType,
    includeRoot?: boolean,
    includeLowRes?: boolean,
  ): Promise<EntryLocation[]>;
  deleteObject(fileLocation: EntryLocation): Promise<void>;
}

export interface ProjectQM {
  projectPath: string;
}

export default async function deleteProject(
  { projectPath }: ProjectQM,
  { listEntries, deleteObject }: Dependencies,
): Promise<void> {
  verifyParam(projectPath, 'projectPath');

  const projectLocation = new EntryLocation(projectPath);
  const files = await listEntries(projectLocation, 'file', false, true);
  await Promise.all(files.map((file) => deleteObject(file)));
}
