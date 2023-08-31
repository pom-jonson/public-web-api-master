import AWS from 'aws-sdk';
import EntryLocation from '../../entities/entry-location';
import { verifyParam } from '../../utils';
import configureAwsCredentials from '../configuration';
import handleAwsCallback from '../utils';
import { createS3 } from './s3';

export async function deleteObject(fileLocation: EntryLocation): Promise<void> {
  verifyParam(fileLocation, 'fileLocation');
  if (fileLocation.type !== 'file') {
    throw new Error(`Cannot delete object for ${fileLocation.type} type location.`);
  }

  configureAwsCredentials();
  const s3 = createS3();

  return await handleAwsCallback(async () => {
    await s3
      .deleteObject({
        Bucket: fileLocation.bucket,
        Key: fileLocation.key,
      })
      .promise();
  });
}
