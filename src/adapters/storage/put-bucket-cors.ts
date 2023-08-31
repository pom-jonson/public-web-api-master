import * as AWS from 'aws-sdk';
import EntryLocation from '../../entities/entry-location';
import configureAwsCredentials from '../configuration';
import handleAwsCallback from '../utils';
import { createS3 } from './s3';

export async function putBucketCors(fileLocation: EntryLocation): Promise<unknown> {
  configureAwsCredentials();
  const s3 = createS3();

  // eslint-disable-next-line no-useless-catch
  try {
    await s3.headBucket({ Bucket: fileLocation.bucket }).promise();
  } catch (e) {
    await s3
      .createBucket({
        Bucket: fileLocation.bucket,
      })
      .promise();
  }
  return handleAwsCallback(async () => {
    return await s3
      .putBucketCors({
        Bucket: fileLocation.bucket,
        CORSConfiguration: {
          CORSRules: [
            {
              AllowedHeaders: ['*'],
              AllowedMethods: ['GET', 'PUT'],
              AllowedOrigins: ['*'],
              ExposeHeaders: ['ETag'],
            },
          ],
        },
      })
      .promise();
  });
}
