import * as AWS from 'aws-sdk';

/* istanbul ignore file */

export default class CloudWatchEventsMock {
  rawEvents: unknown[] = [];
  eventBodies: unknown[] = [];

  putEvents = (params: AWS.CloudWatchEvents.PutEventsRequest): unknown => {
    if (params.Entries && params.Entries.length) {
      params.Entries.forEach((el) => {
        this.rawEvents.push(el);
        this.eventBodies.push(JSON.parse(el.Detail));
      });
    }
    return { promise: () => Promise.resolve() };
  };
}
