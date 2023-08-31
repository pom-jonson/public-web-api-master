import * as AWS from 'aws-sdk';
import EntryLocation, { LOWRES_FOLDER } from '../../entities/entry-location';
import { newId } from '../../utils';
import configureAwsCredentials from '../configuration';
import handleAwsCallback from '../utils';

export interface TranscriptionJobRequest {
  jobName: string;
  fileKey: string;
}

export default async function createTranscriptionJob(
  inputFileLocation: EntryLocation,
  outputFileLocation: EntryLocation,
): Promise<TranscriptionJobRequest> {
  configureAwsCredentials();
  const transcribe = new AWS.TranscribeService();

  const jsonFileKey = outputFileLocation.key
    .replace(`${LOWRES_FOLDER}/`, '')
    .replace(`${LOWRES_FOLDER}`, '')
    .replace('.vtt', '.json');

  const jobName = `transcribe-${newId(10)}`;
  await handleAwsCallback(async () => {
    await transcribe
      .startTranscriptionJob({
        TranscriptionJobName: jobName,
        Media: { MediaFileUri: inputFileLocation.getFullUri() },
        LanguageCode: 'en-US',
        OutputBucketName: outputFileLocation.bucket,
        OutputKey: jsonFileKey,
        Subtitles: { Formats: [outputFileLocation.getFileExtension()] },
      })
      .promise();
  });

  return { jobName, fileKey: jsonFileKey };
}
