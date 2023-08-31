// These methods are only available at runtime.
export const GET_INTERNAL_AWS_ACCESS_KEY_ID = (): string =>
  process.env.INTERNAL_AWS_ACCESS_KEY_ID ?? 'AKIA42LIPF3472NIQWDE';
export const GET_INTERNAL_AWS_SECRET_ACCESS_KEY = (): string =>
  process.env.INTERNAL_AWS_SECRET_ACCESS_KEY ?? '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';
export const GET_INTERNAL_AWS_REGION = (): string => process.env.INTERNAL_AWS_REGION ?? 'us-west-2';
export const GET_ENVIRONMENT = (): string => process.env.ENVIRONMENT ?? 'local';
export const GET_PROJECT_BUCKET = (): string => process.env.ACCOUNT_BUCKET ?? 'eos-projects-dev';
export const GET_MEDIA_CONVERT_ENDPOINT = (): string =>
  process.env.MEDIA_CONVERT_ENDPOINT ?? 'https://hvtjrir1c.mediaconvert.us-west-2.amazonaws.com';
export const GET_MEDIA_CONVERT_ROLE = (): string =>
  process.env.MEDIA_CONVERT_ROLE ??
  'arn:aws:iam::881224265465:role/service-role/MediaConvert_Default_Role';
export const GET_API_ALLOWED_ORIGINS = (): string =>
  process.env.API_ALLOWED_ORIGINS ?? 'http://localhost:3000';
export const GET_AUTH0_JWKS_URI = (): string =>
  process.env.AUTH0_JWKS_URI ?? 'https://test-editonthespot.au.auth0.com/.well-known/jwks.json';
export const GET_AUTH0_API_AUDIENCE = (): string =>
  process.env.AUTH0_API_AUDIENCE ?? 'public-web-api';
export const GET_AUTH0_ISSUER = (): string =>
  process.env.AUTH0_ISSUER ?? 'https://test-editonthespot.au.auth0.com/';
export const GET_AUTH0_CLIENT_ID = (): string =>
  process.env.AUTH0_CLIENT_ID ?? 'X1VUP5DmUsHtAGpJKEzJr8WUpcOpK30u';
export const GET_SES_ARN = (): string =>
  process.env.SES_ARN ?? 'arn:aws:ses:us-west-2:881224265465:identity/test-editonthespot.com';
export const GET_EMAIL_FROM = (): string =>
  process.env.EMAIL_FROM ?? 'support@test-editonthespot.com';
export const GET_EMAIL_TO = (): string =>
  process.env.EMAIL_TO ??
  'support@test-editonthespot.com?subject=Enquiry%20about%20Edit%20On%20The%20Spot&body=Hi%2C%0D%0A%0D%0A';
export const GET_PUBLIC_WEBSITE_URL = (): string =>
  process.env.PUBLIC_WEBSITE_URL ?? 'https://test-editonthespot.com';
export const GET_PUBLIC_PURCHASE_WEBSITE_URL = (): string =>
  process.env.PUBLIC_PURCHASE_WEBSITE_URL ?? 'https://editonthespot.ai';
export const GET_DEFAULT_ACCOUNT_PAGE = (): string =>
  process.env.DEFAULT_ACCOUNT_PAGE ?? '/projects';
export const GET_ECS_TRIMMING_TASK_SUBNET = (): string =>
  process.env.ECS_TRIMMING_TASK_SUBNET ?? 'subnet-084e4cb3e18c0e936';
export const GET_ECS_TRIMMING_TASK_SECURITY_GROUP = (): string =>
  process.env.ECS_TRIMMING_TASK_SECURITY_GROUP ?? 'sg-0957a7b6ec62f5d57';
export const GET_DEEPGRAM_API_KEY = (): string =>
  process.env.DEEPGRAM_API_KEY ?? 'b51f2e422d1816a358b3447c7b8b929486684eff';
export const GET_RECORDING_CONFIGURATION_ARN = (): string =>
  process.env.RECORDING_CONFIGURATION_ARN ??
  'arn:aws:ivs:us-west-2:881224265465:recording-configuration/QcRJQwLs6Q5B';
export const GET_WEBHOOK_API_KEY = (): string =>
  process.env.WEBHOOK_API_KEY ?? 'wSBzo6oQ%P#Hc4tB*SeP^n6';

export const GET_TINY_URL_API_KEY = (): string =>
  process.env.TINY_URL_API_KEY ?? '93hdWjMEh8MER5NcSuxIHNfnOmY4cgqdgFSFaLYzG4CiHO87aaCbb4ghhigl';
export const GET_TINY_URL_DOMAIN = (): string =>
  process.env.TINY_URL_DOMAIN ?? 'share.editonthespot.com';
