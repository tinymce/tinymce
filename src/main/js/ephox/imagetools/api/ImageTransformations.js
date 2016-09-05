define(
  'ephox/imagetools/api/ImageTransformations',

  [
    'ephox/imagetools/api/BlobConversions',
    'ephox/imagetools/transformations/Filters',
    'ephox/imagetools/transformations/ImageTools'
  ],

  function (BlobConversions, Filters, ImageTools) {
    var invert = function (blob) {
      return BlobConversions.blobToImageResult(blob)
          .then(Filters.invert)
          .then(BlobConversions.imageResultToBlob);
    };

    var sharpen = function (blob) {
      return BlobConversions.blobToImageResult(blob)
          .then(Filters.sharpen)
          .then(BlobConversions.imageResultToBlob);
    };

    var emboss = function (blob) {
      return BlobConversions.blobToImageResult(blob)
          .then(Filters.emboss)
          .then(BlobConversions.imageResultToBlob);
    };

    var gamma = function (blob, value) {
      return BlobConversions.blobToImageResult(blob).then(function(ir) {
        return Filters.gamma(ir, value).then(BlobConversions.imageResultToBlob);
      });
    };

    var exposure = function (blob, value) {
      return BlobConversions.blobToImageResult(blob).then(function(ir) {
        return Filters.exposure(ir, value).then(BlobConversions.imageResultToBlob);
      });
    };

    var colorize = function (blob, adjustR, adjustG, adjustB) {
      return BlobConversions.blobToImageResult(blob).then(function(ir) {
        return Filters.colorize(ir, adjustR, adjustG, adjustB).then(BlobConversions.imageResultToBlob);
      });
    };

    var brightness = function (blob, adjust) {
      return BlobConversions.blobToImageResult(blob).then(function(ir) {
        return Filters.brightness(ir, adjust).then(BlobConversions.imageResultToBlob);
      });
    };

    var hue = function (blob, adjust) {
      return BlobConversions.blobToImageResult(blob).then(function(ir) {
        return Filters.hue(ir, adjust).then(BlobConversions.imageResultToBlob);
      });
    };

    var saturate = function (blob, adjust) {
      return BlobConversions.blobToImageResult(blob).then(function(ir) {
        return Filters.saturate(ir, adjust).then(BlobConversions.imageResultToBlob);
      });
    };

    var contrast = function (blob, adjust) {
      return BlobConversions.blobToImageResult(blob).then(function(ir) {
        return Filters.contrast(ir, adjust).then(BlobConversions.imageResultToBlob);
      });
    };

    var grayscale = function (blob, adjust) {
      return BlobConversions.blobToImageResult(blob).then(function(ir) {
        return Filters.grayscale(ir, adjust).then(BlobConversions.imageResultToBlob);
      });
    };

    var sepia = function (blob, adjust) {
      return BlobConversions.blobToImageResult(blob).then(function(ir) {
        return Filters.sepia(ir, adjust).then(BlobConversions.imageResultToBlob);
      });
    };

    var flip = function (blob, axis) {
      return BlobConversions.blobToImageResult(blob).then(function(ir) {
        return ImageTools.flip(ir, axis).then(BlobConversions.imageResultToBlob);
      });
    };

    var crop = function (blob, x, y, w, h) {
      return BlobConversions.blobToImageResult(blob).then(function(ir) {
        return ImageTools.crop(ir, x, y, w, h).then(BlobConversions.imageResultToBlob);
      });
    };

    var resize = function (blob, w, h) {
      return BlobConversions.blobToImageResult(blob).then(function(ir) {
        return ImageTools.resize(ir, w, h).then(BlobConversions.imageResultToBlob);
      });
    };

    var rotate = function (blob, angle) {
      return BlobConversions.blobToImageResult(blob).then(function(ir) {
        return ImageTools.rotate(ir, angle).then(BlobConversions.imageResultToBlob);
      });
    };

    return {
      invert: invert,
      sharpen: sharpen,
      emboss: emboss,
      brightness: brightness,
      hue: hue,
      saturate: saturate,
      contrast: contrast,
      grayscale: grayscale,
      sepia: sepia,
      colorize: colorize,
      gamma: gamma,
      exposure: exposure,

      flip: flip,
      crop: crop,
      resize: resize,
      rotate: rotate
    };
  }
);