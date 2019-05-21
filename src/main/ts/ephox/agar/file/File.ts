import { Blob, File } from "@ephox/dom-globals";

const createFile = (name: string, lastModified: number, blob: Blob): File => {
  const newBlob: any = new Blob([ blob ], { type: blob.type });

  newBlob.name = name;
  newBlob.lastModified = lastModified;

  return Object.freeze(newBlob);
};

const createFileFromString = (name: string, lastModified: number, text: string, mime: string): File => {
  return createFile(name, lastModified, new Blob([ text ], { type: mime }));
};

export {
  createFile,
  createFileFromString
};
