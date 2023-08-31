import * as pulumi from '@pulumi/pulumi';
import * as awsx from '@pulumi/awsx';
import * as aws from '@pulumi/aws';
import * as apigateway from '@pulumi/aws-apigateway';

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import addWarmupRule from './add-warmup-rule';

/* istanbul ignore file */

type Method = 'GET' | 'POST' | 'OPTIONS' | 'PUT' | 'PATCH' | 'DELETE';

const buildApiRouteFromCallback = (
  path: string,
  method: Method,
  handlerName: string,
  callback: (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>,
  environment?: aws.types.input.lambda.FunctionEnvironment,
  role?: aws.iam.Role,
): apigateway.types.input.RouteArgs => {
  const lambda = new aws.lambda.CallbackFunction(handlerName, {
    callback,
    environment,
    role,
    runtime: 'nodejs16.x',
    tracingConfig: {
      mode: 'Active',
    },
  });

  return {
    path,
    method,
    eventHandler: lambda,
  };
};

export default buildApiRouteFromCallback;
