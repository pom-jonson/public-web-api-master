import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GET_PROJECT_BUCKET } from '../../../runtime-config';
import createVideoTrimmingJob from '../../adapters/media-editing/create-video-trimming-job';
import listEntries from '../../adapters/storage/list-entries';
import { putSerializedObject } from '../../adapters/storage/put-serialized-object';
import Clip from '../../entities/clip';
import EntryLocation from '../../entities/entry-location';
import Project from '../../entities/project';
import listAssets from '../../use-cases/assets/list-assets';
import requestClipProcessing from '../../use-cases/clips/request-clip-processing';
import getProjectPath from '../../use-cases/projects/get-project-path';
import updateVideoEdit from '../../use-cases/video-edits/update-video-edit';
import executeAuthenticatedCallback from '../middleware/execute-callback';

interface ProcessTopAndTailPayload {
  start: number;
  end: number;
  enhanceVideo: boolean;
}

const validationRules = {
  start: 'required|numeric',
  end: 'required|numeric',
};

const processTopAndTailCallback = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> =>
  await executeAuthenticatedCallback(
    event,
    async (
      identity,
      { id }: { id: string },
      { end, start, enhanceVideo }: ProcessTopAndTailPayload,
    ) => {
      const projectPath = await getProjectPath(
        { customerEmail: identity.email, id },
        { bucket: GET_PROJECT_BUCKET(), listEntries },
      );
      const project = Project.fromLocation(new EntryLocation(projectPath));
      const originalClip = Clip.getOriginal(project.getClipsLocation());

      const assets = await listAssets(
        { customerEmail: identity.email },
        {
          accountBucketPrefix: GET_PROJECT_BUCKET(),
          listEntries,
          getPath: (location) => Promise.resolve(location.getFullPath()),
        },
      );

      const result = {
        body: await requestClipProcessing(
          {
            sourceFilePath: originalClip.location.getFullPath(),
            outputType: 'top-and-tail',
          },
          {
            createProcessingJob: (command) =>
              createVideoTrimmingJob({
                ...command,
                enhanceVideo: !!enhanceVideo,
                introFilePath: assets?.intro?.path,
                outroFilePath: assets?.outro?.path,
                timing: { end, start },
              }),
          },
        ),
        statusCode: 202,
      };

      const videoEditPath = originalClip.location.getModification('top-and-tail', 2).getFullPath();
      await updateVideoEdit(
        { folderPath: videoEditPath, status: 'Processing', timing: { end, start } },
        { putSerializedObject },
      );

      return result;
    },
    validationRules,
  );

export default processTopAndTailCallback;
