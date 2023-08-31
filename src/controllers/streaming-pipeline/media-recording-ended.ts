import { APIGatewayProxyResult } from 'aws-lambda';
import { executeCallback } from '../middleware/execute-callback';
import createMediaConvertingJob from '../../adapters/media-converting/create-media-converting-job';
import createProject from '../../use-cases/projects/create-project';
import { parseMediaRecordingEvent } from '../../adapters/media-recording/parse-media-recording-event';
import { putSerializedObject } from '../../adapters/storage/put-serialized-object';
import { getDeserializedObject } from '../../adapters/storage/get-deserialized-object';
import listEntries from '../../adapters/storage/list-entries';

const recordingEndedCallback = async (event: unknown): Promise<APIGatewayProxyResult> =>
  await executeCallback(async () => {
    return await createProject(
      { ...parseMediaRecordingEvent(event) },
      {
        createMediaConvertingJob,
        putSerializedObject,
        getDeserializedObject,
        listEntries,
      },
    );
  }, 202);

export default recordingEndedCallback;
