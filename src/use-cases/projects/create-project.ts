import Clip from '../../entities/clip';
import CustomerAccount from '../../entities/customer-account';
import EntryLocation, { EntryType } from '../../entities/entry-location';
import Project from '../../entities/project';
import { RawUserDetails } from '../users/get-user-details';

interface Dependencies {
  createMediaConvertingJob(
    inputFileLocation: EntryLocation,
    outputFileLocation: EntryLocation,
    lowResOutputFileLocation: EntryLocation,
  ): Promise<unknown>;
  putSerializedObject(objectPath: string, object: unknown): Promise<void>;
  getDeserializedObject<T>(fileLocation: EntryLocation): Promise<T>;
  listEntries(
    folderLocation: EntryLocation,
    entryType: EntryType,
    includeRoot?: boolean,
  ): Promise<EntryLocation[]>;
}

export interface CreateProjectCM {
  filePath: string;
  source: string;
  created: Date;
}

export default async function createProject(
  { filePath, source, created }: CreateProjectCM,
  {
    createMediaConvertingJob,
    putSerializedObject,
    getDeserializedObject,
    listEntries,
  }: Dependencies,
): Promise<string> {
  const sourceLocation = new EntryLocation(filePath);

  const accountId = source.toLowerCase();
  const customerAccount = CustomerAccount.fromBucketAndAccountId(sourceLocation.bucket, accountId);
  const project = Project.createNew(customerAccount.getProjectsLocation(), accountId, created);
  const clip = Clip.getOriginal(project.getClipsLocation());
  const lowResClip = Clip.getLowerResolution(project.getClipsLocation());

  const files = await listEntries(customerAccount.getCredentialsLocation(), 'file');

  if (files && files.length) {
    const userData = await getDeserializedObject<RawUserDetails>(files.pop());

    // FIXME: Come up with project naming strategy
    await putSerializedObject(
      project.getProjectInfoFile().getFullPath(),
      project.createNewProjectInfo(accountId),
    );
  }
  // Convert to lower res
  console.log(lowResClip.location, 'test');
  console.log(clip.location);
  await createMediaConvertingJob(sourceLocation, clip.location, lowResClip.location);

  return clip.location.getFolderUri();
}
