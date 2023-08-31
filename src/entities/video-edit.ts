import { normalizeString } from '../utils';
import EntryLocation from './entry-location';
import Timing from './timing';
import VideoEditingType from './video-editing-type';

const TIMING_FILE_NAME = 'timestamps.json';
const EDIT_FILE_NAME = 'edit.json';

export type VideoEditingStatus = 'InReview' | 'Processing' | 'Processed';

export interface VideoEditProps {
  name?: string;
  type: VideoEditingType;
  status?: VideoEditingStatus;
  timing: Timing;
  lastModifiedDate?: Date;
  history?: Omit<VideoEditProps, 'history'>[];
}

export default class VideoEdit {
  readonly name: string;
  readonly type: VideoEditingType;
  readonly status: VideoEditingStatus;
  readonly timing: Timing;
  readonly lastModifiedDate: Date;
  readonly history: Omit<VideoEditProps, 'history'>[];

  constructor(props: VideoEditProps) {
    this.name = props.name ?? normalizeString(props.type, '-', ' ', true);
    this.type = props.type;
    this.status = props.status ?? 'InReview';
    this.timing = props.timing;
    this.lastModifiedDate = props.lastModifiedDate ?? new Date();
    this.history = props.history ?? [];
  }

  static isTiming(location: EntryLocation): boolean {
    return location.fileName?.toLocaleLowerCase() === TIMING_FILE_NAME;
  }

  static isEdit(location: EntryLocation): boolean {
    return location.fileName?.toLocaleLowerCase() === EDIT_FILE_NAME;
  }

  static getEditLocation(folderLocation: EntryLocation): EntryLocation {
    return folderLocation.getModification(EDIT_FILE_NAME);
  }

  update({ status, timing }: { status: VideoEditingStatus; timing: Timing }): VideoEdit {
    const result = new VideoEdit({ ...this, status, timing });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { history, ...rest } = this;
    result.history.push(rest);

    return result;
  }
}
