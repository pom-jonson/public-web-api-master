import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import executeAuthenticatedCallback from '../middleware/execute-callback';
import listEntries from '../../adapters/storage/list-entries';
import { getPublicPath } from '../../adapters/storage/get-public-path';
import { GET_PROJECT_BUCKET } from '../../../runtime-config';
import getProject from '../../use-cases/projects/get-project';
import getProjectPath from '../../use-cases/projects/get-project-path';
import { getDeserializedObject } from '../../adapters/storage/get-deserialized-object';

export const getProjectCallback = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> =>
  await executeAuthenticatedCallback(event, async (identity, { id }: { id: string }) => {
    const projectPath = await getProjectPath(
      { customerEmail: identity.email, id },
      { bucket: GET_PROJECT_BUCKET(), listEntries },
    );
    return {
      body: await getProject(
        { projectPath },
        { listEntries, getPublicPath, getDeserializedObject },
      ),
    };
  });
