import { parseSageMakerEvent } from './parse-sagemaker-event';
import sageMakerEventSample from '../../adapters/events/samples/sagemaker-job-ended-event.json';
describe('parse sagemaker event', () => {
  it('throws an invalid error for having wrong ProcessingJobStatus', () => {
    const test = {
      detail: {
        ProcessingJobStatus: 'InProgress',
      },
    };
    expect(() => parseSageMakerEvent(test)).toThrowError();
  });

  it('throw an invalid error for missing s3 uri', () => {
    const test = {
      detail: {
        ProcessingJobStatus: 'Completed',
        ProcessingOutputConfig: { Outputs: [{ S3Output: { S3Uri: '' } }] },
      },
    };
    expect(() => parseSageMakerEvent(test)).toThrowError();
  });

  it('returns the parsed event', () => {
    const result = parseSageMakerEvent(sageMakerEventSample);
    expect(result.folderPath).toBe(
      'eos-projects-dev/founders-editonthespot-com/projects/265t1t-recorded-on-zoom-2022-05-02-18-48/processed/top-and-tail',
    );
  });
});
