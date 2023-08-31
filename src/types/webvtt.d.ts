declare module 'node-webvtt' {
  interface TranscriptCue {
    identifier: string;
    start: number;
    end: number;
    text: string;
  }

  interface Transcript {
    valid: boolean;
    strict: boolean;
    cues: TranscriptCue[];
  }

  const webvtt: {
    parse(): Transcript;
  };
  export default webvtt;
}
