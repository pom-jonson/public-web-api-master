import { parseMediaRecordingEvent } from './parse-media-recording-event';

describe('parse recording event', () => {
  [
    {
      completelyDifferent: 'json',
    },
    {
      detail: {
        recording_status: 'Some weird status',
      },
    },
  ].forEach((event) => {
    it('throws for invalid input', () => {
      expect(() => parseMediaRecordingEvent(event)).toThrowError();
    });
  });

  [
    {
      detail: {
        recording_status: 'Recording End',
        recording_s3_key_prefix: 'ivs/v1/a/b/2021/11/30/22',
      },
    },
    {
      detail: {
        recording_status: 'Recording End',
        recording_s3_key_prefix: 'ivs/v1/a/b/1500/02/30/10/5',
      },
    },
  ].forEach((event) => {
    it(`throws for invalid date in path`, () => {
      expect(() => parseMediaRecordingEvent(event)).toThrowError();
    });
  });

  [
    {
      event: {
        detail: {
          channel_name: 'Your channel name',
          recording_status: 'Recording End',
          recording_s3_bucket_name: 'bucket',
          recording_s3_key_prefix: 'ivs/v1/12345678/234kjh32j4/2021/11/30/22/6/43jh32j4k32h4',
        },
      },
      result: {
        filePath:
          'bucket/ivs/v1/12345678/234kjh32j4/2021/11/30/22/6/43jh32j4k32h4/media/hls/master.m3u8',
        source: 'Your channel name',
        created: new Date('2021-11-30 22:06'),
      },
    },
  ].forEach(({ event, result }) => {
    it('returns parsed event', () => {
      expect(parseMediaRecordingEvent(event)).toStrictEqual(result);
    });
  });
});
