import EntryLocation from '../../entities/entry-location';
import Timing from '../../entities/timing';
import VideoEdit, { VideoEditingStatus } from '../../entities/video-edit';
import VideoEditingType from '../../entities/video-editing-type';
import { verifyParam } from '../../utils';

export interface UpdateVideoEditCM {
  folderPath: string;
  status: VideoEditingStatus;
  timing: Timing;
}

export interface Dependencies {
  putSerializedObject(objectPath: string, object: unknown): Promise<void>;
}

interface ResultVM {
  name: string;
  type: VideoEditingType;
  status: VideoEditingStatus;
  timing: Timing;
  lastModifiedDate: Date;
}

export default async function updateVideoEdit(
  { folderPath, status, timing }: UpdateVideoEditCM,
  { putSerializedObject }: Dependencies,
): Promise<ResultVM> {
  verifyParam(folderPath, 'folderPath');
  verifyParam(status, 'status');
  verifyParam(timing, 'timing');

  const folderLocation = new EntryLocation(folderPath);
  const type = folderLocation.getFolder() as VideoEditingType;
  const videoEdit = new VideoEdit({ type, status, timing });

  const filePath = VideoEdit.getEditLocation(folderLocation).getFullPath();
  await putSerializedObject(filePath, videoEdit);

  return videoEdit;
}
