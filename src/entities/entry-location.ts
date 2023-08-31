const S3_URI_PREFIX_REGEX = /s3:\/\//i;
const S3_URL_PREFIX_REGEX = /https:\/\/s3\.[a-zA-Z0-9_.-]+\.amazonaws\.com\//i;

export type EntryType = 'file' | 'folder';
export const TIMESTAMP_FILE = 'timestamps.json';
export const LOWRES_FOLDER = 'lowres';
export default class EntryLocation {
  readonly bucket: string;
  readonly accountId: string;
  readonly key: string;
  readonly type: EntryType;
  readonly relativePath: string;
  readonly fileName?: string = undefined;

  constructor(pathOrUri: string) {
    const parts = pathOrUri
      .replace(S3_URL_PREFIX_REGEX, '')
      .replace(S3_URI_PREFIX_REGEX, '')
      .split('/');

    this.bucket = parts[0];
    this.accountId = parts[1];
    this.key = EntryLocation.buildPath(...parts.slice(1, parts.length));

    if (EntryLocation.isFile(pathOrUri)) {
      this.relativePath = EntryLocation.buildPath(...parts.slice(1, parts.length - 1));
      this.fileName = parts.pop();
      this.type = 'file';
    } else {
      this.relativePath = this.key;
      this.type = 'folder';
    }
  }

  static fromPartsOfPath(bucket: string, key: string): EntryLocation {
    return new EntryLocation(this.buildPath(bucket, key));
  }

  static buildPath(...parts: string[]): string {
    return parts.filter((el) => !!el).join('/');
  }

  static isFile(pathOrUri: string): boolean {
    return pathOrUri.split('/').pop().indexOf('.') > -1;
  }

  getFolder(): string {
    return this.relativePath.split('/').pop();
  }

  getFolderLocation(): EntryLocation {
    return new EntryLocation(this.getFolderUri());
  }

  getBucketLocation(): EntryLocation {
    return new EntryLocation(this.bucket);
  }

  getFileStem(): string | undefined {
    return this.fileName?.split('.').shift();
  }

  getFileExtension(): string | undefined {
    return this.fileName?.split('.').pop();
  }

  getTimestampFile(): string {
    return EntryLocation.buildPath(this.getFolderUri(), TIMESTAMP_FILE);
  }

  getFullPath(): string {
    return EntryLocation.buildPath(this.bucket, this.key);
  }

  getFolderPath(): string {
    return EntryLocation.buildPath(this.bucket, this.relativePath);
  }

  getFolderUri(): string {
    return EntryLocation.buildPath('s3:/', this.bucket, this.relativePath);
  }

  getFullUri(): string {
    return EntryLocation.buildPath('s3:/', this.bucket, this.key);
  }

  getModification(keyToInsert: string, offsetFromEnd = 0): EntryLocation {
    const pathParts = this.getFullPath().split('/');

    const newParts = pathParts.slice(0, pathParts.length - offsetFromEnd);
    newParts.push(keyToInsert);

    return new EntryLocation(EntryLocation.buildPath(...newParts));
  }

  isSubLocationOf(location: EntryLocation): boolean {
    const subPathParts = this.getFullPath().toLowerCase().split('/');
    const pathParts = location.getFullPath().toLocaleLowerCase().split('/');
    for (let i = 0; i < subPathParts.length; i++) {
      if (subPathParts[i] !== pathParts[i]) {
        return false;
      }
    }
    return true;
  }
}
