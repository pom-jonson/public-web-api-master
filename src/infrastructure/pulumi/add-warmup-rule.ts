import * as aws from '@pulumi/aws';
import { Output } from '@pulumi/pulumi';

/* istanbul ignore file */

const addWarmupRule = (
  callbackName: string,
  callbackArn: Output<string>,
  lambdaName: Output<string>,
): void => {
  const warmupRule = new aws.cloudwatch.EventRule(`${callbackName}-warmup-rule`, {
    scheduleExpression: 'rate(5 minutes)',
  });

  new aws.cloudwatch.EventTarget(`${callbackName}-warmup-target`, {
    rule: warmupRule.name,
    arn: callbackArn,
    input: `{ "warmer":true,"concurrency":3 }`,
  });

  new aws.lambda.Permission(`${callbackName}-permission`, {
    action: 'lambda:InvokeFunction',
    function: lambdaName,
    principal: 'events.amazonaws.com',
    sourceArn: warmupRule.arn,
  });
};

export default addWarmupRule;
