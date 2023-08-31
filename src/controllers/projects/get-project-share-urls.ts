import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import executeAuthenticatedCallback from '../middleware/execute-callback';
import getProjectPath from '../../use-cases/projects/get-project-path';
import { GET_PROJECT_BUCKET } from '../../../runtime-config';
import listEntries from '../../adapters/storage/list-entries';
import { getSharePath } from '../../adapters/storage/get-share-path';
import getProjectShareUrls from '../../use-cases/projects/get-project-share-urls';

export const getProjectShareUrlsCallback = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> =>
  await executeAuthenticatedCallback(event, async (identity, { id }: { id: string }) => {
    const projectPath = await getProjectPath(
      { customerEmail: identity.email, id },
      { bucket: GET_PROJECT_BUCKET(), listEntries },
    );

    return {
      body: await getProjectShareUrls({ projectPath }, { listEntries, getSharePath }),
    };
  });
