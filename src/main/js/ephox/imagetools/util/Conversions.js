define(
  'ephox.imagetools.util.Conversions',
  [
    'ephox.imagetools.util.Canvas',
    'ephox.imagetools.util.ImageSize',
    'ephox.imagetools.util.Mime',
    'ephox.imagetools.util.Promise',
    'ephox.sand.api.Blob',
    'ephox.sand.api.Uint8Array',
    'ephox.sand.api.Window',
    'global!Array',
    'global!Math'
  ],
  function (Canvas, ImageSize, Mime, Promise, Blob, Uint8Array, Window, Array, Math) {
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

    function imageToCanvas(image) {
      return loadImage(image).then(function (image) {
        var context, canvas;

        canvas = Canvas.create(ImageSize.getWidth(image), ImageSize.getHeight(image));
        context = Canvas.get2dContext(canvas);
        context.drawImage(image, 0, 0);

        return canvas;
      });
    }

    function imageToBlob(image) {
      return loadImage(image).then(function (image) {
        var src = image.src;

        if (src.indexOf('blob:') === 0) {
          return blobUriToBlob(src);
        }

        if (src.indexOf('data:') === 0) {
          return dataUriToBlob(src);
        }

        return imageToCanvas(image).then(function (canvas) {
          return canvasToBlob(canvas, Mime.guessMimeType(src));
        });
      });
    }

    function blobToImage(blob) {
      return new Promise(function (resolve) {
        var image = new Image();

        function loaded() {
          image.removeEventListener('load', loaded);
          resolve(image);
        }

        image.addEventListener('load', loaded);
        image.src = URL.createObjectURL(blob);

        if (image.complete) {
          loaded();
        }
      });
    }

    function blobUriToBlob(url) {
      return new Promise(function (resolve) {
        var xhr = new XMLHttpRequest();

        xhr.open('GET', url, true);
        xhr.responseType = 'blob';

        xhr.onload = function () {
          if (this.status == 200) {
            resolve(this.response);
          }
        };

        xhr.send();
      });
    }

    function dataUriToBlobSync(base64, mimetype) {
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
          for (var offset = begin, i = 0 ; offset < end; ++i, ++offset) {
              bytes[i] = byteCharacters[offset].charCodeAt(0);
          }
          byteArrays[sliceIndex] = Uint8Array(bytes);
      }
      return Blob(byteArrays, {type: mimetype});
    }

    function dataUriToBlob(uri) {
      return new Promise(function (resolve, reject) {
        var data = uri.split(',');

        var matches = /data:([^;]+)/.exec(data[0]);
        if (matches) {
          var type = matches[1];
          resolve(dataUriToBlobSync(data[1], type));
        } else {
          // uri isn't valid
          reject('uri is not base64: ' + uri);
        }
      });
    }

    function uriToBlob(url) {
      if (url.indexOf('blob:') === 0) {
        return blobUriToBlob(url);
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

    function blobToDataUri(blob) {
      return new Promise(function (resolve) {
        var reader = new FileReader();

        reader.onloadend = function () {
          resolve(reader.result);
        };

        reader.readAsDataURL(blob);
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

    return {
      // used outside
      blobToImage: blobToImage,
      // used outside
      imageToBlob: imageToBlob,
      // used outside
      blobToDataUri: blobToDataUri,
      // used outside
      blobToBase64: blobToBase64,

      // helper method
      imageToCanvas: imageToCanvas,
      // helper method
      canvasToBlob: canvasToBlob,
      // helper method
      revokeImageUrl: revokeImageUrl,
      // helper method
      uriToBlob: uriToBlob
    };
  });