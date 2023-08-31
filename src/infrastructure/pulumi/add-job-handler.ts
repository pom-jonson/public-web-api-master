import * as aws from '@pulumi/aws';
import { CallbackFunction } from '@pulumi/aws/lambda';

/* istanbul ignore next */

export default function addJobHandler(
  callback: aws.lambda.Callback<unknown, unknown>,
  name: string,
  environment: aws.types.input.lambda.FunctionEnvironment,
) {
  const callbackFunction = new aws.lambda.CallbackFunction(name, {
    callback,
    environment,
    runtime: 'nodejs14.x',
    timeout: 15 * 60,
    memorySize: 2048,
  });

  new aws.lambda.FunctionEventInvokeConfig(`${name}-invoke-config`, {
    functionName: callbackFunction.name,
    maximumRetryAttempts: 0,
  });

  return callbackFunction;
}
