import CustomerAccount from '../../entities/customer-account';
import EntryLocation, { EntryType } from '../../entities/entry-location';
import Project from '../../entities/project';
import VideoEdit from '../../entities/video-edit';
import Clip from '../../entities/clip';

export interface Dependencies {
  bucket: string;
  listEntries(folderLocation: EntryLocation, entryType: EntryType): Promise<EntryLocation[]>;
  getDeserializedObject<T>(fileLocation: EntryLocation): Promise<T>;
}

interface ListProjectsQM {
  customerEmail: string;
}

export interface ListProjectVM {
  id: string;
  name: string;
  created: Date;
  original: VideoVM;
  edits: VideoVM[];
}

export interface VideoVM {
  id: string;
  name: string;
  status?: string | null;
}

export interface ProjectInfo {
  projectName: string;
  edit;
}

export default async function listProjects(
  { customerEmail }: ListProjectsQM,
  { bucket, listEntries, getDeserializedObject }: Dependencies,
): Promise<ListProjectVM[]> {
  const customerAccount = CustomerAccount.fromEmail(bucket, customerEmail);
  const projectsLocation = customerAccount.getProjectsLocation();

  let folders: EntryLocation[] = null;
  try {
    folders = await listEntries(projectsLocation, 'folder');
  } catch (e) {
    console.log(JSON.stringify(e));
    throw e;
  }

  const projects = folders.map((el) => Project.fromLocation(el));

  const projectsInformationPromises = projects.map(async (project) => {
    const files = await listEntries(project.location, 'file');
    const projectData: ListProjectVM = {
      id: project.id,
      name: project.name,
      created: project.created,
      original: null,
      edits: [],
    };

    for (const file of files) {
      if (Project.isProjectInfo(file)) {
        const projectInfo = await getDeserializedObject<ProjectInfo>(project.getProjectInfoFile());
        projectData.name = projectInfo.projectName;
      } else if (Clip.isClip(file)) {
        const clip = new Clip(file);
        if (clip.isOriginal()) {
          projectData.original = {
            id: 'original',
            name: 'Original',
          };
        }
      } else if (VideoEdit.isEdit(file)) {
        const edit = await getDeserializedObject<VideoEdit>(file);

        projectData.edits.push({
          id: edit.type,
          name: edit.name,
          status: edit.status,
        });
      }
    }

    return projectData;
  });

  const projectInformation = await Promise.all(projectsInformationPromises);

  return projectInformation.sort((a, b) => b.created.valueOf() - a.created.valueOf());
}
