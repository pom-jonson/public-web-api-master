import * as AWS from 'aws-sdk';
import { GET_EMAIL_FROM, GET_SES_ARN } from '../../../runtime-config';
import configureAwsCredentials from '../configuration';
import handleAwsCallback from '../utils';

const templateMapper = {
  'video-ready': 'NotificationTemplate',
};

export async function sendEmail(
  emails: string[],
  subject: string,
  bodyHTML: string,
  bodyText: string,
): Promise<unknown> {
  configureAwsCredentials();
  const ses = new AWS.SES({ apiVersion: '2010-12-01' });

  const params: AWS.SES.SendEmailRequest = {
    Destination: {
      ToAddresses: emails,
    },
    Source: GET_EMAIL_FROM(),
    SourceArn: GET_SES_ARN(),
    Message: {
      /* required */
      Body: {
        /* required */
        Html: {
          Charset: 'UTF-8',
          Data: bodyHTML,
        },
        Text: {
          Charset: 'UTF-8',
          Data: bodyText,
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: subject,
      },
    },
  };

  return await handleAwsCallback(() => ses.sendEmail(params).promise());
}
