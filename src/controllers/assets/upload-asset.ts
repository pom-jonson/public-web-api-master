import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { GET_PROJECT_BUCKET } from '../../../runtime-config';
import { deleteObject } from '../../adapters/storage/delete-object';
import { getPublicPath } from '../../adapters/storage/get-public-path';
import listEntries from '../../adapters/storage/list-entries';
import { putObject } from '../../adapters/storage/put-object';
import uploadAsset from '../../use-cases/assets/upload-asset';
import executeAuthenticatedCallback from '../middleware/execute-callback';

export interface FilePayload {
  filename: string;
  content: Buffer;
  fieldname: string;
}

export interface ParsedPayload {
  files: FilePayload[];
}

const uploadAssetCallback = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> =>
  await executeAuthenticatedCallback(
    event,
    async (identity, { type }: { type: string }, { files }: ParsedPayload) => {
      const file = files.pop();
      return {
        body: await uploadAsset(
          {
            customerEmail: identity.email,
            file,
            type,
          },
          {
            bucket: GET_PROJECT_BUCKET(),
            getPublicPath,
            listEntries,
            deleteObject,
            putObject,
          },
        ),
        statusCode: 202,
      };
    },
  );

export default uploadAssetCallback;
