import { ID_REGEX } from '../../entities/project';
import { expectString } from '../../utils/tests/expect';
import createProject from './create-project';

function mockCreateMediaConvertingJob(): Promise<string> {
  return Promise.resolve('');
}

describe('create project', () => {
  it('must return output folder', async () => {
    const result = await createProject(
      {
        filePath:
          'prefix-some-account/folder/ivs/v1/12345678/234kjh32j4/2021/11/30/22/6/43jh32j4k32h4/media/hls/master.m3u8',
        source: 'recorded-on-zoom',
        created: new Date('2021-11-30 22:06'),
      },
      {
        createMediaConvertingJob: mockCreateMediaConvertingJob,
        getDeserializedObject: jest.fn(),
        listEntries: jest.fn(),
        putSerializedObject: jest.fn(),
      },
    );

    expectString(
      result,
      `prefix-some-account/recorded-on-zoom/projects/${ID_REGEX.source}-recorded-on-zoom-2021-11-30-22-06/processed/original`,
    );
  });
});
