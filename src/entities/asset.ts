class Asset {
  static getAllowedImageTypes(): string[] {
    return ['png'];
  }
  static getAllowedImageSizes(): {
    minWidth: number;
    minHeight: number;
    maxWidth: number;
    maxHeight: number;
  }[] {
    return [
      { maxWidth: 1920, maxHeight: 1080, minWidth: 1280, minHeight: 720 },
      { maxWidth: 1080, maxHeight: 1920, minWidth: 720, minHeight: 1280 },
    ];
  }
  static getAllowedFileTypes(): string[] {
    return this.getAllowedImageTypes().concat('mp4');
  }
  static isAllowedImage(fileExtension: string): boolean {
    return this.getAllowedImageTypes().includes(fileExtension);
  }
}

export default Asset;
