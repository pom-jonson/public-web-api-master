import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GET_PROJECT_BUCKET } from '../../../runtime-config';
import { getPublicPath } from '../../adapters/storage/get-public-path';
import listEntries from '../../adapters/storage/list-entries';
import listAssets from '../../use-cases/assets/list-assets';
import executeAuthenticatedCallback from '../middleware/execute-callback';

const listAssetsCallback = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> =>
  await executeAuthenticatedCallback(event, async (identity) => {
    return {
      body: await listAssets(
        {
          customerEmail: identity.email,
        },
        {
          accountBucketPrefix: GET_PROJECT_BUCKET(),
          getPath: getPublicPath,
          listEntries,
        },
      ),
      statusCode: 200,
    };
  });

export default listAssetsCallback;
