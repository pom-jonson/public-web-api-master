import EntryLocation from '../../entities/entry-location';
import handleAwsCallback from '../utils';
import { getSignedUrl, SignedUrlOperations } from './get-signed-url';

export async function getSharePath(
  fileLocation: EntryLocation,
  downloadFilename?: string,
): Promise<string> {
  return await handleAwsCallback(async () => {
    return await getSignedUrl(
      fileLocation,
      SignedUrlOperations.GET,
      7 * 24 * 60 * 60,
      downloadFilename,
    );
  });
}
