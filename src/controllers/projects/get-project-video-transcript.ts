import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import executeAuthenticatedCallback from '../middleware/execute-callback';
import getProjectPath from '../../use-cases/projects/get-project-path';
import { GET_PROJECT_BUCKET } from '../../../runtime-config';
import listEntries from '../../adapters/storage/list-entries';
import getProjectVideoTranscript from '../../use-cases/projects/get-project-video-transcript';
import { getDeserializedObject } from '../../adapters/storage/get-deserialized-object';

export const getProjectVideoTranscriptCallback = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> =>
  await executeAuthenticatedCallback(
    event,
    async (identity, { id, videoId }: { id: string; videoId: string }) => {
      const projectPath = await getProjectPath(
        { customerEmail: identity.email, id },
        { bucket: GET_PROJECT_BUCKET(), listEntries },
      );

      const videoPath = `${projectPath}/processed/${videoId}`;

      return {
        body: await getProjectVideoTranscript(
          { videoPath },
          { getDeserializedObject, listEntries },
        ),
      };
    },
  );
