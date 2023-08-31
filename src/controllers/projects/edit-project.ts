import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import executeAuthenticatedCallback from '../middleware/execute-callback';
import listEntries from '../../adapters/storage/list-entries';
import { GET_PROJECT_BUCKET } from '../../../runtime-config';
import updateProject from '../../use-cases/projects/update-project';
import { putSerializedObject } from '../../adapters/storage/put-serialized-object';
import getProjectPath from '../../use-cases/projects/get-project-path';

interface EditProjectPayload {
  name: string;
}

const validationRules = {
  name: 'required|max:200',
};

export const editProjectCallback = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> =>
  await executeAuthenticatedCallback(
    event,
    async (identity, { id }: { id: string }, { name }: EditProjectPayload) => {
      const projectPath = await getProjectPath(
        { customerEmail: identity.email, id },
        { bucket: GET_PROJECT_BUCKET(), listEntries },
      );
      const { result } = await updateProject({ projectPath, name }, { putSerializedObject });
      return { statusCode: result ? 200 : 208 };
    },
    validationRules,
  );
