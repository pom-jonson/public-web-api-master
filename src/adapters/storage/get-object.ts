import * as AWS from 'aws-sdk';
import EntryLocation from '../../entities/entry-location';
import configureAwsCredentials from '../configuration';
import handleAwsCallback from '../utils';
import { createS3 } from './s3';

export async function getObject(fileLocation: EntryLocation): Promise<unknown> {
  if (fileLocation.type !== 'file') {
    throw new Error(`Cannot receive object for ${fileLocation.type} type location.`);
  }

  configureAwsCredentials();
  const s3 = createS3();

  return await handleAwsCallback(async () => {
    const rawData = await s3
      .getObject({
        Bucket: fileLocation.bucket,
        Key: fileLocation.key,
      })
      .promise();

    return rawData.Body;
  });
}
