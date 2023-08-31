import parseBody from './parse-body';
import sampleEvent from '../../adapters/events/samples/sample-multiformdata-body.json';
import { ParsedPayload } from '../../controllers/assets/upload-asset';
describe('parse body', () => {
  [undefined, ''].forEach((body) => {
    it(`throws if body is ${body}`, () => {
      expect(async () => await parseBody({ body })).rejects.toThrowError();
    });
  });

  it(`parses non-encoded body`, async () => {
    const result = await parseBody({ body: '{"prop":"value"}' });
    expect(result).toStrictEqual({ prop: 'value' });
  });

  it(`parses encoded body`, async () => {
    const result = await parseBody({
      body: 'ewogICAgIm5hbWUiOiAiVGVzdCIKfQ==',
      isBase64Encoded: true,
    });
    expect(result).toStrictEqual({ name: 'Test' });
  });

  it(`validates body`, () => {
    expect(
      async () => await parseBody({ body: '{"requiredProp":""}' }, { requiredProp: 'required' }),
    ).rejects.toThrowError();
  });

  it(`parses multipart/form event`, async () => {
    const { files } = await parseBody<ParsedPayload>(sampleEvent);
    expect(files).toHaveLength(1);
  });
});
