import { Type } from '@ephox/katamari';

export const readBlobAsString = (blob: Blob): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const reader = new window.FileReader();

    reader.addEventListener('loadend', () => {
      if (Type.isString(reader.result)) {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read blob as string'));
      }
    });

    reader.readAsText(blob);
  });
};

