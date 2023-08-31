/* eslint-disable @typescript-eslint/no-unused-vars */
import { TranscriptionSource, PrerecordedTranscriptionOptions } from '@deepgram/sdk/dist/types';

export default class DeepgramMock {
  transcription = {
    preRecorded: (source: TranscriptionSource, options: PrerecordedTranscriptionOptions) => {
      return {
        toWebVTT: () => 'vtt file',
        toSRT: () => 'srt file',
      };
    },
  };
}
