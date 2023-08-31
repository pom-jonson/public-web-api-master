import * as AWS from 'aws-sdk';
import {
  GET_ECS_TRIMMING_TASK_SECURITY_GROUP,
  GET_ECS_TRIMMING_TASK_SUBNET,
} from '../../../runtime-config';
import configureAwsCredentials from '../configuration';
import EntryLocation from '../../entities/entry-location';

interface CreateMediaRecognitionJobParams {
  sourceFilePath: string;
  outputFilePath: string;
  transcriptionPath: string;
}

export interface MediaEditingJobRequest {
  jobName: string;
  outputFolderUri: string;
  outputFileName: string;
}

export default async function createMediaRecognitionJob({
  sourceFilePath,
  outputFilePath,
  transcriptionPath,
}: CreateMediaRecognitionJobParams): Promise<void> {
  configureAwsCredentials();

  const timestampsFolder = new EntryLocation(outputFilePath).getTimestampFile();

  const command = [
    '--video-uri',
    sourceFilePath,
    '--transcript-uri',
    transcriptionPath,
    '--time-stamp-uri',
    timestampsFolder,
  ];

  await new AWS.ECS()
    .runTask({
      cluster: 'fargate-clu',
      taskDefinition: 'top-and-tail-ai',
      launchType: 'FARGATE',
      networkConfiguration: {
        awsvpcConfiguration: {
          subnets: [GET_ECS_TRIMMING_TASK_SUBNET()],
          securityGroups: [GET_ECS_TRIMMING_TASK_SECURITY_GROUP()],
          assignPublicIp: 'DISABLED',
        },
      },
      overrides: {
        containerOverrides: [
          {
            command,
            name: 'top-and-tail-ai',
          },
        ],
      },
    })
    .promise();
}
