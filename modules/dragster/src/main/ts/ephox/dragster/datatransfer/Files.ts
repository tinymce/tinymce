export const createEmptyFileList = (): FileList => {
  return {
    length: 0,
    item: (_: number) => null
  };
};
