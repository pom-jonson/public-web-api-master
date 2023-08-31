import EntryLocation from '../../entities/entry-location';

import { getObject } from './get-object';

export async function getDeserializedObject<T>(fileLocation: EntryLocation): Promise<T> {
  return JSON.parse((await getObject(fileLocation)).toString()) as unknown as T;
}
