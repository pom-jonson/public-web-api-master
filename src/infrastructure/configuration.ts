import * as pulumi from '@pulumi/pulumi';
import * as pulumiaws from '@pulumi/aws';

/* istanbul ignore file */

export default function getEnvVariablesFromPulumiConfig(): pulumiaws.types.input.lambda.FunctionEnvironment {
  const config = new pulumi.Config();
  return {
    variables: {
      INTERNAL_AWS_ACCESS_KEY_ID: config.requireSecret('aws_access_key_id'),
      INTERNAL_AWS_SECRET_ACCESS_KEY: config.requireSecret('aws_secret_access_key'),
      INTERNAL_AWS_REGION: config.require('aws_region'),
      ENVIRONMENT: config.require('environment'),
      ACCOUNT_BUCKET: config.require('account_bucket'),
      MEDIA_CONVERT_ENDPOINT: config.require('media_convert_endpoint'),
      MEDIA_CONVERT_ROLE: config.require('media_convert_role'),
      API_CUSTOM_DOMAIN: config.get('api_custom_domain'),
      API_ALLOWED_ORIGINS: config.require('api_allowed_origins'),
      AUTH0_JWKS_URI: config.require('auth0_jwks_uri'),
      AUTH0_API_AUDIENCE: config.require('auth0_api_audience'),
      AUTH0_ISSUER: config.require('auth0_issuer'),
      AUTH0_CLIENT_ID: config.require('auth0_client_id'),
      SES_EMAIL_DOMAIN: config.require('ses_email_domain'),
      SES_ARN: config.require('ses_arn'),
      EMAIL_FROM: config.require('email_from'),
      EMAIL_TO: config.require('email_to'),
      PUBLIC_WEBSITE_URL: config.require('public_website_url'),
      DEFAULT_ACCOUNT_PAGE: config.require('default_account_page'),
      ECS_TRIMMING_TASK_SUBNET: config.require('ecs_trimming_task_subnet'),
      ECS_TRIMMING_TASK_SECURITY_GROUP: config.require('ecs_trimming_task_security_group'),
      // DEEPGRAM_API_KEY: config.require('deepgram_api_key'),
      RECORDING_CONFIGURATION_ARN: config.require('recording_configuration_arn'),
      WEBHOOK_API_KEY: config.require('webhook_api_key'),
      TINY_URL_API_KEY: config.require('tiny_url_api_key'),
      TINY_URL_DOMAIN: config.require('tiny_url_domain'),
    },
  };
}
