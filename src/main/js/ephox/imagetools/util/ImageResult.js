define(
  'ephox.imagetools.util.ImageResult',
  [
    'ephox.imagetools.util.Promise',
    'ephox.imagetools.util.Conversions',
    'ephox.imagetools.util.Mime',
    'ephox.imagetools.util.Canvas'
  ],
  function (Promise, Conversions, Mime, Canvas) {
    function create(canvas, blob) {
      var initialType = blob.type;
      function getType() {
        return initialType;
      }

      function toBlob(type, quality) {
        // Shortcut to not lose the blob filename when we haven't edited the image
        var resultType = type || initialType;
        if (type === initialType && quality === undefined) {
          return Promise.resolve(blob);
        } else {
          return Conversions.canvasToBlob(canvas, resultType, quality);
        }
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
          return create(canvas, blob);
        });
    }

    function fromCanvas(canvas, type) {
      return Conversions.canvasToBlob(canvas, type).then(function (blob) {
        return create(canvas, blob);
      });
    }

    function fromImage(image) {
      var type = Mime.guessMimeType(image.src);
      return Conversions.imageToCanvas(image).then(function (canvas) {
        return fromCanvas(canvas, type);
      });
    }

    return {
      fromBlob: fromBlob,
      fromCanvas: fromCanvas,
      fromImage: fromImage
    };
  });
