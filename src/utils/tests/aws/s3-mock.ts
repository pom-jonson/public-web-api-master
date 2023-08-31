import { AWSError, S3 } from 'aws-sdk';
import { CommonPrefix } from 'aws-sdk/clients/s3';
import { dedup } from '../..';

/* istanbul ignore file */

export interface S3ObjectMock {
  Key: string;
  LastModified?: Date;
  Size?: number;
  Body?: Buffer;
}

export default class S3Mock {
  private _objects: { [bucket: string]: S3ObjectMock[] } = {};
  private _throwError = false;

  private _filterObjects = (
    bucket: string,
    prefix: string,
    delimiter: string,
  ): { Contents: S3ObjectMock[]; CommonPrefixes: CommonPrefix[] } => {
    if (!this._objects[bucket]) {
      throw { statusCode: 404 } as AWSError;
    }

    let filteredObjects = this._objects[bucket].filter(
      (el) => !el.Key || el.Key.startsWith(prefix),
    );

    let commonPrefixes: CommonPrefix[] = [];
    if (delimiter) {
      const prefixes = filteredObjects.map((el) =>
        el.Key.substring(0, el.Key.indexOf(delimiter, prefix.length)),
      );

      commonPrefixes = dedup(prefixes)
        .filter((el) => !!el)
        .map((el) => ({ Prefix: el } as CommonPrefix));
      filteredObjects = [];
    }

    return {
      Contents: filteredObjects.sort((a, b) => a.Key.localeCompare(b.Key)),
      CommonPrefixes: commonPrefixes,
    };
  };

  add = (bucket: string, object?: S3ObjectMock): S3ObjectMock => {
    if (!this._objects[bucket]) {
      this._objects[bucket] = [] as S3ObjectMock[];
    }
    if (object) {
      this._objects[bucket].push(object);
    }
    return object;
  };

  setThrowError = (): void => {
    this._throwError = true;
  };

  listObjectsV2 = (params: { Bucket: string; Prefix: string; Delimiter: string }): unknown => {
    if (this._throwError) {
      throw new Error();
    }

    return {
      promise: () =>
        Promise.resolve(this._filterObjects(params.Bucket, params.Prefix, params.Delimiter)),
    };
  };

  getSignedUrlPromise = (
    operation: string,
    params: { Bucket: string; Key: string },
  ): Promise<string> => {
    return Promise.resolve(`${params.Bucket}/${params.Key}`);
  };

  copyObject = (params: { CopySource: string; Bucket: string; Key: string }): unknown => {
    const { CopySource, Bucket, Key } = params;

    const parts = CopySource.split('/');
    const bucket = parts[0];
    const prefix = parts.slice(1, parts.length).join('/');

    const source = this._filterObjects(bucket, prefix, undefined);
    if (!source.Contents || source.Contents.length === 0) {
      throw new Error('Source object doesnt exist.');
    }

    this.add(Bucket, { ...source, Key });
    return {
      promise: () => Promise.resolve(),
    };
  };

  deleteObject = (params: { Bucket: string; Key: string }): unknown => {
    const { Bucket, Key } = params;

    if (this._objects[Bucket]) {
      this._objects[Bucket] = this._objects[Bucket].filter((el) => el.Key != Key);
    }

    return {
      promise: () => Promise.resolve(),
    };
  };

  getObject = (params: { Bucket: string; Key: string }): unknown => {
    const { Bucket, Key } = params;
    const object = this._objects[Bucket].filter((el) => el.Key === Key);
    return {
      promise: () => Promise.resolve(object.pop()),
    };
  };

  upload = (params: { Bucket: string; Body: Buffer; Key: string }): unknown => {
    return {
      promise: () =>
        Promise.resolve(
          this.add(params.Bucket, {
            Key: params.Key,
            Body: params.Body,
          }),
        ),
    };
  };

  putBucketCors = (params: {
    Bucket: string;
    Key: string;
    CORSConfiguration: S3.CORSConfiguration;
  }): unknown => {
    const { Bucket } = params;

    return {
      promise: () => {
        const bucket = this._objects[Bucket];
        if (!bucket) {
          return Promise.reject();
        }
        return Promise.resolve();
      },
    };
  };
  headBucket = (params: { Bucket: string }): unknown => {
    return {
      promise: () =>
        !this._objects[params.Bucket]
          ? Promise.reject({
              statusCode: 404,
            })
          : Promise.resolve(this._objects[params.Bucket]),
    };
  };
  createBucket = (params: { Bucket: string }): unknown => {
    return {
      promise: () => this.add(params.Bucket),
    };
  };
}
