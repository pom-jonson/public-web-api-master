import EntryLocation, { EntryType } from '../../entities/entry-location';
import Clip, { TRANSCRIPTION_EXTENTIONS } from '../../entities/clip';
import webvtt from 'node-webvtt';

export interface Dependencies {
  listEntries(
    folderLocation: EntryLocation,
    entryType: EntryType,
    includeRoot?: boolean,
  ): Promise<EntryLocation[]>;
  getDeserializedObject<T>(fileLocation: EntryLocation): Promise<T>;
}

export interface GetProjectVideoTranscriptQM {
  videoPath: string;
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

export interface ProjectVideoTranscriptVM {
  transcript: string;
  items: TranscriptItemVM[];
}

export default async function getProjectVideoTranscript(
  { videoPath }: GetProjectVideoTranscriptQM,
  { listEntries, getDeserializedObject }: Dependencies,
): Promise<ProjectVideoTranscriptVM> {
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

  const transcript = await getDeserializedObject<{
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

  return {
    transcript: transcript.results.transcripts[0]?.transcript,
    items: transcript.results.items.map((item) => ({
      start: Number(item.start_time) || 0,
      end: Number(item.end_time) || 0,
      text: item.alternatives[0]?.content,
      type: item.type,
      alternatives: item.alternatives,
    })),
  };
}
