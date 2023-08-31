import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GET_PROJECT_BUCKET } from '../../../runtime-config';
import executeAuthenticatedCallback from '../middleware/execute-callback';
import completeProjectMultipartUpload from '../../use-cases/projects/complete-project-multipart-upload';
import { completeMultipartUpload } from '../../adapters/storage/complete-multipart-upload';
import getProjectPath from '../../use-cases/projects/get-project-path';
import listEntries from '../../adapters/storage/list-entries';

export interface CompleteProjectMultipartUploadParams {
  id: string;
}

export interface CompleteProjectMultipartUploadPayload {
  parts: { etag: string; partNumber: number }[];
}

const completeProjectMultipartUploadCallback = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> =>
  await executeAuthenticatedCallback(
    event,
    async (
      identity,
      { id }: CompleteProjectMultipartUploadParams,
      { parts }: CompleteProjectMultipartUploadPayload,
    ) => {
      const projectPath = await getProjectPath(
        { customerEmail: identity.email, id },
        { bucket: GET_PROJECT_BUCKET(), listEntries },
      );

      return {
        body: await completeProjectMultipartUpload(
          {
            projectPath,
            parts,
          },
          {
            completeMultipartUpload,
          },
        ),
        statusCode: 200,
      };
    },
  );

export default completeProjectMultipartUploadCallback;
