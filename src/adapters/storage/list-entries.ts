import * as AWS from 'aws-sdk';
import EntryLocation, { EntryType, LOWRES_FOLDER } from '../../entities/entry-location';
import { InvalidParameterError } from '../../use-cases/exceptions';
import configureAwsCredentials from '../configuration';
import handleAwsCallback from '../utils';
import { createS3 } from './s3';

export default async function listEntries(
  folderLocation: EntryLocation,
  entryType: EntryType,
  includeRoot = false,
  includeLowRes = false,
): Promise<EntryLocation[]> {
  configureAwsCredentials();

  return await handleAwsCallback(async () => {
    if (entryType === 'file' && includeRoot) {
      throw new InvalidParameterError('Unable to include root when listing files.');
    }

    const prefix = folderLocation.key + (entryType === 'folder' && !includeRoot ? '/' : '');
    const delimiter = entryType === 'folder' ? '/' : undefined;
    const s3 = createS3();

    try {
      await s3.headBucket({ Bucket: folderLocation.bucket }).promise();
    } catch (e) {
      // istanbul ignore next
      if ((e as AWS.AWSError).statusCode === 404) {
        return [];
      }

      // istanbul ignore next
      throw e;
    }

    const requestResult = await s3
      .listObjectsV2({ Bucket: folderLocation.bucket, Prefix: prefix, Delimiter: delimiter })
      .promise();

    if (entryType === 'file') {
      let filter = requestResult.Contents.filter((el) => EntryLocation.isFile(el.Key));
      if (!includeLowRes) {
        filter = filter.filter((el) => !el.Key.includes(LOWRES_FOLDER));
      }

      return filter.map((el) => EntryLocation.fromPartsOfPath(folderLocation.bucket, el.Key));
    } else {
      return requestResult.CommonPrefixes.filter((el) => !el.Prefix.includes(LOWRES_FOLDER)).map(
        (el) => EntryLocation.fromPartsOfPath(folderLocation.bucket, el.Prefix),
      );
    }
  });
}
