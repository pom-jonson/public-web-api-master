import CustomerAccount from '../../entities/customer-account';
import Project from '../../entities/project';
import Clip from '../../entities/clip';
import EntryLocation from '../../entities/entry-location';

export interface Dependencies {
  bucket: string;
  createMultipartUpload(fileLocation: EntryLocation): Promise<string>;
  getSignedUploadPartUrl(
    fileLocation: EntryLocation,
    uploadId: string,
    partNumber: number,
  ): Promise<string>;
  putSerializedObject(objectPath: string, object: unknown): Promise<void>;
}

interface CreateProjectMultipartUploadParams {
  customerEmail: string;
  fileName: string;
  partCount: number;
}

export interface CreateProjectMultipartUploadResult {
  id: string;
  urls: string[];
}

export default async function createProjectMultipartUpload(
  { customerEmail, fileName, partCount }: CreateProjectMultipartUploadParams,
  { bucket, createMultipartUpload, getSignedUploadPartUrl, putSerializedObject }: Dependencies,
): Promise<CreateProjectMultipartUploadResult> {
  const customerAccount = CustomerAccount.fromEmail(bucket, customerEmail);

  const project = Project.createNew(
    customerAccount.getProjectsLocation(),
    'uploaded-on',
    new Date(),
  );

  const originalVideo = Clip.getOriginal(project.getClipsLocation());

  const multipartUploadId = await createMultipartUpload(originalVideo.location);

  await putSerializedObject(
    project.getProjectInfoFile().getFullPath(),
    project.createNewProjectInfo(fileName, multipartUploadId),
  );

  const promises: Promise<string>[] = [];
  for (let index = 0; index < partCount; index++) {
    promises.push(getSignedUploadPartUrl(originalVideo.location, multipartUploadId, index + 1));
  }

  const signedUrls = await Promise.all(promises);

  return {
    id: project.id,
    urls: signedUrls,
  };
}
