import { TranscriptionJob } from 'aws-sdk/clients/transcribeservice';

export default class TranscribeMock {
  private _jobs: { [name: string]: TranscriptionJob } = {};

  startTranscriptionJob = (): unknown => {
    return { promise: () => Promise.resolve() };
  };

  getTranscriptionJob = (params: { TranscriptionJobName: string }): unknown => {
    return {
      promise: () => Promise.resolve({ TranscriptionJob: this._jobs[params.TranscriptionJobName] }),
    };
  };

  addJob(jobName: string, fileUri: string): void {
    this._jobs[jobName] = { Transcript: { TranscriptFileUri: fileUri } };
  }
}
