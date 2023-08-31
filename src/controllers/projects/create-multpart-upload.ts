import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GET_PROJECT_BUCKET } from '../../../runtime-config';
import { getSignedUploadPartUrl } from '../../adapters/storage/get-signed-url';
import { putSerializedObject } from '../../adapters/storage/put-serialized-object';
import executeAuthenticatedCallback from '../middleware/execute-callback';
import createProjectMultipartUpload from '../../use-cases/projects/create-project-multipart-upload';
import { createMultipartUpload } from '../../adapters/storage/create-multipart-upload';
export interface CreateProjectMultipartUploadPayload {
  fileName: string;
  partCount: number;
}

const createProjectMultipartUploadCallback = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> =>
  await executeAuthenticatedCallback(
    event,
    async (
      identity,
      params: unknown,
      { fileName, partCount }: CreateProjectMultipartUploadPayload,
    ) => {
      return {
        body: await createProjectMultipartUpload(
          {
            customerEmail: identity.email,
            fileName,
            partCount,
          },
          {
            bucket: GET_PROJECT_BUCKET(),
            createMultipartUpload,
            getSignedUploadPartUrl,
            putSerializedObject,
          },
        ),
      };
    },
  );

export default createProjectMultipartUploadCallback;
