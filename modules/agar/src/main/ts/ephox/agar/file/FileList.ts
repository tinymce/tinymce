import { Arr } from '@ephox/katamari';

const createFileList = (inputFiles: File[]): FileList => {
  const files: FileList = {
    length: inputFiles.length,
    item: (idx: number) => inputFiles[idx],
    [Symbol.iterator]: () => inputFiles[Symbol.iterator]()
  };

  Arr.each(inputFiles, (file, idx) => {
    files[idx] = file;
  });

  return Object.freeze(files) as unknown as FileList;
};

export {
  createFileList
};
