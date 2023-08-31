import AWS from 'aws-sdk';
import EntryLocation from '../../entities/entry-location';
import listEntries from './list-entries';
import { createS3 } from './s3';

export default async function moveEntry(
  locationFrom: EntryLocation,
  locationTo: EntryLocation,
): Promise<void> {
  if (locationFrom.type !== locationTo.type) {
    throw new Error('Unable move entries of different types.');
  }

  const objectsToMove =
    locationFrom.type === 'file' ? [locationFrom] : await listEntries(locationFrom, 'file');
  const s3 = createS3();

  for (const object of objectsToMove) {
    const destinationLocation =
      locationTo.type === 'file'
        ? locationTo
        : locationTo.getModification(object.key.substring(locationFrom.key.length));
    await s3
      .copyObject({
        CopySource: object.getFullPath(),
        Bucket: destinationLocation.bucket,
        Key: destinationLocation.key,
      })
      .promise();

    await s3
      .deleteObject({
        Bucket: object.bucket,
        Key: object.key,
      })
      .promise();
  }
}
