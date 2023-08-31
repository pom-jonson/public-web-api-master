import EntryLocation from '../../entities/entry-location';
import handleAwsCallback from '../utils';
import { createS3 } from './s3';

export async function createMultipartUpload(fileLocation: EntryLocation): Promise<string> {
  const s3 = createS3();

  return await handleAwsCallback(async () => {
    let params = {
      Bucket: fileLocation.bucket,
      Key: fileLocation.key,
    };

    const response = await s3.createMultipartUpload(params).promise();

    return response.UploadId;
  });
}
