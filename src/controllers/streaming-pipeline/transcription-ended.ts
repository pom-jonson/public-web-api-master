import { APIGatewayProxyResult } from 'aws-lambda';
import createMediaRecognitionJob from '../../adapters/media-editing/create-media-recognition-job';
import listEntries from '../../adapters/storage/list-entries';
import { parseTranscriptionEvent } from '../../adapters/transcription/parse-transcription-event';
import getClipPath from '../../use-cases/clips/get-clip-path';
import requestClipProcessing from '../../use-cases/clips/request-clip-processing';
import { executeCallback } from '../middleware/execute-callback';

const transcriptionEndedCallback = async (event: unknown): Promise<APIGatewayProxyResult> =>
  await executeCallback(async () => {
    const parsedEvent = await parseTranscriptionEvent(event);
    const sourceFilePath = await getClipPath({ ...parsedEvent }, { listEntries });
    return await requestClipProcessing(
      { sourceFilePath, outputType: 'top-and-tail' },
      { createProcessingJob: createMediaRecognitionJob },
    );
  }, 202);

export default transcriptionEndedCallback;
