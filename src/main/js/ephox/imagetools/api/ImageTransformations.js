define(
  'ephox/imagetools/api/ImageTransformations',

  [
    'ephox/imagetools/util/ImageResult',
    'ephox/imagetools/transformations/Filters',
    'ephox/imagetools/transformations/ImageTools'
  ],

  function (ImageResult, Filters, ImageTools) {
    var invert = function (blob) {
      return ImageResult.fromBlob(blob).then(Filters.invert);
    };

    var sharpen = function (blob) {
      return ImageResult.fromBlob(blob).then(Filters.sharpen);
    };

    var emboss = function (blob) {
      return ImageResult.fromBlob(blob).then(Filters.emboss);
    };

    var gamma = function (blob, value) {
      return ImageResult.fromBlob(blob).then(function(ir) {
        return Filters.gamma(ir, value);
      });
    };

    var exposure = function (blob, value) {
      return ImageResult.fromBlob(blob).then(function(ir) {
        return Filters.exposure(ir, value);
      });
    };

    var colorize = function (blob, adjustR, adjustG, adjustB) {
      return ImageResult.fromBlob(blob).then(function(ir) {
        return Filters.colorize(ir, adjustR, adjustG, adjustB);
      });
    };

    var brightness = function (blob, adjust) {
      return ImageResult.fromBlob(blob).then(function(ir) {
        return Filters.brightness(ir, adjust);
      });
    };

    var hue = function (blob, adjust) {
      return ImageResult.fromBlob(blob).then(function(ir) {
        return Filters.hue(ir, adjust);
      });
    };

    var saturate = function (blob, adjust) {
      return ImageResult.fromBlob(blob).then(function(ir) {
        return Filters.saturate(ir, adjust);
      });
    };

    var contrast = function (blob, adjust) {
      return ImageResult.fromBlob(blob).then(function(ir) {
        return Filters.contrast(ir, adjust);
      });
    };

    var grayscale = function (blob, adjust) {
      return ImageResult.fromBlob(blob).then(function(ir) {
        return Filters.grayscale(ir, adjust);
      });
    };

    var sepia = function (blob, adjust) {
      return ImageResult.fromBlob(blob).then(function(ir) {
        return Filters.sepia(ir, adjust);
      });
    };

    var flip = function (blob, axis) {
      return ImageResult.fromBlob(blob).then(function(ir) {
        return ImageTools.flip(ir, axis);
      });
    };

    var crop = function (blob, x, y, w, h) {
      return ImageResult.fromBlob(blob).then(function(ir) {
        return ImageTools.crop(ir, x, y, w, h);
      });
    };

    var resize = function (blob, w, h) {
      return ImageResult.fromBlob(blob).then(function(ir) {
        return ImageTools.resize(ir, w, h);
      });
    };

    var rotate = function (blob, angle) {
      return ImageResult.fromBlob(blob).then(function(ir) {
        return ImageTools.rotate(ir, angle);
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