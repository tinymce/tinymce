import { atob, Blob, HTMLCanvasElement, HTMLImageElement, Image, FileReader, URL, XMLHttpRequest } from '@ephox/dom-globals';
import { Option } from '@ephox/katamari';
import * as Canvas from './Canvas';
import * as ImageSize from './ImageSize';
import { Promise } from './Promise';

function imageToBlob(image: HTMLImageElement): Promise<Blob> {
  const src = image.src;

  if (src.indexOf('data:') === 0) {
    return dataUriToBlob(src);
  }

  return anyUriToBlob(src);
}

function blobToImage(blob: Blob): Promise<HTMLImageElement> {
  return new Promise(function (resolve, reject) {
    const blobUrl = URL.createObjectURL(blob);

    const image = new Image();

    const removeListeners = function () {
      image.removeEventListener('load', loaded);
      image.removeEventListener('error', error);
    };

    function loaded() {
      removeListeners();
      resolve(image);
    }

    function error() {
      removeListeners();
      reject('Unable to load data of type ' + blob.type + ': ' + blobUrl);
    }

    image.addEventListener('load', loaded);
    image.addEventListener('error', error);
    image.src = blobUrl;

    if (image.complete) {
      loaded();
    }
  });
}

function anyUriToBlob(url: string): Promise<Blob> {
  return new Promise(function (resolve, reject) {
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
}

function dataUriToBlobSync(uri: string): Option<Blob> {
  const data = uri.split(',');

  const matches = /data:([^;]+)/.exec(data[0]);
  if (!matches) { return Option.none(); }

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
  return Option.some(new Blob(byteArrays, { type: mimetype }));
}

function dataUriToBlob(uri: string): Promise<Blob> {
  return new Promise(function (resolve, reject) {
    dataUriToBlobSync(uri).fold(function () {
      // uri isn't valid
      reject('uri is not base64: ' + uri);
    }, resolve);
  });
}

function uriToBlob(url: string): Promise<Blob> | null {
  if (url.indexOf('blob:') === 0) {
    return anyUriToBlob(url);
  }

  if (url.indexOf('data:') === 0) {
    return dataUriToBlob(url);
  }

  return null;
}

function canvasToBlob(canvas: HTMLCanvasElement, type?: string, quality?: number): Promise<Blob> {
  type = type || 'image/png';

  if (HTMLCanvasElement.prototype.toBlob) {
    return new Promise<Blob>(function (resolve, reject) {
      canvas.toBlob(function (blob) {
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
}

function canvasToDataURL(canvas: HTMLCanvasElement, type?: string, quality?: number): string {
  type = type || 'image/png';
  return canvas.toDataURL(type, quality);
}

function blobToCanvas(blob: Blob): Promise<HTMLCanvasElement> {
  return blobToImage(blob).then(function (image) {
    // we aren't retaining the image, so revoke the URL immediately
    revokeImageUrl(image);

    const canvas = Canvas.create(ImageSize.getWidth(image), ImageSize.getHeight(image));
    const context = Canvas.get2dContext(canvas);
    context.drawImage(image, 0, 0);

    return canvas;
  });
}

function blobToDataUri(blob: Blob): Promise<string> {
  return new Promise(function (resolve) {
    const reader = new FileReader();

    reader.onloadend = function () {
      resolve(reader.result);
    };

    reader.readAsDataURL(blob);
  });
}

function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  return new Promise(function (resolve) {
    const reader = new FileReader();

    reader.onloadend = function () {
      resolve(reader.result);
    };

    reader.readAsArrayBuffer(blob);
  });
}

function blobToBase64(blob: Blob): Promise<string> {
  return blobToDataUri(blob).then(function (dataUri) {
    return dataUri.split(',')[1];
  });
}

function revokeImageUrl(image: HTMLImageElement): void {
  URL.revokeObjectURL(image.src);
}

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
