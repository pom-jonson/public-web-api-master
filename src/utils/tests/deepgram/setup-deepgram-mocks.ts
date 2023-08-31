import DeepgramMock from '.';
import { Deepgram } from '@deepgram/sdk';

export default function setupAwsMocks(): DeepgramMocks {
  const deepgramMocks = new DeepgramMocks();

  (Deepgram as unknown as jest.Mock).mockReturnValue(deepgramMocks.deepgram);

  return deepgramMocks;
}

export class DeepgramMocks {
  deepgram = new DeepgramMock();
}
