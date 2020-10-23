import { Obj, Optional } from '@ephox/katamari';
import { Promise } from '../util/Promise';

const sendRequest = (url: string, headers: Record<string, string>, withCredentials: boolean = false) =>
  new Promise<{ status: number; blob: Blob }>((resolve) => {
    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        resolve({
          status: xhr.status,
          blob: xhr.response
        });
      }
    };

    xhr.open('GET', url, true);

    xhr.withCredentials = withCredentials;

    Obj.each(headers, (value, key) => {
      xhr.setRequestHeader(key, value);
    });

    xhr.responseType = 'blob';
    xhr.send();
  });

const readBlobText = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result as string);
    };

    reader.onerror = (e) => {
      reject(e);
    };

    reader.readAsText(blob);
  });

const parseJson = (text: string): Optional<string> => {
  try {
    return Optional.some(JSON.parse(text));
  } catch (ex) {
    // Ignore
    return Optional.none();
  }
};

export {
  parseJson,
  readBlobText,
  sendRequest
};
