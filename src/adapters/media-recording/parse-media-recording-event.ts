import InvalidRequestError from '../../controllers/middleware/invalid-request-error';
import { assembleDate } from '../../utils';

interface RawMediaRecordingEvent {
  detail: {
    channel_name: string;
    recording_status: string;
    recording_s3_bucket_name: string;
    recording_s3_key_prefix: string;
  };
}

export interface MediaRecordingEvent {
  filePath: string;
  source: string;
  created: Date;
}

export function parseMediaRecordingEvent(rawEvent: unknown): MediaRecordingEvent | null {
  const event = rawEvent as RawMediaRecordingEvent;
  if (!event || !event.detail?.recording_status?.startsWith('Recording End')) {
    throw new InvalidRequestError('Media recording event could not be parsed.');
  }

  const prefix = event.detail?.recording_s3_key_prefix;
  console.log('Parsing: ', event.detail);
  const created = assembleDate(prefix.split('/').slice(4, 9));

  return {
    filePath: `${event.detail.recording_s3_bucket_name}/${prefix}/media/hls/master.m3u8`,
    // We will read source from channel_name in the future (e.g. Zoom or Twitch)
    source: event.detail.channel_name,
    created,
  };
}
