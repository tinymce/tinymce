define(
  'ephox.imagetools.util.ImageResult',
  [
    'ephox.imagetools.util.Canvas',
    'ephox.imagetools.util.Conversions',
    'ephox.imagetools.util.Mime',
    'ephox.imagetools.util.Promise',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option'
  ],
  function (Canvas, Conversions, Mime, Promise, Fun, Option) {
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

    /*
      This copy doesn't support changing type or quality, but
      it's used by TBIO on load which won't ask for changes.

      TODO: Make toCanvas return a promise so this can be inlined with create above
     */
    var fromBlobAndUrlSync = function (blob, url) {
      var backgroundCanvas = Option.none();
      Conversions.blobToImage(blob).then(function (image) {
        var result = Conversions.imageToCanvas(image);
        Conversions.revokeImageUrl(image);
        backgroundCanvas = Option.some(result);
      });
      return {
        getType: Fun.constant(blob.type),
        toBlob: function () {
          return Promise.resolve(blob);
        },
        toDataURL: Fun.constant(url),
        toBase64: function () {
          return url.split(',')[1];
        },
        toCanvas: function () {
          return backgroundCanvas.getOrDie('image has not loaded yet')
        }
      };
    }

    return {
      fromBlob: fromBlob,
      fromCanvas: fromCanvas,
      fromImage: fromImage,
      fromBlobAndUrlSync: fromBlobAndUrlSync
    };
  });
