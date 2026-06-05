import { Arr } from '@ephox/katamari';

const createFileList = (inputFiles: File[]): FileList => {
  const snapshot = inputFiles.slice();
  const files: FileList = {
    length: snapshot.length,
    item: (idx: number) => snapshot[idx] ?? null,
    [Symbol.iterator]: () => snapshot[Symbol.iterator]()
  };

  Arr.each(snapshot, (file, idx) => {
    files[idx] = file;
  });

  return Object.freeze(files) as unknown as FileList;
};

export {
  createFileList
};
