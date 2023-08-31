import moment from 'moment';
import { InvalidParameterError } from '../use-cases/exceptions';
import { assembleDate, newId, normalizeString } from '../utils';
import EntryLocation from './entry-location';

export const ID_LENGTH = 6;
export const ID_REGEX = new RegExp(`([a-z0-9]){${ID_LENGTH}}`);

export const PROJECT_INFO_EXTENSION = 'json';
export const PROJECT_INFO_FILE = `info.${PROJECT_INFO_EXTENSION}`;
export default class Project {
  readonly location: EntryLocation;

  constructor(
    rootLocation: EntryLocation,
    readonly id: string,
    readonly name: string,
    readonly created: Date,
  ) {
    this.name = normalizeString(name, '/:.- ', ' ', true);

    const stringDate = moment(created).format('YYYY-MM-DD-HH-mm');
    const nameInPath = normalizeString(name, '/:. ', '-').toLowerCase();

    this.location = rootLocation.getModification(`${id}-${nameInPath}-${stringDate}`);
  }

  static fromLocation(location: EntryLocation): Project {
    const folderParts = location.getFolder().split('-');
    if (folderParts.length < 6) {
      throw new InvalidParameterError(`Provided folder ${location.getFolder()} cannot be parsed.`);
    }

    const rootLocation = location.getModification('', 1);
    const id = folderParts[0];
    const name = folderParts
      .slice(1, folderParts.length - 5)
      .map((el) => el.charAt(0).toUpperCase() + el.substring(1))
      .join(' ');
    const created = assembleDate(folderParts.slice(folderParts.length - 5, folderParts.length));

    return new Project(rootLocation, id, name, created);
  }

  static createNew(rootLocation: EntryLocation, source: string, created: Date): Project {
    return new Project(rootLocation, newId(), source, created);
  }

  static isProjectInfo(location: EntryLocation): boolean {
    return location.fileName?.toLocaleLowerCase() === PROJECT_INFO_FILE;
  }

  createNewProjectInfo(projectName: string, multipartUploadId?: string): object {
    return {
      projectName,
      multipartUploadId,
    };
  }

  getClipsLocation(): EntryLocation {
    return this.location.getModification('processed');
  }

  getProjectInfoFile(): EntryLocation {
    return this.location.getModification(PROJECT_INFO_FILE);
  }

  rename(name: string): Project {
    return new Project(this.location.getModification('', 1), this.id, name, this.created);
  }
}

export interface ProjectInfo {
  projectName: string;
  multipartUploadId?: string;
}
