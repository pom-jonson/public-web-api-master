import Clip from '../../entities/clip';
import EntryLocation, { EntryType } from '../../entities/entry-location';
import { verifyParam } from '../../utils';
import { InvalidParameterError, NotFoundError, UnexpectedError } from '../exceptions';

export interface Dependencies {
  listEntries(folderLocation: EntryLocation, entryType: EntryType): Promise<EntryLocation[]>;
}

interface GetClipPathQM {
  folderPath: string;
}

export const INVALID_FOLDER_LOCATION_ERROR = 'Specified path is invalid.';

export default async function getClipPath(
  { folderPath }: GetClipPathQM,
  { listEntries }: Dependencies,
): Promise<string> {
  verifyParam(folderPath, 'folderPath');

  const folderLocation = new EntryLocation(folderPath);
  if (folderLocation?.type !== 'folder') {
    throw new InvalidParameterError(INVALID_FOLDER_LOCATION_ERROR);
  }
  const inputFiles = await listEntries(folderLocation, 'file');

  const clipLocations = inputFiles.filter((el) => Clip.isClip(el));
  if (!clipLocations || clipLocations.length == 0) {
    throw new NotFoundError(folderPath);
  }
  if (clipLocations.length > 1) {
    throw new UnexpectedError(`Ambiguous clip location ${folderPath}.`);
  }

  return clipLocations.pop().getFullPath();
}
