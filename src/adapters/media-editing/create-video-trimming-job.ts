import * as AWS from 'aws-sdk';
import {
  GET_ECS_TRIMMING_TASK_SECURITY_GROUP,
  GET_ECS_TRIMMING_TASK_SUBNET,
} from '../../../runtime-config';
import EntryLocation from '../../entities/entry-location';
import configureAwsCredentials from '../configuration';

interface TrimVideoParams {
  sourceFilePath: string;
  outputFilePath: string;
  timing: { start: number; end: number };
  introFilePath?: string;
  outroFilePath?: string;
  enhanceVideo?: boolean;
}

export interface VideoTrimmingJobRequest {
  jobName: string;
  outputFolderUri: string;
  outputFileName: string;
}

export default async function createVideoTrimmingJob({
  sourceFilePath,
  outputFilePath,
  timing: { start, end },
  introFilePath,
  outroFilePath,
  enhanceVideo,
}: TrimVideoParams): Promise<void> {
  configureAwsCredentials();

  const ecs = new AWS.ECS();

  const command = [
    '--video-input',
    sourceFilePath,
    '--start-timestamp',
    String(start),
    '--end-timestamp',
    String(end),
    '--video-output',
    outputFilePath,
  ];

  if (introFilePath) {
    command.push(`--intro-${getFileType(introFilePath)}`);
    command.push(introFilePath);
  }

  if (outroFilePath) {
    command.push(`--outro-${getFileType(outroFilePath)}`);
    command.push(outroFilePath);
  }

  if (enhanceVideo) {
    command.push('--enhance-video');
  }

  await ecs
    .runTask({
      cluster: 'fargate-clu',
      taskDefinition: 'top-and-tail',
      launchType: 'FARGATE',
      networkConfiguration: {
        awsvpcConfiguration: {
          subnets: [GET_ECS_TRIMMING_TASK_SUBNET()],
          securityGroups: [GET_ECS_TRIMMING_TASK_SECURITY_GROUP()],
          assignPublicIp: 'ENABLED',
        },
      },
      overrides: {
        containerOverrides: [
          {
            command,
            name: 'top-and-tail',
          },
        ],
      },
    })
    .promise();
}

export function getFileType(path: string): string {
  const entryLocation = new EntryLocation(path);
  if (entryLocation.getFileExtension() === 'png') {
    return 'image';
  }
  return 'video';
}
