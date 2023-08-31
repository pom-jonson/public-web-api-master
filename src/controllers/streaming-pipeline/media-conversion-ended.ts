import { APIGatewayProxyResult } from 'aws-lambda';
import { executeCallback } from '../middleware/execute-callback';
import { parseMediaConvertingEvent } from '../../adapters/media-converting/parse-media-converting-event';
import requestClipTranscription from '../../use-cases/clips/request-clip-transcription';
import createTranscriptionJob from '../../adapters/transcription/create-transcription-job';

const mediaConversionEndedCallback = async (event: unknown): Promise<APIGatewayProxyResult> =>
  await executeCallback(async () => {
    return await requestClipTranscription(
      {
        ...parseMediaConvertingEvent(event),
      },
      { createTranscriptionJob },
    );
  }, 202);

export default mediaConversionEndedCallback;
