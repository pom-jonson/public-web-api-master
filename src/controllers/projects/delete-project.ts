import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import executeAuthenticatedCallback from '../middleware/execute-callback';
import listEntries from '../../adapters/storage/list-entries';
import { GET_PROJECT_BUCKET } from '../../../runtime-config';
import getProjectPath from '../../use-cases/projects/get-project-path';
import deleteProject from '../../use-cases/projects/delete-project';
import { deleteObject } from '../../adapters/storage/delete-object';

export const deleteProjectCallback = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> =>
  await executeAuthenticatedCallback(event, async (identity, { id }: { id: string }) => {
    const projectPath = await getProjectPath(
      { customerEmail: identity.email, id },
      { bucket: GET_PROJECT_BUCKET(), listEntries },
    );
    return {
      body: await deleteProject({ projectPath }, { listEntries, deleteObject }),
    };
  });
