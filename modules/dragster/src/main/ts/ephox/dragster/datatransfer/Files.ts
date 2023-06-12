export const createEmptyFileList = (): FileList =>
  Object.freeze({
    length: 0,
    item: (_: number) => null
  });
