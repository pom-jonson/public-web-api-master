import CustomerAccount from '../../entities/customer-account';
import EntryLocation, { EntryType } from '../../entities/entry-location';
import { verifyParam } from '../../utils';
import { NotFoundError, UnexpectedError } from '../exceptions';

export interface Dependencies {
  bucket: string;
  listEntries(
    folderLocation: EntryLocation,
    entryType: EntryType,
    includeRoot?: boolean,
  ): Promise<EntryLocation[]>;
}

export interface GetProjectPathQM {
  customerEmail: string;
  id: string;
}

export default async function getProjectPath(
  { customerEmail, id }: GetProjectPathQM,
  { bucket, listEntries }: Dependencies,
): Promise<string> {
  verifyParam(customerEmail, 'customerEmail');
  verifyParam(id, 'id');

  const customerAccount = CustomerAccount.fromEmail(bucket, customerEmail);

  const projectFolderPrefixLocation = customerAccount.getProjectsLocation().getModification(id);
  const projectFolders = await listEntries(projectFolderPrefixLocation, 'folder', true);

  if (!projectFolders || projectFolders.length === 0) {
    throw new NotFoundError(id);
  }
  if (projectFolders.length > 1) {
    throw new UnexpectedError(`Ambiguous project id '${id}'`);
  }

  return projectFolders.pop().getFullPath();
}
