import * as AWS from 'aws-sdk';
import EntryLocation from '../../entities/entry-location';
import configureAwsCredentials from '../configuration';
import { putBucketCors } from './put-bucket-cors';
import { createS3 } from './s3';

export async function putObject(objectPath: string, objectBuffer: Buffer): Promise<void> {
  configureAwsCredentials();
  const location = new EntryLocation(objectPath);
  const s3 = createS3();

  // await putBucketCors(location);

  await s3
    .upload({
      Body: objectBuffer,
      Bucket: location.bucket,
      Key: location.key,
    })
    .promise();
}
