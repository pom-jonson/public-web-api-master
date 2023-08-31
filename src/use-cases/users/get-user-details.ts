import CustomerAccount from '../../entities/customer-account';
import EntryLocation, { EntryType } from '../../entities/entry-location';
import { UnexpectedError, NotFoundError } from '../exceptions';

export interface Dependencies {
  listEntries(
    folderLocation: EntryLocation,
    entryType: EntryType,
    includeRoot?: boolean,
  ): Promise<EntryLocation[]>;
  getDeserializedObject(fileLocation: EntryLocation): Promise<RawUserDetails>;
}

export interface RawUserDetails {
  email: string;
}

interface GetUserDetailsQM {
  bucket: string;
  accountId: string;
}

interface UserDetailsVM {
  email: string;
}

export default async function getUserDetails(
  { bucket, accountId }: GetUserDetailsQM,
  { listEntries, getDeserializedObject }: Dependencies,
): Promise<UserDetailsVM> {
  const customer = CustomerAccount.fromBucketAndAccountId(bucket, accountId);

  const userFiles = await listEntries(customer.getCredentialsLocation(), 'file');
  if (userFiles.length > 1) {
    throw new UnexpectedError(`Ambiguous user credentials '${customer.accountId}'`);
  }

  if (!userFiles.length) {
    throw new NotFoundError(`User credentials '${customer.accountId}' not found`);
  }
  const userDetails = await getDeserializedObject(userFiles.pop());

  return {
    email: userDetails.email,
  };
}
