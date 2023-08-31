import EntryLocation from '../../entities/entry-location';
import setupAwsMocks from '../../utils/tests/aws/setup-aws-mocks';
import createMediaConvertingJob from './create-media-converting-job';

describe('created media converting job', () => {
  beforeEach(() => {
    setupAwsMocks();
  });

  it('returns correct name modifier', async () => {
    const inputLocation = new EntryLocation('some/path/master.m3u8');
    const outputLocation = new EntryLocation('output/path/master-footage.mp4');
    const lowResoutputLocation = new EntryLocation('output/path/lowres/master-footage.mp4');

    const result = await createMediaConvertingJob(
      inputLocation,
      outputLocation,
      lowResoutputLocation,
    );

    expect(result.nameModifier).toEqual('-footage');
  });

  it('returns output uri ending with slash', async () => {
    const inputLocation = new EntryLocation('some/path/file.m3u8');
    const outputLocation = new EntryLocation('output/path/result.mp4');
    const lowResoutputLocation = new EntryLocation('output/path/lowres/master-footage.mp4');

    const result = await createMediaConvertingJob(
      inputLocation,
      outputLocation,
      lowResoutputLocation,
    );

    expect(result.outputFolderUri.endsWith('output/path/')).toBeTruthy();
  });
});
