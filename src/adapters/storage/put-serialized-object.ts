import EntryLocation from '../../entities/entry-location';
import { InvalidParameterError } from '../../use-cases/exceptions';
import { verifyParam } from '../../utils';
import { putObject } from './put-object';

export async function putSerializedObject(objectPath: string, object: unknown): Promise<void> {
  verifyParam(objectPath, 'objectPath');

  const location = new EntryLocation(objectPath);
  if (location.getFileExtension().toLowerCase() != 'json') {
    throw InvalidParameterError.withGenericMessage('objectPath', objectPath);
  }

  const stream = Buffer.from(JSON.stringify(object));
  await putObject(objectPath, stream);
}
