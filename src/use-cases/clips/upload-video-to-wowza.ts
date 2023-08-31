import * as AWS from 'aws-sdk';
import { AssetResponse } from '../../adapters/wowza/types';
import EntryLocation, { EntryType } from '../../entities/entry-location';
import Clip from '../../entities/clip';
import pLimit from 'p-limit';
import { sendEmail } from '../../adapters/messaging/send-email';
import getUserDetails from '../users/get-user-details';
import { getDeserializedObject } from '../../adapters/storage/get-deserialized-object';
import { createS3 } from '../../adapters/storage/s3';

export interface Dependencies {
  listEntries(
    folderLocation: EntryLocation,
    entryType: EntryType,
    includeRoot?: boolean,
  ): Promise<EntryLocation[]>;
  getObject(fileLocation: EntryLocation): Promise<unknown>;
  wowza: {
    createAsset(fileName: string): Promise<AssetResponse>;
    requestMultipartUpload(uploadUrl: string): Promise<{ accessUri: string }>;
    commitMultipartUpload(uploadUrl: string): Promise<void>;
    uploadAsset(uploadUrl: string, assetData: Buffer): Promise<void>;
    reportAssetUploadCompleted(id: string, duration: number): Promise<AssetResponse>;
  };
}

export interface UploadVideoToWowzaCM {
  assetFileName: string;
  videoFilePath: string;
  wowzaAssetId: string;
  uploadUrl: string;
}

const FILE_CHUNK_SIZE = 25 * 1024 * 1024; // MB
const MAX_UPLOAD_CONCURRENCY = 10;

async function getVideoMetadata(
  buffer: Buffer,
): Promise<{ start: number; timeScale: number; duration: number; movieLength: number }> {
  const start = buffer.indexOf(Buffer.from('mvhd')) + 16;
  const timeScale = buffer.readUInt32BE(start);
  const duration = buffer.readUInt32BE(start + 4);
  const movieLength = Math.floor(duration / timeScale);

  return { start, timeScale, duration, movieLength };
}

export default async function uploadVideoToWowza(
  { videoFilePath, assetFileName, wowzaAssetId, uploadUrl }: UploadVideoToWowzaCM,
  { listEntries, getObject, wowza }: Dependencies,
) {
  try {
    const videoLocation = new EntryLocation(videoFilePath);
    const files = await listEntries(videoLocation, 'file');

    let videoFileLocation: EntryLocation;
    for (const file of files) {
      if (Clip.isClip(file)) {
        videoFileLocation = file;
        break;
      }
    }

    const s3 = createS3();
    const { ContentLength: size } = await s3
      .headObject({
        Bucket: videoFileLocation.bucket,
        Key: videoFileLocation.key,
      })
      .promise();

    // request multipart upload
    const { accessUri } = await wowza.requestMultipartUpload(uploadUrl);
    console.log(`Multipart upload requested - accessUri: ${accessUri}`);

    // upload multiple parts concurrently
    const limit = pLimit(MAX_UPLOAD_CONCURRENCY);
    const uploadHost = new URL(uploadUrl).origin;

    let videoDuration = 0;
    const chunkCount = Math.ceil(size / FILE_CHUNK_SIZE);
    let promises = Array.from(Array(chunkCount).keys()).map((index) => {
      // wrap the function we are calling in the limit function we defined above
      return limit(async () => {
        const chunkRange = `bytes=${index * FILE_CHUNK_SIZE}-${(index + 1) * FILE_CHUNK_SIZE - 1}`;
        console.log(`Uploading file chunk ${index + 1} - range: ${chunkRange}`);

        const chunk = (
          await s3
            .getObject({
              Bucket: videoFileLocation.bucket,
              Key: videoFileLocation.key,
              Range: chunkRange,
            })
            .promise()
        ).Body as Buffer;

        await wowza.uploadAsset(`${uploadHost}${accessUri}${index + 1}`, chunk);

        if (index === 0) {
          const { movieLength } = await getVideoMetadata(chunk);
          videoDuration = movieLength;
        }

        console.log(`Uploaded file chunk ${index + 1} - range: ${chunkRange}`);
      });
    });

    await Promise.all(promises);

    // commit the upload
    await wowza.commitMultipartUpload(`${uploadHost}${accessUri}`);
    console.log(`Multipart upload committed`);

    await wowza.reportAssetUploadCompleted(wowzaAssetId, videoDuration);
    console.log(`Asset upload complete reported`);

    try {
      const userDetails = await getUserDetails(
        { bucket: videoFileLocation.bucket, accountId: videoFileLocation.accountId },
        { listEntries, getDeserializedObject },
      );

      const emails = [userDetails.email];
      const wowzaAssetUrl = `https://video.wowza.com/en/manage/assets/${wowzaAssetId}`;
      await sendEmail(
        emails,
        'You file has been uploaded to Wowza',
        `Please use this <a href="${wowzaAssetUrl}">link</a> to access your file on Wowza.`,
        wowzaAssetUrl,
      );
    } catch (e) {
      // Ignore if email cannot be sent
    }
  } catch (e) {
    console.log(`Error occurred upload asset to Wowza - error: ${JSON.stringify(e)}`);
  }
}
