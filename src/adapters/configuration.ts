import * as AWS from 'aws-sdk';
import {
  GET_INTERNAL_AWS_ACCESS_KEY_ID,
  GET_INTERNAL_AWS_REGION,
  GET_INTERNAL_AWS_SECRET_ACCESS_KEY,
} from '../../runtime-config';

export default function configureAwsCredentials(): void {
  const config = {
    credentials: {
      accessKeyId: GET_INTERNAL_AWS_ACCESS_KEY_ID(),
      secretAccessKey: GET_INTERNAL_AWS_SECRET_ACCESS_KEY(),
    },
    region: GET_INTERNAL_AWS_REGION(),
  };
  AWS.config.update(config);
}
