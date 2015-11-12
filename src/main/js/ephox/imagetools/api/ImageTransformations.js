define(
  'ephox.imagetools.api.ImageTransformations',

  [
    'ephox.imagetools.transformations.Filters'
  ],

  function (Filters) {
    return {
      invert: Filters.invert,
      sharpen: Filters.sharpen,
      emboss: Filters.emboss,
      brightness: Filters.brightness,
      hue: Filters.hue,
      saturate: Filters.saturate,
      contrast: Filters.contrast,
      grayscale: Filters.grayscale,
      sepia: Filters.sepia,
      colorize: Filters.colorize,
      gamma: Filters.gamma,
      exposure: Filter.exposure,

      flip: ImageTools.tip,
      crop: ImageTools.crop,
      resize: ImageTools.resize,
      rotate: ImageTools.rotate
    };
  }
);