import Clip from '../../entities/clip';
import VideoEditingType from '../../entities/video-editing-type';
import EntryLocation from '../../entities/entry-location';

export interface Dependencies {
  createProcessingJob(command: {
    sourceFilePath: string;
    outputType: string;
    outputFilePath: string;
    transcriptionPath: string;
    customParams?: object;
  }): Promise<unknown>;
}

interface RequestClipEditingCM {
  sourceFilePath: string;
  outputType: VideoEditingType;
}

export default async function requestClipProcessing(
  { sourceFilePath, outputType }: RequestClipEditingCM,
  { createProcessingJob }: Dependencies,
): Promise<string> {
  const sourceFileLocation = new EntryLocation(sourceFilePath);
  const clip = new Clip(sourceFileLocation);
  const outputFilePath = clip.getEditingLocation(outputType).getFullPath();
  const transcriptionPath = clip.getTranscriptionLocation().getFullPath();

  await createProcessingJob({
    sourceFilePath,
    outputType,
    outputFilePath,
    transcriptionPath,
  });

  return outputFilePath;
}
