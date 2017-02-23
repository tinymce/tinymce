define(
  'ephox.imagetools.util.ImageResult',
  [
    'ephox.imagetools.util.Promise',
    'ephox.imagetools.util.Conversions',
    'ephox.imagetools.util.Mime',
    'ephox.imagetools.util.Canvas'
  ],
  function (Promise, Conversions, Mime, Canvas) {
    function create(canvas, initialType) {
      function getType() {
        return initialType;
      }

      function toBlob(type, quality) {
        return Conversions.canvasToBlob(canvas, type || initialType, quality);
      }

      function toDataURL(type, quality) {
        return canvas.toDataURL(type || initialType, quality);
      }

      function toBase64(type, quality) {
        return toDataURL(type, quality).split(',')[1];
      }

      function toCanvas() {
        return Canvas.clone(canvas);
      }

      return {
        getType: getType,
        toBlob: toBlob,
        toDataURL: toDataURL,
        toBase64: toBase64,
        toCanvas: toCanvas
      };
    }

    function fromBlob(blob) {
      return Conversions.blobToImage(blob)
        .then(function (image) {
          var result = Conversions.imageToCanvas(image);
          Conversions.revokeImageUrl(image);
          return result;
        })
        .then(function (canvas) {
          return create(canvas, blob.type);
        });
    }

    function fromCanvas(canvas, type) {
      return new Promise(function (resolve) {
        resolve(create(canvas, type));
      });
    }

    function fromImage(image) {
      var type = Mime.guessMimeType(image.src);
      return Conversions.imageToCanvas(image).then(function (canvas) {
        return create(canvas, type);
      });
    }

    return {
      fromBlob: fromBlob,
      fromCanvas: fromCanvas,
      fromImage: fromImage
    };
  });
