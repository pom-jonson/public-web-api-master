import { APIGatewayProxyResult } from 'aws-lambda';

/* istanbul ignore file */

export function expectHeaders(
  headers: { [name: string]: string | number | boolean },
  expectedHeaders: { [name: string]: string | number | boolean } = {
    'Access-Control-Allow-Origin': '*',
  },
): void {
  expect(headers).toStrictEqual(expectedHeaders);
}

export function expectStatusCodeWithStandardHeaders(
  result: APIGatewayProxyResult,
  statusCode: number,
): void {
  expect(result.statusCode).toBe(statusCode);
  expectHeaders(result.headers);
}

export function expectStatusCodeWithAdditionalHeaders(
  result: APIGatewayProxyResult,
  statusCode: number,
  additionalHeaders = {
    'Content-type': 'application/octet-stream',
    'Access-Control-Allow-Origin': '*',
  },
): void {
  expect(result.statusCode).toBe(statusCode);
  expectHeaders(result.headers, additionalHeaders);
}

export function expectString(str: string, regexString: string): void {
  expect(str).toStrictEqual(expect.stringMatching(new RegExp(regexString)));
}

export function expectEqualArrays(value: unknown[], expectation: unknown[]): void {
  expect(JSON.stringify(value)).toEqual(JSON.stringify(expectation));
}
