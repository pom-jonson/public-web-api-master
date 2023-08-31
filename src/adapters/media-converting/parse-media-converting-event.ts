import InvalidRequestError from '../../controllers/middleware/invalid-request-error';
import EntryLocation from '../../entities/entry-location';

export interface MediaConvertingEvent {
  filePath: string;
}

interface RawMediaConvertingEvent {
  detail: {
    status: string;
    outputGroupDetails: {
      outputDetails: {
        outputFilePaths: string[];
      }[];
    }[];
  };
}

export function parseMediaConvertingEvent(rawEvent: unknown): MediaConvertingEvent | null {
  const event = rawEvent as RawMediaConvertingEvent;
  if (
    !event ||
    !(event.detail?.status === 'COMPLETE' || event.detail?.status === 'ERROR') ||
    !event.detail?.outputGroupDetails?.length ||
    !event.detail.outputGroupDetails[0].outputDetails?.length ||
    !event.detail.outputGroupDetails[0].outputDetails[0].outputFilePaths?.length
  ) {
    throw new InvalidRequestError('Media conversion event could not be parsed.');
  }

  const fileUri = event.detail.outputGroupDetails[0].outputDetails[0].outputFilePaths[0];
  const location = new EntryLocation(fileUri);

  return {
    filePath: location.getFullPath(),
  };
}
