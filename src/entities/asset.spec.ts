import Asset from './asset';

describe('asset', () => {
  [
    { extension: 'png', expectedResult: true },
    { extension: 'mp4', expectedResult: true },
    { extension: 'jpeg', expectedResult: false },
  ].forEach(({ extension, expectedResult }) => {
    it('throws for incorrect extension', () => {
      expect(Asset.getAllowedFileTypes().includes(extension)).toBe(expectedResult);
    });
  });
});
