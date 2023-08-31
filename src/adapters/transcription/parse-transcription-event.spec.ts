import { parseTranscriptionEvent } from './parse-transcription-event';
import sampleEvent from '../events/samples/transcription-ended-event.json';
import setupAwsMocks, { AwsMocks } from '../../utils/tests/aws/setup-aws-mocks';

describe('parse transcription event', () => {
  let awsMocks: AwsMocks;

  beforeEach(() => {
    jest.clearAllMocks();
    awsMocks = setupAwsMocks();
  });

  [
    { completelyDifferent: 'json' },
    { detail: { TranscriptionJobStatus: 'Some weird status' } },
  ].forEach((event) => {
    it('throws for invalid input', () => {
      expect(parseTranscriptionEvent(event)).rejects.toThrowError();
    });
  });

  [
    {
      event: sampleEvent,
      fileUri:
        's3://eos-founders-editonthespot-com/projects/recorded-on-zoom-2022-02-02-10-44/processed/original/master-footage.json',
    },
  ].forEach(({ event, fileUri }) => {
    it('returns parsed event', async () => {
      awsMocks.transcribeMock.addJob(sampleEvent.detail.TranscriptionJobName, fileUri);
      const result = await parseTranscriptionEvent(event);
      expect(result).toStrictEqual({
        folderPath:
          'eos-founders-editonthespot-com/projects/recorded-on-zoom-2022-02-02-10-44/processed/original',
      });
    });
  });
});
