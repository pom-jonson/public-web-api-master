import EntryLocation from '../../entities/entry-location';
import handleAwsCallback from '../utils';
import { createS3 } from './s3';

export async function completeMultipartUpload(
  fileLocation: EntryLocation,
  uploadId: string,
  parts: { etag: string; partNumber: number }[],
): Promise<void> {
  const s3 = createS3();

  return await handleAwsCallback(async () => {
    let params = {
      Bucket: fileLocation.bucket,
      Key: fileLocation.key,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: parts.map((part) => ({
          PartNumber: part.partNumber,
          ETag: part.etag,
        })),
      },
    };

    await s3.completeMultipartUpload(params).promise();
  });
}
