import listEntries from '../../adapters/storage/list-entries';
import Clip from '../../entities/clip';
import CustomerAccount from '../../entities/customer-account';
import EntryLocation from '../../entities/entry-location';
import getUserDetails from '../users/get-user-details';
import { getDeserializedObject } from '../../adapters/storage/get-deserialized-object';
import {
  GET_DEFAULT_ACCOUNT_PAGE,
  GET_EMAIL_TO,
  GET_PUBLIC_PURCHASE_WEBSITE_URL,
  GET_PUBLIC_WEBSITE_URL,
} from '../../../runtime-config';
import Validator from 'validatorjs';
import { sendTemplatedEmail } from '../../adapters/messaging/send-templated-email';

export interface Dependencies {
  createTranscriptionJob(
    clipLocation: EntryLocation,
    outputFileLocation: EntryLocation,
  ): Promise<unknown>;
}

interface RequestClipTranscriptionCM {
  filePath: string;
}

export default async function requestClipTranscription(
  { filePath }: RequestClipTranscriptionCM,
  { createTranscriptionJob }: Dependencies,
): Promise<string> {
  const sourceLocation = new EntryLocation(filePath);

  const clip = new Clip(sourceLocation);

  const transcription = clip.getTranscriptionLocation();
  console.log(transcription.getFullPath(), 'full path');
  await createTranscriptionJob(clip.location, transcription);

  // For wowza, send email once mediaconversion is done instead of after transcription
  const userDetails = await getUserDetails(
    { bucket: transcription.bucket, accountId: transcription.accountId },
    { listEntries, getDeserializedObject },
  );
  console.log(JSON.stringify(userDetails));
  if (
    userDetails &&
    ['webcast@encore-anzpac.com', 'editonthespot@gmail.com'].includes(userDetails.email)
  ) {
    const accountLink = `${GET_PUBLIC_WEBSITE_URL()}${GET_DEFAULT_ACCOUNT_PAGE()}?email=${
      userDetails.email
    }`;
    const templateData = {
      ...userDetails,
      accountLink,
      websiteUrl: GET_PUBLIC_WEBSITE_URL(),
      purchaseWebsiteUrl: GET_PUBLIC_PURCHASE_WEBSITE_URL(),
      mailTo: GET_EMAIL_TO(),
    };
    await sendTemplatedEmail([userDetails.email], 'video-ready', templateData);
  }

  return transcription.getFullUri();
}
