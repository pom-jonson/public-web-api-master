import * as aws from '@pulumi/aws';

/* istanbul ignore next */

export default function subscribeCallbackToEvent(
  callback: aws.lambda.Callback<unknown, unknown>,
  eventPattern: unknown,
  prefix: string,
  environment: aws.types.input.lambda.FunctionEnvironment,
): void {
  const eventHandler = new aws.lambda.CallbackFunction(`${prefix}handler`, {
    callback,
    environment,
    runtime: 'nodejs14.x',
  });

  const eventRule = new aws.cloudwatch.EventRule(`${prefix}rule`, {
    eventPattern: JSON.stringify(eventPattern),
    isEnabled: true,
  });

  new aws.cloudwatch.EventRuleEventSubscription(`${prefix}subscription`, eventRule, eventHandler);
}
