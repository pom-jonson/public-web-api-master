import Clip from '../../entities/clip';
import EntryLocation, { EntryType } from '../../entities/entry-location';
import Project from '../../entities/project';
import { verifyParam } from '../../utils';
import VideoEdit, { VideoEditingStatus } from '../../entities/video-edit';
import VideoEditingType from '../../entities/video-editing-type';
import { ProjectInfo } from './list-projects';

export interface Dependencies {
  listEntries(
    folderLocation: EntryLocation,
    entryType: EntryType,
    includeRoot?: boolean,
  ): Promise<EntryLocation[]>;
  getPublicPath(fileLocation: EntryLocation): Promise<string>;
  getDeserializedObject<T>(fileLocation: EntryLocation): Promise<T>;
}

export interface GetProjectQM {
  projectPath: string;
}

export interface ClipVM {
  id: string;
  name: string;
  fullPath?: string;
}

export interface TimingVM {
  start: number;
  end: number;
}

export interface VideoEditVM extends ClipVM {
  status: VideoEditingStatus;
  timing?: TimingVM;
}

export interface ProjectVM {
  id: string;
  name: string;
  created: Date;
  original: ClipVM;
  edits: VideoEditVM[];
}

export default async function getProject(
  { projectPath }: GetProjectQM,
  { listEntries, getPublicPath, getDeserializedObject }: Dependencies,
): Promise<ProjectVM> {
  verifyParam(projectPath, 'projectPath');

  const projectLocation = new EntryLocation(projectPath);
  const project = Project.fromLocation(projectLocation);
  const files = await listEntries(projectLocation, 'file');

  const result: ProjectVM = {
    id: project.id,
    name: project.name,
    created: project.created,
    original: undefined,
    edits: [],
  };

  for (const file of files) {
    if (Clip.isClip(file)) {
      const clip = new Clip(file);

      const fullPath = await getPublicPath(file);
      const clipVm = { id: file.getFolder(), name: clip.name, fullPath } as ClipVM;

      clip.isOriginal()
        ? (result.original = { id: 'original', ...clipVm })
        : result.edits.push({ ...clipVm, status: 'Processed' });
    }
  }

  for (const file of files) {
    const edit: VideoEdit = VideoEdit.isEdit(file)
      ? await getDeserializedObject<VideoEdit>(file)
      : VideoEdit.isTiming(file)
      ? new VideoEdit({
          type: file.getFolder() as VideoEditingType,
          timing: await getDeserializedObject<TimingVM>(file),
        })
      : undefined;

    edit?.name &&
      !result.edits.some((el) => el.name === edit.name) &&
      result.edits.push(convertToVm(edit));
  }

  for (const file of files) {
    if (Project.isProjectInfo(file)) {
      const projectInfo = await getDeserializedObject<ProjectInfo>(project.getProjectInfoFile());

      result.name = projectInfo.projectName;
    }
  }

  return result;
}

const convertToVm = (edit: VideoEdit): VideoEditVM => {
  const { name, status, timing } = edit;
  return { id: edit.type, name, status, timing } as VideoEditVM;
};
