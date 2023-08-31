import { Deepgram } from '@deepgram/sdk';
import { GET_DEEPGRAM_API_KEY } from '../../../runtime-config';
import EntryLocation from '../../entities/entry-location';
import Clip, { TRANSCRIPTION_EXTENTIONS, TRANSCRIPTION_FOLDER } from '../../entities/clip';
import { putObject } from '../storage/put-object';
import { getSignedUrl, SignedUrlOperations } from '../storage/get-signed-url';

export default async function transcribeVideo(
  inputFileLocation: EntryLocation,
  outputFileLocation: EntryLocation,
): Promise<string> {
  const clip = new Clip(inputFileLocation);

  console.log(clip.location);
  const url = await getSignedUrl(clip.location, SignedUrlOperations.GET);

  const deepGram = new Deepgram(GET_DEEPGRAM_API_KEY());

  const result = await deepGram.transcription.preRecorded(
    { url },
    { punctuate: true, utterances: true },
  );

  const transcribedResult = {
    vtt: result.toWebVTT(),
    srt: result.toSRT(),
  };

  for (const key of Object.keys(transcribedResult)) {
    const fileLocation = clip
      .getTranscriptionFolderLocation(TRANSCRIPTION_FOLDER)
      .getModification(clip.getTranscriptionName(TRANSCRIPTION_EXTENTIONS[key] as string));
    await putObject(fileLocation.getFullPath(), Buffer.from(transcribedResult[key] as string));
  }
  return outputFileLocation.getFolderUri();
}
