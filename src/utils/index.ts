/* eslint-disable @typescript-eslint/ban-ts-comment */
import { InvalidParameterError } from '../use-cases/exceptions';
import sizeOf, { disableTypes, types } from 'image-size';

/* istanbul ignore file */

export const DASHED_DATE_TIME_REGEX = /\d{4}-\d{1,2}-\d{1,2}-\d{1,2}-\d{1,2}/;
const ID_ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789';

export function newId(length = 6): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += ID_ALPHABET.charAt(ID_ALPHABET.length * Math.random());
  }
  return result;
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function getRandomDate(start?: Date, end?: Date): Date {
  const currentDate = new Date();
  start ??= new Date(currentDate.getFullYear() - 3, currentDate.getMonth(), currentDate.getDate());
  end ??= currentDate;
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

export function assembleDate(parts: string[]): Date {
  const intParts: number[] = [];
  parts.forEach((el) => intParts.push(Number.parseInt(el)));

  const ms = Date.parse(
    `${intParts[0]}-${intParts[1]}-${intParts[2]} ${intParts[3]}:${intParts[4]}`,
  );
  const date = new Date(ms);

  if (
    date.getFullYear() != intParts[0] ||
    date.getMonth() + 1 != intParts[1] ||
    date.getDate() != intParts[2] ||
    date.getHours() != intParts[3] ||
    date.getMinutes() != intParts[4]
  ) {
    throw new Error('Invalid date.');
  }

  return date;
}

export function getRandomInt(min?: number, max?: number): number {
  min ??= 500000;
  max ??= 10000000;
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function normalizeString(
  source: string,
  symbolsToReplace: string,
  replaceWith: string,
  capitalize = false,
): string {
  let result = source;
  symbolsToReplace.split('').forEach((symbol) => {
    let splitStrings = result.split(symbol);
    if (capitalize) {
      splitStrings = splitStrings.map((el) => el.charAt(0).toUpperCase() + el.substring(1));
    }
    result = splitStrings.join(replaceWith);
  });
  return result;
}

export function addPostfix(source: string, postfix: string): string {
  return source.endsWith(postfix) ? source : `${source}${postfix}`;
}

export function dedup(array: unknown[]): unknown[] {
  return array.filter((el, i, ar) => ar.indexOf(el) === i);
}

export function verifyParam(value: unknown, paramName: string, regex: RegExp = undefined): void {
  if (!value) {
    throw InvalidParameterError.withGenericMessage(paramName, value);
  }
  if (regex && !regex.test(String(value))) {
    throw InvalidParameterError.withGenericMessage(paramName, value);
  }
}

export function validateImage(
  content: Buffer,
  restrictions?: {
    allowedTypes?: string[];
    allowedResolutions?: {
      minWidth: number;
      minHeight: number;
      maxWidth: number;
      maxHeight: number;
    }[];
  },
): void {
  if (restrictions?.allowedTypes) {
    //@ts-ignore
    disableTypes(types.filter((el) => !restrictions.allowedTypes.includes(el)));
  }
  const dimensions = sizeOf(content);

  if (
    restrictions?.allowedResolutions &&
    !restrictions.allowedResolutions.some(
      ({ maxWidth, maxHeight, minWidth, minHeight }) =>
        maxWidth >= dimensions.width &&
        maxHeight >= dimensions.height &&
        minWidth <= dimensions.width &&
        minHeight <= dimensions.height,
    )
  ) {
    throw new TypeError(
      `Received image resolution {${JSON.stringify(
        dimensions,
      )}} is not supported. Supported resolutions: ${JSON.stringify(
        restrictions.allowedResolutions,
      )}.`,
    );
  }
}

export function splitFile(file: Buffer, chunkSize: number) {
  const totalChunks = Math.ceil(file.length / chunkSize);
  const chunks = [];

  for (let i = 0; i < totalChunks; i++) {
    const start = i * chunkSize;
    const end = start + chunkSize;
    const chunk = file.slice(start, end);
    chunks.push(chunk);
  }

  return chunks;
}
