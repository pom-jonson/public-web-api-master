import { parseMediaConvertingEvent } from './parse-media-converting-event';
import sampleEvent from '../events/samples/media-conversion-ended-event.json';

describe('parse converting event', () => {
  [
    { completelyDifferent: 'json' },
    { detail: { status: 'Some weird status' } },
    {
      detail: {
        outputGroupDetails: [{ outputDetails: [{ outputFilePaths: [] }] }],
      },
    },
  ].forEach((event) => {
    it('throws for invalid input', () => {
      expect(() => parseMediaConvertingEvent(event)).toThrowError();
    });
  });

  [
    {
      event: sampleEvent,
      filePath:
        'eos-founders-editonthespot-com/projects/recorded-on-zoom-2022-02-02-10-44/processed/original/master-footage.mp4',
    },
  ].forEach(({ event, filePath }) => {
    it('returns parsed event', () => {
      expect({ ...parseMediaConvertingEvent(event) }).toStrictEqual({ filePath });
    });
  });
});
