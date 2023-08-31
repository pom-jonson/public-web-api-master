import * as AWS from 'aws-sdk';
import configureAwsCredentials from '../configuration';
import handleAwsCallback from '../utils';
import EventType from './event-type';

interface EventPattern {
  eventType: { prefix: string }[];
}

export default async function publishEvent(eventType: EventType, eventBody: object): Promise<void> {
  configureAwsCredentials();
  const eventBus = new AWS.CloudWatchEvents({ apiVersion: '2015-10-07' });

  const eventPattern: EventPattern = { eventType: [{ prefix: eventType }] };
  const stringifiedBody = JSON.stringify({ ...eventPattern, ...eventBody });

  await handleAwsCallback(async () => {
    await eventBus.putEvents({ Entries: [{ Detail: stringifiedBody }] }).promise();
  });
}
