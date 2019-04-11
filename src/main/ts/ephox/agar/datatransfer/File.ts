import { Blob, File } from "@ephox/dom-globals";

const createFile = (name: string, lastModified: number, blob: Blob): File => {
  const newBlob: any = new Blob([ blob ], { type: blob.type });

  newBlob.name = name;
  newBlob.lastModified = lastModified;

  return Object.freeze(newBlob);
};

export {
  createFile
};
