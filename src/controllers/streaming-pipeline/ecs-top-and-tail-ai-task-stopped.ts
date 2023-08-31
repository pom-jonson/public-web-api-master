import { APIGatewayProxyResult } from 'aws-lambda';
import { sendTemplatedEmail } from '../../adapters/messaging/send-templated-email';
import listEntries from '../../adapters/storage/list-entries';
import { getDeserializedObject } from '../../adapters/storage/get-deserialized-object';
import getUserDetails from '../../use-cases/users/get-user-details';
import { executeCallback } from '../middleware/execute-callback';
import EntryLocation from '../../entities/entry-location';
import {
  GET_DEFAULT_ACCOUNT_PAGE,
  GET_EMAIL_TO,
  GET_PUBLIC_PURCHASE_WEBSITE_URL,
  GET_PUBLIC_WEBSITE_URL,
} from '../../../runtime-config';
import Validator from 'validatorjs';
import ValidationFailedError from '../middleware/validation-failed-error';
import { parseEcsTopAndTailAiTaskEvent } from '../../adapters/messaging/parse-ecs-event';

const validationRules = {
  email: 'required|email',
  accountLink: 'required|url',
};

const ecsTopAndTailAiTaskStoppedCallback = async (event: unknown): Promise<APIGatewayProxyResult> =>
  await executeCallback(async () => {
    console.log(`event: ${event}`);
    const parsedEvent = parseEcsTopAndTailAiTaskEvent(event);
    const timestampLocation = new EntryLocation(parsedEvent.timestampFilePath);

    const userDetails = await getUserDetails(
      { bucket: timestampLocation.bucket, accountId: timestampLocation.accountId },
      { listEntries, getDeserializedObject },
    );

    if (
      !userDetails ||
      (userDetails &&
        !['webcast@encore-anzpac.com', 'editonthespot@gmail.com'].includes(userDetails.email))
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

      const validation = new Validator(templateData, validationRules);
      if (validation.fails()) {
        throw new ValidationFailedError(validation.errors);
      }

      return await sendTemplatedEmail([userDetails.email], 'video-ready', templateData);
    }
  }, 202);

export default ecsTopAndTailAiTaskStoppedCallback;
