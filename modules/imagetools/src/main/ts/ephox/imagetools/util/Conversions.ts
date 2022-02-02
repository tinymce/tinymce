import { Optional, Type } from '@ephox/katamari';
import Promise from '@ephox/wrap-promise-polyfill';

import * as Canvas from './Canvas';
import * as ImageSize from './ImageSize';

const imageToBlob = (image: HTMLImageElement): Promise<Blob> => {
  const src = image.src;

  if (src.indexOf('data:') === 0) {
    return dataUriToBlob(src);
  }

  return anyUriToBlob(src);
};

const blobToImage = (blob: Blob): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const blobUrl = URL.createObjectURL(blob);

    const image = new Image();

    const removeListeners = () => {
      image.removeEventListener('load', loaded);
      image.removeEventListener('error', error);
    };

    const loaded = () => {
      removeListeners();
      resolve(image);
    };

    const error = () => {
      removeListeners();
      reject('Unable to load data of type ' + blob.type + ': ' + blobUrl);
    };

    image.addEventListener('load', loaded);
    image.addEventListener('error', error);
    image.src = blobUrl;

    if (image.complete) {
      // Need a timeout due to IE 11 not setting the complete state correctly
      setTimeout(loaded, 0);
    }
  });
};

const anyUriToBlob = (url: string): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open('GET', url, true);

    // works with IE10+
    xhr.responseType = 'blob';

    xhr.onload = function () {
      if (this.status === 200) {
        resolve(this.response);
      }
    };

    xhr.onerror = function () {
      /*
       * prior to TBIO-4268, converting an image to a blob did image -> canvas -> b64 -> blob.
       * That was optimised away into a single AJAX call, but the result was no ability to detect 'your canvas is tainted, you need a proxy'.
       * We now create a custom JS error object with extra properties to look like a tainted canvas error.
       */
      const corsError = () => {
        const obj = new Error('No access to download image') as any;
        obj.code = 18;
        obj.name = 'SecurityError';
        return obj;
      };

      const genericError = () => new Error('Error ' + this.status + ' downloading image');
      reject(this.status === 0 ? corsError() : genericError());
    };

    xhr.send();
  });
};

const dataUriToBlobSync = (uri: string): Optional<Blob> => {
  const data = uri.split(',');

  const matches = /data:([^;]+)/.exec(data[0]);
  if (!matches) {
    return Optional.none();
  }

  const mimetype = matches[1];
  const base64 = data[1];

  // al gore rhythm via http://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
  const sliceSize = 1024;
  const byteCharacters = atob(base64);
  const bytesLength = byteCharacters.length;
  const slicesCount = Math.ceil(bytesLength / sliceSize);
  const byteArrays = new Array(slicesCount);

  for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
    const begin = sliceIndex * sliceSize;
    const end = Math.min(begin + sliceSize, bytesLength);

    const bytes = new Array(end - begin);
    // tslint:disable-next-line:one-variable-per-declaration
    for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
      bytes[i] = byteCharacters[offset].charCodeAt(0);
    }
    byteArrays[sliceIndex] = new Uint8Array(bytes);
  }
  return Optional.some(new Blob(byteArrays, { type: mimetype }));
};

const dataUriToBlob = (uri: string): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    dataUriToBlobSync(uri).fold(() => {
      // uri isn't valid
      reject('uri is not base64: ' + uri);
    }, resolve);
  });
};

const uriToBlob = (url: string): Promise<Blob> | null => {
  if (url.indexOf('blob:') === 0) {
    return anyUriToBlob(url);
  }

  if (url.indexOf('data:') === 0) {
    return dataUriToBlob(url);
  }

  return null;
};

const canvasToBlob = (canvas: HTMLCanvasElement, type?: string, quality?: number): Promise<Blob> => {
  type = type || 'image/png';

  // eslint-disable-next-line @tinymce/no-implicit-dom-globals, @typescript-eslint/unbound-method
  if (Type.isFunction(HTMLCanvasElement.prototype.toBlob)) {
    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject();
        }
      }, type, quality);
    });
  } else {
    return dataUriToBlob(canvas.toDataURL(type, quality));
  }
};

const canvasToDataURL = (canvas: HTMLCanvasElement, type?: string, quality?: number): string => {
  type = type || 'image/png';
  return canvas.toDataURL(type, quality);
};

const blobToCanvas = (blob: Blob): Promise<HTMLCanvasElement> => {
  return blobToImage(blob).then((image) => {
    // we aren't retaining the image, so revoke the URL immediately
    revokeImageUrl(image);

    const canvas = Canvas.create(ImageSize.getWidth(image), ImageSize.getHeight(image));
    const context = Canvas.get2dContext(canvas);
    context.drawImage(image, 0, 0);

    return canvas;
  });
};

const blobToDataUri = (blob: Blob): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      resolve(reader.result as string);
    };

    reader.readAsDataURL(blob);
  });
};

const blobToArrayBuffer = (blob: Blob): Promise<ArrayBuffer> => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      resolve(reader.result as ArrayBuffer);
    };

    reader.readAsArrayBuffer(blob);
  });
};

const blobToBase64 = (blob: Blob): Promise<string> => {
  return blobToDataUri(blob).then((dataUri) => {
    return dataUri.split(',')[1];
  });
};

const revokeImageUrl = (image: HTMLImageElement): void => {
  URL.revokeObjectURL(image.src);
};

export {
  // used outside
  blobToImage,
  imageToBlob,
  blobToArrayBuffer,
  blobToDataUri,
  blobToBase64,
  dataUriToBlobSync,

  // helper method
  canvasToBlob,
  canvasToDataURL,
  blobToCanvas,
  uriToBlob
};
