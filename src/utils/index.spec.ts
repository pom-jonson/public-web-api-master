import {
  addPostfix,
  assembleDate,
  dedup,
  formatBytes,
  newId,
  normalizeString,
  validateImage,
  verifyParam,
} from '.';
import { InvalidParameterError } from '../use-cases/exceptions';
import validPngImage from './valid-png-image.json';
import validJpgImage from './valid-jpg-image.json';

describe('new id', () => {
  it('must generate non-repeating id', () => {
    const previousResults: string[] = [];
    for (let i = 0; i < 10; i++) {
      const result = newId();
      expect(previousResults).not.toContainEqual(result);
      expect(result.length).toBe(6);
      previousResults.push(result);
    }
  });
});

describe('formatBytes', () => {
  [
    { size: 123321, multiplier: 'KB', decimals: 2, formattedSize: '120.43 KB' },
    { size: 123454321, multiplier: 'MB', decimals: 0, formattedSize: '118 MB' },
    { size: 5432112345, multiplier: 'GB', decimals: 3, formattedSize: '5.059 GB' },
  ].forEach(({ size, multiplier, decimals, formattedSize }) =>
    it(`must return correct ${multiplier}`, () => {
      const result = formatBytes(size, decimals);
      expect(result).toBe(formattedSize);
    }),
  );
});

describe('assemble date', () => {
  [
    ['-1', '1', '1', '1', '1'],
    ['2021', '12', '31', '23', 'a'],
    ['2021', '13', '31', '23', '0'],
    ['2001', '02', '30', '23', '0'],
  ].forEach((parts) =>
    it(`must throw when parts is ${JSON.stringify(parts)}`, () => {
      expect(() => assembleDate(parts)).toThrowError();
    }),
  );

  [
    { parts: ['1001', '1', '1', '1', '1'], date: new Date(1001, 0, 1, 1, 1) },
    { parts: ['2021', '12', '31', '23', '59'], date: new Date('2021-12-31 23:59') },
    { parts: ['2022', '02', '08', '0', '00'], date: new Date('2022-02-08 00:00') },
  ].forEach(({ parts, date }) =>
    it(`when parts is ${JSON.stringify(parts)}, then date is ${JSON.stringify(date)}`, () => {
      const result = assembleDate(parts);
      expect(result).toStrictEqual(date);
    }),
  );
});

describe('normalize string', () => {
  [
    {
      source: 's3://yet/another/path',
      symbolsToReplace: ':/',
      replaceWith: '-',
      capitalize: false,
      result: 's3---yet-another-path',
    },
    {
      source: 'completely|different||string',
      symbolsToReplace: '|',
      replaceWith: '/:',
      capitalize: false,
      result: 'completely/:different/:/:string',
    },
    {
      source: 'mama-papa',
      symbolsToReplace: 'ma',
      replaceWith: '+',
      capitalize: false,
      result: '++++-p+p+',
    },
    {
      source: 'alpha-bravo-c-4',
      symbolsToReplace: '-',
      replaceWith: ' ',
      capitalize: true,
      result: 'Alpha Bravo C 4',
    },
  ].forEach(({ source, symbolsToReplace, replaceWith, capitalize, result }) => {
    it('must return string with replaced symbols', () => {
      expect(normalizeString(source, symbolsToReplace, replaceWith, capitalize)).toBe(result);
    });
  });
});

describe('add postfix', () => {
  it('adds postfix', () => {
    const result = addPostfix('some/string', '/');
    expect(result).toBe('some/string/');
  });

  it('doesnt add postfix when it already exists', () => {
    const result = addPostfix('something+', '+');
    expect(result).toBe('something+');
  });
});

describe('dedup', () => {
  [
    { array: ['test', 'test', '1', '3', '2', '1', '3'], result: ['test', '1', '3', '2'] },
    { array: [3, 3, 1, 2, 1, 2], result: [3, 1, 2] },
  ].forEach(({ array, result }) => {
    it(`when array is ${JSON.stringify(array)}, then result is ${JSON.stringify(result)}`, () => {
      expect(dedup(array)).toStrictEqual(result);
    });
  });
});

describe('verify param', () => {
  ['', 0, null, undefined].forEach((value) => {
    it(`throws when param is ${value}`, () => {
      expect(() => verifyParam(value, 'some-param')).toThrowError(
        InvalidParameterError.withGenericMessage('some-param', value),
      );
    });
  });

  it(`throws when value doesnt match regex`, () => {
    expect(() => verifyParam('a', 'some-param', /\d/)).toThrowError(
      InvalidParameterError.withGenericMessage('some-param', 'a'),
    );
  });
});

describe('validate image', () => {
  it('throws when passed content is not image', () => {
    expect(() => validateImage(Buffer.from('123'))).toThrow();
  });

  it('doesnt throw when passed content is a valid image', () => {
    const content = Buffer.from(validPngImage);
    expect(() => validateImage(content)).not.toThrow();
  });

  it('throws when image is of invalid size', () => {
    const content = Buffer.from(validPngImage);
    expect(() =>
      validateImage(content, {
        allowedResolutions: [{ maxWidth: 100, maxHeight: 200, minWidth: 100, minHeight: 200 }],
      }),
    ).toThrow();
  });

  it('throws when image is of invalid type', () => {
    const content = Buffer.from(validJpgImage);
    expect(() => validateImage(content, { allowedTypes: ['png'] })).toThrow();
  });

  it('doesnt throw when image is of valid type', () => {
    const content = Buffer.from(validJpgImage);
    expect(() => validateImage(content, { allowedTypes: ['jpg'] })).not.toThrow();
  });

  it('doesnt throw when image is of valid type and size', () => {
    const content = Buffer.from(validPngImage);
    expect(() =>
      validateImage(content, {
        allowedTypes: ['png'],
        allowedResolutions: [{ maxWidth: 1920, maxHeight: 1080, minWidth: 1280, minHeight: 720 }],
      }),
    ).not.toThrow();
  });
});
