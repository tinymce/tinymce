export const createEmptyFileList = (): FileList => {
  const empty: File[] = [];
  return Object.freeze({
    length: 0,
    item: (_: number) => null,
    [Symbol.iterator]: () => empty[Symbol.iterator]()
  });
};
