import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import executeAuthenticatedCallback from '../middleware/execute-callback';
import listProjects from '../../use-cases/projects/list-projects';
import listEntries from '../../adapters/storage/list-entries';

import { getDeserializedObject } from '../../adapters/storage/get-deserialized-object';
import { GET_PROJECT_BUCKET } from '../../../runtime-config';

export const listProjectsCallback = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> =>
  await executeAuthenticatedCallback(event, async (identity) => {
    return {
      body: await listProjects(
        { customerEmail: identity.email },
        {
          bucket: GET_PROJECT_BUCKET(),
          listEntries,
          getDeserializedObject,
        },
      ),
    };
  });
