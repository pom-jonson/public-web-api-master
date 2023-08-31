/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/require-await */
import * as aws from '@pulumi/aws';
import * as awsx from '@pulumi/awsx';
import * as apigateway from '@pulumi/aws-apigateway';

import getEnvVariablesFromPulumiConfig from './infrastructure/configuration';
import buildApiRouteFromCallback from './infrastructure/pulumi/build-api-route';
import { listProjectsCallback } from './controllers/projects/list-projects';
import { getProjectCallback } from './controllers/projects/get-project';
import { deleteProjectCallback } from './controllers/projects/delete-project';
import { editProjectCallback } from './controllers/projects/edit-project';
import getProjectUploadUrlCallback from './controllers/projects/upload-project';
import createProjectUploadCallback from './controllers/projects/create-upload';
import createProjectMultipartUploadCallback from './controllers/projects/create-multpart-upload';
import completeProjectMultipartUploadCallback from './controllers/projects/complete-multpart-upload';
import { getStreamKeysCallback } from './controllers/stream-keys/get-stream-keys';
import { setUpUserCallback } from './controllers/user/set-up-user';
import requestClipProcessingCallback from './controllers/clips/request-clip-processing';
import { allowCorsCallback } from './controllers/allow-cors';
import subscribeCallbackToEvent from './infrastructure/pulumi/subscribe-callback-to-event';
import recordingEndedCallback from './controllers/streaming-pipeline/media-recording-ended';
import recordingEndedEventPattern from './adapters/events/patterns/recording-ended-event-pattern.json';
import mediaConversionEndedCallback from './controllers/streaming-pipeline/media-conversion-ended';
import mediaConversionEndedEventPattern from './adapters/events/patterns/media-conversion-ended-event-pattern.json';
import transcriptionEndedCallback from './controllers/streaming-pipeline/transcription-ended';
import transcriptionEndedEventPattern from './adapters/events/patterns/transcription-ended-event-pattern.json';
import ecsTaskStoppedEventPattern from './adapters/events/patterns/ecs-task-stopped-event-pattern.json';
import addCustomDomain from './infrastructure/pulumi/add-custom-domain';
import processTopAndTailCallback from './controllers/clips/process-top-and-tail';
import listAssetsCallback from './controllers/assets/list-assets';
import uploadAssetCallback from './controllers/assets/upload-asset';
import addSes from './infrastructure/pulumi/add-ses';
import getMainDomainDnsZone from './infrastructure/pulumi/get-main-domain-zone';
import { getStreamingUserCallback } from './controllers/streaming-user/get-streaming-user';
import ecsTopAndTailAiTaskStoppedCallback from './controllers/streaming-pipeline/ecs-top-and-tail-ai-task-stopped';
import { getProjectShareUrlsCallback } from './controllers/projects/get-project-share-urls';
import { getProjectVideoTranscriptCallback } from './controllers/projects/get-project-video-transcript';
import uploadVideoToWowzaCallback from './controllers/clips/upload-video-to-wowza';

import uploadVideoToWowzaJobCallback from './jobs/videos/upload-video-to-wowza';

import addJobHandler from './infrastructure/pulumi/add-job-handler';
import { addAssetDatabase, addProjectDatabase } from './infrastructure/pulumi/add-dynamodb';
import { updateProjectVideoTranscriptCallback } from './controllers/projects/update-project-video-transcript';

/* istanbul ignore file */

const environment = getEnvVariablesFromPulumiConfig();
const appEnvironment = environment.variables['ENVIRONMENT'];

const uploadVideoToWowzaJobHandler = addJobHandler(
  uploadVideoToWowzaJobCallback,
  'upload-video-to-wowza-job-handler',
  environment,
);

const getStreamKeysHandlerRole = new aws.iam.Role('get-stream-keys-handler-role', {
  assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({ Service: 'lambda.amazonaws.com' }),
});

const getStreamKeysHandlerPolicy = new aws.iam.Policy('get-stream-keys-handler-policy', {
  description: '',
  policy: {
    Version: '2012-10-17',
    Statement: [
      {
        Sid: 'PermissionForIVS',
        Effect: 'Allow',
        Action: ['ivs:*'],
        Resource: '*',
      },
    ],
  },
});

new aws.iam.RolePolicyAttachment(`get-stream-keys-handler-role-policy-attachment`, {
  role: getStreamKeysHandlerRole,
  policyArn: getStreamKeysHandlerPolicy.arn.apply((arn) => arn),
});

new aws.iam.RolePolicyAttachment(`get-stream-keys-handler-AWSLambdaBasicExecutionRole`, {
  role: getStreamKeysHandlerRole,
  policyArn: aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole,
});

const bucket = new aws.s3.Bucket('account-bucket', {
  bucket: environment.variables['ACCOUNT_BUCKET'],
});

const api = new apigateway.RestAPI('rest-api', {
  routes: [
    buildApiRouteFromCallback(
      '/{proxy+}',
      'OPTIONS',
      'allow-cors-handler',
      allowCorsCallback,
      environment,
    ),
    buildApiRouteFromCallback(
      'projects',
      'GET',
      'list-projects-handler',
      listProjectsCallback,
      environment,
    ),
    buildApiRouteFromCallback(
      'projects/{id}',
      'GET',
      'get-project-handler',
      getProjectCallback,
      environment,
    ),
    buildApiRouteFromCallback(
      'projects/{id}',
      'DELETE',
      'delete-project-handler',
      deleteProjectCallback,
      environment,
    ),
    buildApiRouteFromCallback(
      'projects/{id}',
      'PATCH',
      'edit-project-handler',
      editProjectCallback,
      environment,
    ),
    buildApiRouteFromCallback(
      'projects/{id}/videos/{videoId}/transcript',
      'GET',
      'get-project-video-transcript-handler',
      getProjectVideoTranscriptCallback,
      environment,
    ),
    buildApiRouteFromCallback(
      'projects/{id}/videos/{videoId}/transcript',
      'PATCH',
      'update-project-video-transcript-handler',
      updateProjectVideoTranscriptCallback,
      environment,
    ),
    buildApiRouteFromCallback(
      'projects/{id}/share-urls',
      'GET',
      'get-project-share-urls-handler',
      getProjectShareUrlsCallback,
      environment,
    ),
    buildApiRouteFromCallback(
      'projects/{id}/top-and-tail/process',
      'POST',
      'process-top-and-tail-handler',
      processTopAndTailCallback,
      environment,
    ),
    buildApiRouteFromCallback(
      'assets',
      'GET',
      'list-assets-handler',
      listAssetsCallback,
      environment,
    ),
    buildApiRouteFromCallback(
      'assets/{type}',
      'POST',
      'upload-asset-handler',
      uploadAssetCallback,
      environment,
    ),
    buildApiRouteFromCallback(
      'project/upload-url',
      'POST',
      'get-upload-url-handler',
      getProjectUploadUrlCallback,
      environment,
    ),
    buildApiRouteFromCallback(
      'projects/upload',
      'POST',
      'create-project-upload-handler',
      createProjectUploadCallback,
      environment,
    ),
    buildApiRouteFromCallback(
      'projects/multipart-upload',
      'POST',
      'create-project-multipart-upload-handler',
      createProjectMultipartUploadCallback,
      environment,
    ),
    buildApiRouteFromCallback(
      'projects/{id}/multipart-upload',
      'POST',
      'complete-project-multipart-upload-handler',
      completeProjectMultipartUploadCallback,
      environment,
    ),
    buildApiRouteFromCallback(
      'project/{id}/process',
      'POST',
      'process-clip-handler',
      requestClipProcessingCallback,
      environment,
    ),
    buildApiRouteFromCallback(
      'stream-keys',
      'GET',
      'get-stream-keys-handler',
      getStreamKeysCallback,
      environment,
      getStreamKeysHandlerRole,
    ),
    buildApiRouteFromCallback(
      'user',
      'POST',
      'set-up-user-handler',
      setUpUserCallback,
      environment,
    ),
    buildApiRouteFromCallback(
      'streaming/{id}',
      'GET',
      'get-streaming-user-handler',
      getStreamingUserCallback,
      environment,
    ),
    buildApiRouteFromCallback(
      'projects/{id}/videos/{videoId}/upload-to-wowza',
      'POST',
      'upload-video-to-wowza-handler',
      uploadVideoToWowzaCallback,
      {
        variables: {
          ...environment.variables,
          UPLOAD_VIDEO_TO_WOWZA_JOB_HANDLER_FUNCTION_NAME: uploadVideoToWowzaJobHandler.name,
        },
      },
    ),
  ],
});

export const apiId = api.api;
export const apiBaseUrl = api.url;

if (appEnvironment !== 'local') {
  const mainDomainDnsZone = getMainDomainDnsZone();

  addCustomDomain(api, mainDomainDnsZone);
  addSes(mainDomainDnsZone);
}

subscribeCallbackToEvent(
  recordingEndedCallback,
  recordingEndedEventPattern,
  'media-recording-ended-',
  environment,
);

subscribeCallbackToEvent(
  mediaConversionEndedCallback,
  mediaConversionEndedEventPattern,
  'media-conversion-ended-',
  environment,
);

subscribeCallbackToEvent(
  transcriptionEndedCallback,
  transcriptionEndedEventPattern,
  'transcription-ended-',
  environment,
);

subscribeCallbackToEvent(
  ecsTopAndTailAiTaskStoppedCallback,
  ecsTaskStoppedEventPattern,
  'ecs-top-and-tail-ai-task-stopped-',
  environment,
);

// Project related DDB tables
addProjectDatabase();
addAssetDatabase();
