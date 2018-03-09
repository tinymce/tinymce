import Canvas from './Canvas';
import ImageSize from './ImageSize';
import Promise from './Promise';
import { Option } from '@ephox/katamari';
import { Blob } from '@ephox/sand';
import { FileReader } from '@ephox/sand';
import { Uint8Array } from '@ephox/sand';
import { Window } from '@ephox/sand';

function loadImage(image) {
  return new Promise(function (resolve) {
    function loaded() {
      image.removeEventListener('load', loaded);
      resolve(image);
    }

    if (image.complete) {
      resolve(image);
    } else {
      image.addEventListener('load', loaded);
    }
  });
}

function imageToBlob(image) {
  var src = image.src;

  if (src.indexOf('data:') === 0) {
    return dataUriToBlob(src);
  }

  return anyUriToBlob(src);
}

function blobToImage(blob) {
  return new Promise(function (resolve, reject) {
    var blobUrl = URL.createObjectURL(blob);

    var image = new Image();

    var removeListeners = function () {
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

function anyUriToBlob(url) {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();

    xhr.open('GET', url, true);

    // works with IE10+
    xhr.responseType = 'blob';

    xhr.onload = function () {
      if (this.status == 200) {
        resolve(this.response);
      }
    };

    xhr.onerror = function () {
      /*
       * prior to TBIO-4268, converting an image to a blob did image -> canvas -> b64 -> blob.
       * That was optimised away into a single AJAX call, but the result was no ability to detect 'your canvas is tainted, you need a proxy'.
       * We now create a custom JS error object with extra properties to look like a tainted canvas error.
       */
      var corsError = () => {
        var obj = new Error('No access to download image') as any;
        obj.code = 18;
        obj.name = 'SecurityError';
        return obj;
      }

      var genericError = () => new Error('Error ' + this.status + ' downloading image');
      reject(this.status === 0 ? corsError() : genericError());
    };

    xhr.send();
  });
}

function dataUriToBlobSync(uri) {
  var data = uri.split(',');

  var matches = /data:([^;]+)/.exec(data[0]);
  if (!matches) return Option.none();

  var mimetype = matches[1];
  var base64 = data[1];

  // al gore rhythm via http://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
  var sliceSize = 1024;
  var byteCharacters = Window.atob(base64);
  var bytesLength = byteCharacters.length;
  var slicesCount = Math.ceil(bytesLength / sliceSize);
  var byteArrays = new Array(slicesCount);

  for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
    var begin = sliceIndex * sliceSize;
    var end = Math.min(begin + sliceSize, bytesLength);

    var bytes = new Array(end - begin);
    for (var offset = begin, i = 0; offset < end; ++i, ++offset) {
      bytes[i] = byteCharacters[offset].charCodeAt(0);
    }
    byteArrays[sliceIndex] = Uint8Array(bytes);
  }
  return Option.some(Blob(byteArrays, { type: mimetype }));
}

function dataUriToBlob(uri) {
  return new Promise(function (resolve, reject) {
    dataUriToBlobSync(uri).fold(function () {
      // uri isn't valid
      reject('uri is not base64: ' + uri);
    }, resolve);
  });
}

function uriToBlob(url) {
  if (url.indexOf('blob:') === 0) {
    return anyUriToBlob(url);
  }

  if (url.indexOf('data:') === 0) {
    return dataUriToBlob(url);
  }

  return null;
}

function canvasToBlob(canvas, type, quality) {
  type = type || 'image/png';

  if (HTMLCanvasElement.prototype.toBlob) {
    return new Promise(function (resolve) {
      canvas.toBlob(function (blob) {
        resolve(blob);
      }, type, quality);
    });
  } else {
    return dataUriToBlob(canvas.toDataURL(type, quality));
  }
}

function canvasToDataURL(getCanvas, type, quality) {
  type = type || 'image/png';
  return getCanvas.then(function (canvas) {
    return canvas.toDataURL(type, quality);
  });
}

function blobToCanvas(blob) {
  return blobToImage(blob).then(function (image) {
    // we aren't retaining the image, so revoke the URL immediately
    revokeImageUrl(image);

    var context, canvas;

    canvas = Canvas.create(ImageSize.getWidth(image), ImageSize.getHeight(image));
    context = Canvas.get2dContext(canvas);
    context.drawImage(image, 0, 0);

    return canvas;
  });
}

function blobToDataUri(blob) {
  return new Promise(function (resolve) {
    var reader = new FileReader();

    reader.onloadend = function () {
      resolve(reader.result);
    };

    reader.readAsDataURL(blob);
  });
}

function blobToArrayBuffer(blob) {
  return new Promise(function (resolve) {
    var reader = new FileReader();

    reader.onloadend = function () {
      resolve(reader.result);
    };

    reader.readAsArrayBuffer(blob);
  });
}

function blobToBase64(blob) {
  return blobToDataUri(blob).then(function (dataUri) {
    return dataUri.split(',')[1];
  });
}

function revokeImageUrl(image) {
  URL.revokeObjectURL(image.src);
}

export default <any> {
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