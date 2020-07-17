import { FutureResult, Result } from '@ephox/katamari';

const readBlobAsText = (blob: Blob): FutureResult<string, string> => FutureResult.nu((resolve) => {
  const reader = new FileReader();
  reader.readAsText(blob);
  reader.onloadend = () => {
    resolve(Result.value(reader.result as string));
  };
  reader.onerror = (_evt) => {
    resolve(Result.error('Error loading blob'));
  };
});

export {
  readBlobAsText
};
