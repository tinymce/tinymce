import * as BlobReader from './BlobReader';

const createFile = (name: string, lastModified: number, blob: Blob): File => {
  const newBlob: any = new Blob([ blob ], { type: blob.type });

  newBlob.name = name;
  newBlob.lastModified = lastModified;

  return Object.freeze(newBlob);
};

const createFileFromString = (name: string, lastModified: number, text: string, mime: string): File => createFile(name, lastModified, new Blob([ text ], { type: mime }));

const getFileDataAsString = (file: File): Promise<string> => BlobReader.readBlobAsString(file);

export {
  createFile,
  createFileFromString,
  getFileDataAsString
};
