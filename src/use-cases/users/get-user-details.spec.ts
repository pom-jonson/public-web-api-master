/* eslint-disable @typescript-eslint/no-unused-vars */
import EntryLocation, { EntryType } from '../../entities/entry-location';
import setupAwsMocks, { AwsMocks } from '../../utils/tests/aws/setup-aws-mocks';
import getUserDetails, { Dependencies } from './get-user-details';

describe('list projects', () => {
  let awsMock: AwsMocks;
  beforeAll(() => {
    awsMock = setupAwsMocks();
  });

  const getMockDeps = (files?: EntryLocation[], returnNull?: boolean): Dependencies => {
    return {
      listEntries: (_: EntryLocation, type: EntryType) => {
        return Promise.resolve(type === 'folder' ? [] : files);
      },
      getDeserializedObject: () => {
        return !returnNull
          ? Promise.resolve({
              email: 'test@email.com',
            })
          : null;
      },
    };
  };

  it('returns the correct user details', async () => {
    const filePath = 's3://eos-test/projects/11/processed/l/vid.mp4';
    const result = await getUserDetails(
      { bucket: filePath, accountId: 'test-email-com' },
      getMockDeps([
        new EntryLocation(
          's3://eos-prod-founders-editonthespot-com/credentials/founders-editonthespot-com.json',
        ),
      ]),
    );

    expect(result).toEqual({
      email: 'test@email.com',
    });
  });

  it('throw an error when credentials are not found', () => {
    const filePath = 's3://eos-test/projects/11/processed/l/vid.mp4';
    expect(
      getUserDetails({ bucket: filePath, accountId: 'test-email-com' }, getMockDeps([], true)),
    ).rejects.toThrowError();
  });
});
