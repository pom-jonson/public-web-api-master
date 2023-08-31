import * as AWS from 'aws-sdk';
import { GET_EMAIL_FROM, GET_SES_ARN } from '../../../runtime-config';
import configureAwsCredentials from '../configuration';
import handleAwsCallback from '../utils';

const templateMapper = {
  'video-ready': 'NotificationTemplate',
};

export async function sendTemplatedEmail(
  emails: string[],
  emailType: 'video-ready',
  templateData: unknown,
): Promise<unknown> {
  configureAwsCredentials();
  const ses = new AWS.SES({ apiVersion: '2010-12-01' });

  const templateId = templateMapper[emailType];

  const params = {
    Destination: {
      ToAddresses: emails,
    },
    Source: GET_EMAIL_FROM(),
    Template: templateId,
    TemplateData: JSON.stringify(templateData),
    SourceArn: GET_SES_ARN(),
  };

  return await handleAwsCallback(() => ses.sendTemplatedEmail(params).promise());
}
