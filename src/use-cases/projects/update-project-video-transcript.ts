import EntryLocation, { EntryType } from '../../entities/entry-location';
import Clip, { TRANSCRIPTION_EXTENTIONS } from '../../entities/clip';

export interface UpdateProjectVideoTranscriptVM {
  videoPath: string;
  transcript: string;
  items: TranscriptItemVM[];
}

interface TranscriptItemVM {
  start: number;
  end: number;
  text: string | null;
  type: string;
  alternatives: {
    confidence: string;
    content: string;
  }[];
}

export interface Dependencies {
  listEntries(
    folderLocation: EntryLocation,
    entryType: EntryType,
    includeRoot?: boolean,
  ): Promise<EntryLocation[]>;
  getDeserializedObject<T>(fileLocation: EntryLocation): Promise<T>;
  putSerializedObject(objectPath: string, object: unknown): Promise<void>;
}

export default async function updateProjectVideoTranscript(
  { videoPath, transcript, items }: UpdateProjectVideoTranscriptVM,
  { listEntries, getDeserializedObject, putSerializedObject }: Dependencies,
): Promise<void> {
  const videoLocation = new EntryLocation(videoPath);

  const files = await listEntries(videoLocation, 'file');

  let transcriptFileLocation: EntryLocation;
  for (const file of files) {
    if (Clip.isClip(file)) {
      const clip = new Clip(file);

      transcriptFileLocation = clip.getTranscriptionLocation(TRANSCRIPTION_EXTENTIONS.json);
      break;
    }
  }

  const existingTranscript = await getDeserializedObject<{
    jobName: string;
    accountId: string;
    status: string;
    results: {
      transcripts: { transcript: string }[];
      items: {
        start_time: string;
        end_time: string;
        alternatives: { confidence: string; content: string }[];
        type: string;
      }[];
    };
  }>(transcriptFileLocation);

  const itemByStart = items.reduce((result, item) => {
    result[item.start] = item;
    return result;
  }, {});

  existingTranscript.results.transcripts[0].transcript = transcript;

  existingTranscript.results.items = existingTranscript.results.items.filter(
    (item) => itemByStart[Number(item.start_time) || 0],
  );

  for (const item of existingTranscript.results.items) {
    item.alternatives[0].content = itemByStart[Number(item.start_time) || 0].text;
  }

  await putSerializedObject(transcriptFileLocation.getFullPath(), existingTranscript);
}
