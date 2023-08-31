import EntryLocation from '../../entities/entry-location';
import handleAwsCallback from '../utils';
import { getSignedUrl, SignedUrlOperations } from './get-signed-url';

export async function getPublicPath(fileLocation: EntryLocation): Promise<string> {
  return await handleAwsCallback(async () => {
    return await getSignedUrl(fileLocation, SignedUrlOperations.GET);
  });
}
