import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import executeAuthenticatedCallback from '../middleware/execute-callback';
import getProjectPath from '../../use-cases/projects/get-project-path';
import { GET_PROJECT_BUCKET } from '../../../runtime-config';
import listEntries from '../../adapters/storage/list-entries';
import { getDeserializedObject } from '../../adapters/storage/get-deserialized-object';
import updateProjectVideoTranscript from '../../use-cases/projects/update-project-video-transcript';
import { putSerializedObject } from '../../adapters/storage/put-serialized-object';

interface UpdateProjectVideoTranscriptPayload {
  transcript: string;
  items: TranscriptItemVM[];
}

interface TranscriptItemVM {
  start: number;
  end: number;
  text: string | null;
  type: string;
  alternatives: {
    confidence: string;
    content: string;
  }[];
}

export const updateProjectVideoTranscriptCallback = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> =>
  await executeAuthenticatedCallback(
    event,
    async (
      identity,
      { id, videoId }: { id: string; videoId: string },
      { transcript, items }: UpdateProjectVideoTranscriptPayload,
    ) => {
      const projectPath = await getProjectPath(
        { customerEmail: identity.email, id },
        { bucket: GET_PROJECT_BUCKET(), listEntries },
      );

      const videoPath = `${projectPath}/processed/${videoId}`;

      return {
        body: await updateProjectVideoTranscript(
          { videoPath, transcript, items },
          { getDeserializedObject, putSerializedObject, listEntries },
        ),
      };
    },
  );
