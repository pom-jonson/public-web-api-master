import EntryLocation from '../../entities/entry-location';
import Project from '../../entities/project';
import { verifyParam } from '../../utils';

export interface Dependencies {
  putSerializedObject(objectPath: string, object: unknown): Promise<void>;
}

export interface UpdateProjectCM {
  projectPath: string;
  name: string;
}

export interface UpdateProjectResult {
  result: boolean;
}

export default async function updateProject(
  { projectPath, name }: UpdateProjectCM,
  { putSerializedObject }: Dependencies,
): Promise<UpdateProjectResult> {
  verifyParam(projectPath, 'projectPath');
  verifyParam(name, 'name');

  const projectLocation = new EntryLocation(projectPath);
  const project = Project.fromLocation(projectLocation);

  if (project.name.toLowerCase() === name.toLowerCase()) {
    return { result: false };
  }

  await putSerializedObject(
    project.getProjectInfoFile().getFullPath(),
    project.createNewProjectInfo(name),
  );

  return { result: true };
}
