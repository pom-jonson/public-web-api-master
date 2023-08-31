import { normalizeString } from '../utils';
import EntryLocation from './entry-location';

export default class CustomerAccount {
  readonly location: EntryLocation;

  constructor(readonly bucket: string, readonly accountId: string) {
    this.location = new EntryLocation(`${bucket}/${accountId}`);
  }

  static fromEmail(bucket: string, email: string): CustomerAccount {
    const accountId = normalizeString(email, '@.', '-');
    return new CustomerAccount(bucket, accountId);
  }

  static fromBucket(bucket: string): CustomerAccount {
    const bucketParts = bucket.split('-');
    const prefix = bucketParts.shift();
    const accountId = bucketParts.join('-');
    return new CustomerAccount(prefix, accountId);
  }

  static fromBucketAndAccountId(bucket: string, accountId: string): CustomerAccount {
    return new CustomerAccount(bucket, accountId);
  }

  getProjectsLocation(): EntryLocation {
    return this.location.getModification('projects');
  }

  getAssetsLocation(): EntryLocation {
    return this.location.getModification('assets');
  }

  getCredentialsLocation(): EntryLocation {
    return this.location.getModification('credentials');
  }
}
