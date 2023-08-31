import configureAwsCredentials from '../configuration';
import * as AWS from 'aws-sdk';
import { GET_ENVIRONMENT } from '../../../runtime-config';

export function createS3() {
  configureAwsCredentials();
  const useLocalStack = GET_ENVIRONMENT() === 'local';

  return new AWS.S3({
    apiVersion: '2006-03-01',
    signatureVersion: 'v4',
    useAccelerateEndpoint: true,
    endpoint: useLocalStack ? 'http://localstack:4566' : undefined,
    s3ForcePathStyle: useLocalStack,
  });
}
