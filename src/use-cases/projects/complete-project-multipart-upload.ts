import CustomerAccount from '../../entities/customer-account';
import Project, { ProjectInfo } from '../../entities/project';
import Clip from '../../entities/clip';
import EntryLocation from '../../entities/entry-location';

import { completeMultipartUpload } from '../../adapters/storage/complete-multipart-upload';
import { getDeserializedObject } from '../../adapters/storage/get-deserialized-object';

export interface Dependencies {
  completeMultipartUpload(
    fileLocation: EntryLocation,
    uploadId: string,
    parts: { etag: string; partNumber: number }[],
  ): Promise<void>;
}

interface CompleteProjectMultipartUploadParams {
  projectPath: string;
  parts: { etag: string; partNumber: number }[];
}

export default async function completeProjectMultipartUpload(
  { projectPath, parts }: CompleteProjectMultipartUploadParams,
  { completeMultipartUpload }: Dependencies,
): Promise<void> {
  const projectLocation = new EntryLocation(projectPath);
  const project = Project.fromLocation(projectLocation);

  const originalVideo = Clip.getOriginal(project.getClipsLocation());

  const projectInfo = await getDeserializedObject<ProjectInfo>(project.getProjectInfoFile());

  await completeMultipartUpload(originalVideo.location, projectInfo.multipartUploadId!, parts);
}
