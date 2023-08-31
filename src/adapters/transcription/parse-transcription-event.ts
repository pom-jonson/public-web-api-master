import * as AWS from 'aws-sdk';
import InvalidRequestError from '../../controllers/middleware/invalid-request-error';
import EntryLocation from '../../entities/entry-location';
import configureAwsCredentials from '../configuration';
import handleAwsCallback from '../utils';

export interface TranscriptionCompletedEvent {
  folderPath: string;
}

interface RawTranscriptionEvent {
  detail: {
    TranscriptionJobStatus: string;
    TranscriptionJobName: string;
  };
}

export async function parseTranscriptionEvent(
  rawEvent: unknown,
): Promise<TranscriptionCompletedEvent> {
  const event = rawEvent as RawTranscriptionEvent;
  if (!event || event.detail?.TranscriptionJobStatus !== 'COMPLETED') {
    throw new InvalidRequestError('Transcription event could not be parsed.');
  }

  const fileUri = await getTranscriptionJobOutput(event.detail.TranscriptionJobName);
  const location = new EntryLocation(fileUri);

  return {
    folderPath: location.getFolderPath(),
  };
}

async function getTranscriptionJobOutput(jobName: string): Promise<string> {
  configureAwsCredentials();
  const transcribe = new AWS.TranscribeService();

  return await handleAwsCallback(async () => {
    const job = await transcribe.getTranscriptionJob({ TranscriptionJobName: jobName }).promise();
    return job.TranscriptionJob.Transcript.TranscriptFileUri;
  });
}
