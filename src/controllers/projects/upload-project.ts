import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GET_PROJECT_BUCKET } from '../../../runtime-config';
import { getSignedUrl, SignedUrlOperations } from '../../adapters/storage/get-signed-url';
import { putSerializedObject } from '../../adapters/storage/put-serialized-object';
import getUploadProjectUrl from '../../use-cases/projects/get-upload-project-url';
import executeAuthenticatedCallback from '../middleware/execute-callback';
export interface ParsedPayload {
  fileName: string;
}

const getUploadProjectUrlCallback = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> =>
  await executeAuthenticatedCallback(
    event,
    async (identity, params: unknown, { fileName }: ParsedPayload) => {
      return {
        body: await getUploadProjectUrl(
          {
            fileName,
            customerEmail: identity.email,
          },
          {
            bucket: GET_PROJECT_BUCKET(),
            getSignedUploadUrl: (fileLocation) =>
              getSignedUrl(fileLocation, SignedUrlOperations.UPLOAD),
            putSerializedObject,
          },
        ),
        statusCode: 200,
      };
    },
  );

export default getUploadProjectUrlCallback;
