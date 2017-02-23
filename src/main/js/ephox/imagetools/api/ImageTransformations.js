define(
  'ephox.imagetools.api.ImageTransformations',
  [
    'ephox.imagetools.transformations.Filters',
    'ephox.imagetools.transformations.ImageTools'
  ],
  function (Filters, ImageTools) {
    var invert = function (ir) {
      return Filters.invert(ir);
    };

    var sharpen = function (ir) {
      return Filters.sharpen(ir);
    };

    var emboss = function (ir) {
      return Filters.emboss(ir);
    };

    var gamma = function (ir, value) {
      return Filters.gamma(ir, value);
    };

    var exposure = function (ir, value) {
      return Filters.exposure(ir, value);
    };

    var colorize = function (ir, adjustR, adjustG, adjustB) {
      return Filters.colorize(ir, adjustR, adjustG, adjustB);
    };

    var brightness = function (ir, adjust) {
      return Filters.brightness(ir, adjust);
    };

    var hue = function (ir, adjust) {
      return Filters.hue(ir, adjust);
    };

    var saturate = function (ir, adjust) {
      return Filters.saturate(ir, adjust);
    };

    var contrast = function (ir, adjust) {
      return Filters.contrast(ir, adjust);
    };

    var grayscale = function (ir, adjust) {
      return Filters.grayscale(ir, adjust);
    };

    var sepia = function (ir, adjust) {
      return Filters.sepia(ir, adjust);
    };

    var flip = function (ir, axis) {
      return ImageTools.flip(ir, axis);
    };

    var crop = function (ir, x, y, w, h) {
      return ImageTools.crop(ir, x, y, w, h);
    };

    var resize = function (ir, w, h) {
      return ImageTools.resize(ir, w, h);
    };

    var rotate = function (ir, angle) {
      return ImageTools.rotate(ir, angle);
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