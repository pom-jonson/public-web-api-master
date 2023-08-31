import { ID_REGEX } from '../../../entities/project';
import setupAwsMocks, { AwsMocks } from '../../../utils/tests/aws/setup-aws-mocks';
import { expectStatusCodeWithStandardHeaders, expectString } from '../../../utils/tests/expect';
import recordingEndedCallback from '../media-recording-ended';
import sampleEvent from '../../../adapters/events/samples/recording-ended-event.json';
import listEntries from '../../../adapters/storage/list-entries';
import EntryLocation from '../../../entities/entry-location';
import { getDeserializedObject } from '../../../adapters/storage/get-deserialized-object';
import { ProjectInfo } from '../../../use-cases/projects/list-projects';

describe('recording ended callback', () => {
  let awsMocks: AwsMocks;

  beforeEach(() => {
    awsMocks = setupAwsMocks();
  });

  it(`must return empty body with 400 for unprocessable event`, async () => {
    const result = await recordingEndedCallback({
      someJson: 'goes here',
    });
    expectStatusCodeWithStandardHeaders(result, 400);
  });

  it('must return destination path with 202 for Recording End event', async () => {
    const result = await recordingEndedCallback(sampleEvent);
    expectStatusCodeWithStandardHeaders(result, 202);
    expectString(
      result.body,
      `s3://eos-projects-dev/founders-editonthespot-com/projects/${ID_REGEX.source}-founders-editonthespot-com-2022-02-10-14-11/processed/original`,
    );
  });

  it('must write the info.json file when credentials is found', async () => {
    awsMocks.s3.add('eos-projects-dev', {
      Key: 'founders-editonthespot-com/credentials/userAccount.json',
      Body: Buffer.from(
        JSON.stringify({
          first_name: 'Recorded on Zoom',
        }),
      ),
    });
    const result = await recordingEndedCallback(sampleEvent);
    const location = new EntryLocation('eos-projects-dev/founders-editonthespot-com/projects');

    const file = (await listEntries(location, 'file')).pop();
    const userRawData = await getDeserializedObject<ProjectInfo>(file);
    expect(file.key.includes('info.json')).toBeTruthy();
    expect(userRawData.projectName).toBe('founders-editonthespot-com');
    expectStatusCodeWithStandardHeaders(result, 202);
    expect(true).toBeTruthy();
  });
});
