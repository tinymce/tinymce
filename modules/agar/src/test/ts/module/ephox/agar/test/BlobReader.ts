import { Blob, FileReader } from "@ephox/dom-globals";
import { FutureResult, Result } from "@ephox/katamari";

const readBlobAsText = (blob: Blob): FutureResult<string, string> => {
  return FutureResult.nu((resolve) => {
    const reader = new FileReader();
    reader.readAsText(blob);
    reader.onloadend = () => {
      resolve(Result.value(reader.result));
    };
    reader.onerror = (evt) => {
      resolve(Result.error('Error loading blob'));
    };
  });
};

export {
  readBlobAsText
};
