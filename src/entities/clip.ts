import { normalizeString } from '../utils';
import VideoEditingType from './video-editing-type';
import EntryLocation from './entry-location';

export const CLIP_FILE_STEM_POSTFIX = 'footage';
export const CLIP_FILE_EXTENSION = 'mp4';
export const TRANSCRIPTION_EXTENTIONS = {
  vtt: 'vtt',
  srt: 'srt',
  json: 'json',
};
export const TRANSCRIPTION_FOLDER = 'transcription';

const ORIGINAL_CLIP_PATH = `original/master-${CLIP_FILE_STEM_POSTFIX}.${CLIP_FILE_EXTENSION}`;
const LOWRES_CLIP_PATH = `original/lowres/master-${CLIP_FILE_STEM_POSTFIX}.${CLIP_FILE_EXTENSION}`;

export default class Clip {
  readonly name: string;

  constructor(readonly location: EntryLocation) {
    if (location.type !== 'file') {
      throw new Error('Can only create clip from file location.');
    }
    if (!Clip.isClip(location)) {
      throw new Error(`Cannot create clip from files different from ${CLIP_FILE_EXTENSION}.`);
    }
    this.location = location;

    this.name = normalizeString(location.getFolder(), '-', ' ', true);
  }

  static isClip(location: EntryLocation): boolean {
    return location.getFileExtension()?.toLocaleLowerCase() === CLIP_FILE_EXTENSION;
  }

  static getOriginal(rootLocation: EntryLocation): Clip {
    const location = rootLocation.getModification(ORIGINAL_CLIP_PATH, 0);
    return new Clip(location);
  }

  static getLowerResolution(rootLocation: EntryLocation): Clip {
    const location = rootLocation.getModification(LOWRES_CLIP_PATH, 0);
    return new Clip(location);
  }

  isOriginal(): boolean {
    return this.location.key.endsWith(`/${ORIGINAL_CLIP_PATH}`);
  }

  getTranscriptionName(extension = TRANSCRIPTION_EXTENTIONS.vtt): string {
    const inputFileStem = this.location.getFileStem();

    return `${inputFileStem}-transcription.${extension}`;
  }

  getTranscriptionLocation(extension = TRANSCRIPTION_EXTENTIONS.vtt): EntryLocation {
    const transcriptionFile = this.getTranscriptionName(extension);
    return this.location.getModification(transcriptionFile, 1);
  }

  getEditingLocation(type: VideoEditingType): EntryLocation {
    return this.location.getModification(
      `${type}/edited-${CLIP_FILE_STEM_POSTFIX}.${CLIP_FILE_EXTENSION}`,
      2,
    );
  }

  getTranscriptionFolderLocation(folder: string): EntryLocation {
    return this.location.getModification(folder, 1);
  }
}
