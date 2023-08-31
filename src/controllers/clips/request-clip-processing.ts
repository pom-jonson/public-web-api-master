import { APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda';
import { GET_PROJECT_BUCKET } from '../../../runtime-config';
import listEntries from '../../adapters/storage/list-entries';
import getProjectPath from '../../use-cases/projects/get-project-path';
import executeAuthenticatedCallback from '../middleware/execute-callback';
import Project from '../../entities/project';
import Clip from '../../entities/clip';
import EntryLocation from '../../entities/entry-location';
import { createMediaConvertingJobFromFile } from '../../adapters/media-converting/create-media-converting-job';

export interface ClipProcessingPayload {
  id: string;
}

const requestClipProcessingCallback = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> =>
  await executeAuthenticatedCallback(event, async (identity, { id }: ClipProcessingPayload) => {
    const projectPath = await getProjectPath(
      { customerEmail: identity.email, id },
      { bucket: GET_PROJECT_BUCKET(), listEntries },
    );

    const project = Project.fromLocation(new EntryLocation(projectPath));
    const originalClip = Clip.getOriginal(project.getClipsLocation());
    const lowResClip = Clip.getLowerResolution(project.getClipsLocation());

    const result = await createMediaConvertingJobFromFile(
      originalClip.location,
      lowResClip.location,
      true,
    );

    return {
      body: { jobId: result.jobId },
      statusCode: 202,
    };
  });

export default requestClipProcessingCallback;
