import CustomerAccount from '../../entities/customer-account';
import Project from '../../entities/project';
import Clip from '../../entities/clip';
import EntryLocation from '../../entities/entry-location';

export interface Dependencies {
  bucket: string;
  getSignedUploadUrl(fileLocation: EntryLocation): Promise<string>;
  putSerializedObject(objectPath: string, object: unknown): Promise<void>;
}

interface CreateProjectUploadParams {
  customerEmail: string;
  fileName: string;
}

export interface CreateProjectUploadResult {
  url: string;
  id: string;
}

export default async function createProjectUpload(
  { customerEmail, fileName }: CreateProjectUploadParams,
  { bucket, getSignedUploadUrl, putSerializedObject }: Dependencies,
): Promise<CreateProjectUploadResult> {
  const customerAccount = CustomerAccount.fromEmail(bucket, customerEmail);

  const project = Project.createNew(
    customerAccount.getProjectsLocation(),
    'uploaded-on',
    new Date(),
  );

  const clip = Clip.getOriginal(project.getClipsLocation());

  await putSerializedObject(
    project.getProjectInfoFile().getFullPath(),
    project.createNewProjectInfo(fileName),
  );

  return {
    url: await getSignedUploadUrl(clip.location),
    id: project.id,
  };
}
