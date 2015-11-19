define(
  'ephox/imagetools/api/ImageTransformations',

  [
    'ephox/imagetools/transformations/Filters',
    'ephox/imagetools/transformations/ImageTools'
  ],

  function (Filters, ImageTools) {
    var invert = function (blob) {
      return Filters.invert(blob);
    };

    var sharpen = function (blob) {
      return Filters.sharpen(blob);
    };

    var emboss = function (blob) {
      return Filters.emboss(blob);
    };

    var gamma = function (blob, value) {
      return Filters.gamma(blob, value);
    };

    var exposure = function (blob, value) {
      return Filters.exposure(blob, value);
    };

    var colorize = function (blob, adjustR, adjustG, adjustB) {
      return Filters.colorize(blob, adjustR, adjustG, adjustB);
    };

    var brightness = function (blob, adjust) {
      return Filters.brightness(blob, adjust);
    };

    var hue = function (blob, adjust) {
      return Filters.hue(blob, adjust);
    };

    var saturate = function (blob, adjust) {
      return Filters.saturate(blob, adjust);
    };

    var contrast = function (blob, adjust) {
      return Filters.contrast(blob, adjust);
    };

    var grayscale = function (blob, adjust) {
      return Filters.grayscale(blob, adjust);
    };

    var sepia = function (blob, adjust) {
      return Filters.sepia(blob, adjust);
    };

    var flip = function (blob, axis) {
      return ImageTools.flip(blob, axis);
    };

    var crop = function (blob, x, y, w, h) {
      return ImageTools.crop(blob, x, y, w, h);
    };

    var resize = function (blob, w, h) {
      return ImageTools.resize(blob, w, h);
    };

    var rotate = function (blob, angle) {
      return ImageTools.rotate(blob, angle);
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