import InvalidRequestError from '../../controllers/middleware/invalid-request-error';
import EntryLocation from '../../entities/entry-location';

interface SageMakerCompletedEvent {
  folderPath: string;
}

interface RawSagemakerEvent {
  detail: {
    ProcessingOutputConfig: {
      Outputs: { S3Output: { S3Uri: string } }[];
    };
    ProcessingJobStatus: string;
  };
}

export function parseSageMakerEvent(rawEvent: unknown): SageMakerCompletedEvent {
  const event = rawEvent as RawSagemakerEvent;
  if (
    !event ||
    event.detail?.ProcessingJobStatus !== 'Completed' ||
    !event.detail.ProcessingOutputConfig.Outputs[0].S3Output?.S3Uri
  ) {
    throw new InvalidRequestError('SageMaker event could not be parsed.');
  }
  const location = new EntryLocation(event.detail.ProcessingOutputConfig.Outputs[0].S3Output.S3Uri);
  return {
    folderPath: location.getFullPath(),
  };
}
