import { AWSError } from 'aws-sdk';
import { NotFoundError } from '../use-cases/exceptions';

/* istanbul ignore file */

export default async function handleAwsCallback<T>(callback: () => Promise<T>): Promise<T> {
  try {
    const result = await callback();
    return result as T;
  } catch (e) {
    const awsError = e as AWSError;
    if (awsError && awsError.statusCode === 404) {
      throw new NotFoundError(awsError.hostname);
    }

    throw e;
  }
}
