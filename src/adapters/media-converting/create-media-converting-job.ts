/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import * as AWS from 'aws-sdk';
import jobRequest from './job-request.json';
import jobRequestSingleOutput from './job-request-single-output.json';
import handleAwsCallback from '../utils';
import configureAwsCredentials from '../configuration';
import { GET_MEDIA_CONVERT_ENDPOINT, GET_MEDIA_CONVERT_ROLE } from '../../../runtime-config';
import EntryLocation from '../../entities/entry-location';
import { addPostfix } from '../../utils';

const LOWRES_SETTINGS = {
  Width: 426,
  Height: 240,
};
export interface MediaConvertingJobRequest {
  jobId: string;
  nameModifier?: string;
  outputFolderUri?: string;
}

export default async function createMediaConvertingJob(
  inputFileLocation: EntryLocation,
  outputFileLocation: EntryLocation,
  lowResOutputFileLocation: EntryLocation,
): Promise<MediaConvertingJobRequest> {
  configureAwsCredentials();
  const mediaConvert = new AWS.MediaConvert({
    endpoint: GET_MEDIA_CONVERT_ENDPOINT(),
    apiVersion: '2017-08-29',
  });

  const inputFileStem = inputFileLocation.getFileStem();
  const outputFileStem = outputFileLocation.getFileStem();
  const nameModifier = outputFileStem.replace(inputFileStem, '');
  const outputFolderUri = addPostfix(outputFileLocation.getFolderUri(), '/');
  const lowResOutputFolderUri = addPostfix(lowResOutputFileLocation.getFolderUri(), '/');
  const jobRequestObj = { ...jobRequest };

  return await handleAwsCallback(async () => {
    jobRequestObj.Role = GET_MEDIA_CONVERT_ROLE();
    jobRequestObj.Settings.Inputs[0].FileInput = inputFileLocation.getFullUri();

    // 240p proxy output
    jobRequestObj.Settings.OutputGroups[0].Outputs[0].NameModifier = nameModifier;
    jobRequestObj.Settings.OutputGroups[0].OutputGroupSettings.FileGroupSettings.Destination =
      lowResOutputFolderUri;
    (jobRequestObj.Settings.OutputGroups[0].Outputs[0].VideoDescription as any).Height =
      LOWRES_SETTINGS.Height;
    (jobRequestObj.Settings.OutputGroups[0].Outputs[0].VideoDescription as any).Width =
      LOWRES_SETTINGS.Width;

    // Original output
    jobRequestObj.Settings.OutputGroups[1].Outputs[0].NameModifier = nameModifier;
    jobRequestObj.Settings.OutputGroups[1].OutputGroupSettings.FileGroupSettings.Destination =
      outputFolderUri;

    console.log(
      jobRequestObj.Settings.OutputGroups[0].Outputs[0].VideoDescription.CodecSettings,
      'test',
    );
    const job = await mediaConvert.createJob(jobRequestObj).promise();
    return { jobId: job.Job.Id, nameModifier, outputFolderUri };
  });
}

export async function createMediaConvertingJobFromFile(
  inputFileLocation: EntryLocation,
  outputFileLocation: EntryLocation,
  shouldConvertToLowRes?: boolean,
): Promise<MediaConvertingJobRequest> {
  const mediaConvert = new AWS.MediaConvert({
    endpoint: GET_MEDIA_CONVERT_ENDPOINT(),
    apiVersion: '2017-08-29',
  });

  const jobRequestObj = { ...jobRequestSingleOutput };

  return await handleAwsCallback(async () => {
    jobRequestObj.Settings.Inputs[0].FileInput = inputFileLocation.getFullUri();
    jobRequestObj.Settings.OutputGroups[0].OutputGroupSettings.FileGroupSettings.Destination =
      addPostfix(outputFileLocation.getFolderUri(), '/');
    jobRequestObj.Role = GET_MEDIA_CONVERT_ROLE();

    if (shouldConvertToLowRes) {
      (jobRequestObj.Settings.OutputGroups[0].Outputs[0].VideoDescription as any).Height =
        LOWRES_SETTINGS.Height;
      (jobRequestObj.Settings.OutputGroups[0].Outputs[0].VideoDescription as any).Width =
        LOWRES_SETTINGS.Width;
    }

    console.log(
      jobRequestObj.Settings.OutputGroups[0].Outputs[0].VideoDescription.CodecSettings,
      'test',
    );
    const job = await mediaConvert.createJob(jobRequestObj).promise();
    return { jobId: job.Job.Id };
  });
}
