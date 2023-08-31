import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GET_PROJECT_BUCKET } from '../../../runtime-config';
import { getSignedUploadUrl } from '../../adapters/storage/get-signed-url';
import { putSerializedObject } from '../../adapters/storage/put-serialized-object';
import executeAuthenticatedCallback from '../middleware/execute-callback';
import createProjectUpload from '../../use-cases/projects/create-project-upload';
export interface ParsedPayload {
  fileName: string;
}

const createProjectUploadCallback = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> =>
  await executeAuthenticatedCallback(
    event,
    async (identity, params: unknown, { fileName }: ParsedPayload) => {
      return {
        body: await createProjectUpload(
          {
            fileName,
            customerEmail: identity.email,
          },
          {
            bucket: GET_PROJECT_BUCKET(),
            getSignedUploadUrl,
            putSerializedObject,
          },
        ),
        statusCode: 200,
      };
    },
  );

export default createProjectUploadCallback;
