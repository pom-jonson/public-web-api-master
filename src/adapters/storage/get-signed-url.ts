import EntryLocation from '../../entities/entry-location';
import handleAwsCallback from '../utils';
import { putBucketCors } from './put-bucket-cors';
import { createS3 } from './s3';

export enum SignedUrlOperations {
  GET = 'GET',
  UPLOAD = 'UPLOAD',
}

const awsOperations = {
  GET: 'getObject',
  UPLOAD: 'putObject',
};

export async function getSignedUploadUrl(
  fileLocation: EntryLocation,
  expires: number = 60 * 60,
  downloadFilename?: string,
): Promise<string> {
  return await getSignedUrl(fileLocation, SignedUrlOperations.UPLOAD, expires, downloadFilename);
}

export async function getSignedDownloadUrl(
  fileLocation: EntryLocation,
  expires: number = 60 * 60,
  downloadFilename?: string,
): Promise<string> {
  return await getSignedUrl(fileLocation, SignedUrlOperations.GET, expires, downloadFilename);
}

export async function getSignedUploadPartUrl(
  fileLocation: EntryLocation,
  uploadId: string,
  partNumber: number,
): Promise<string> {
  const s3 = createS3();

  return await handleAwsCallback(async () => {
    let params = {
      Bucket: fileLocation.bucket,
      Key: fileLocation.key,
      UploadId: uploadId,
      PartNumber: partNumber,
      Expires: 60 * 60,
    };

    return await s3.getSignedUrlPromise('uploadPart', params);
  });
}

export async function getSignedUrl(
  fileLocation: EntryLocation,
  operation: SignedUrlOperations,
  expires: number = 60 * 60,
  downloadFilename?: string,
): Promise<string> {
  if (fileLocation.type !== 'file') {
    throw new Error(`Cannot receive public path for ${fileLocation.type} type location.`);
  }

  const s3 = createS3();

  // await putBucketCors(fileLocation);

  return await handleAwsCallback(async () => {
    let params = {
      Bucket: fileLocation.bucket,
      Key: fileLocation.key,
      Expires: expires,
      ResponseContentDisposition: downloadFilename
        ? `attachment; filename="${downloadFilename}"`
        : undefined,
    };

    return await s3.getSignedUrlPromise(awsOperations[operation], params);
  });
}
