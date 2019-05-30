import { Arr } from "@ephox/katamari";
import { File, FileList } from "@ephox/dom-globals";

const createFileList = (inputFiles: File[]): FileList => {
  const files = {
    length: inputFiles.length,

    item: (idx: number) => {
      return inputFiles[idx];
    }
  };

  Arr.each(inputFiles, (file, idx) => {
    files[idx] = file;
  });

  return Object.freeze(files) as unknown as FileList;
};

export {
  createFileList
};
