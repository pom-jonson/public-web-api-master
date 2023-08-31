import EntryLocation from '../../entities/entry-location';
import setupAwsMocks from '../../utils/tests/aws/setup-aws-mocks';
import listEntries from './list-entries';
import { putSerializedObject } from './put-serialized-object';

describe('upload assets', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupAwsMocks();
  });

  [undefined, 's3://my-bucket/folder', 's3://my-bucket/folder/file.txt'].forEach((path) => {
    it(`throws when file in path is not json`, () => {
      expect(putSerializedObject(path, {})).rejects.toThrow();
    });
  });

  it(`uploads the correct file`, async () => {
    const location = new EntryLocation('s3://my-bucket/folder/file.json');
    await putSerializedObject(location.getFullUri(), { test: 'test' });

    const entries = await listEntries(location, 'file');

    expect(entries.pop().key).toBe(location.key);
  });
});
