import Filters from '../transformations/Filters';
import ImageTools from '../transformations/ImageTools';
import JPEGMeta from '../meta/JPEGMeta';
import ImageResult from 'ephox/imagetools/util/ImageResult';

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

/* ImageResult -> ImageResult */
var exifRotate = (ir) => {
  var checkRotation = (data) => {
    var orientation = data.tiff.Orientation; // int from 1-8
    if (orientation === 6) {
      // image is rotated left by 90 degrees
      return rotate(ir, 90); 
    } else if (orientation === 8) {
      // image is rotated right by 90 degrees
      return rotate(ir, 270); 
    } else {
      return ir;
    }
  };

  var notJpeg = () => {
    return ir;
  };

  return ir.toBlob().then(JPEGMeta.extractFrom).then(checkRotation, notJpeg); 
};

export default <any> {
  invert,
  sharpen,
  emboss,
  brightness,
  hue,
  saturate,
  contrast,
  grayscale,
  sepia,
  colorize,
  gamma,
  exposure,

  flip,
  crop,
  resize,
  rotate,

  exifRotate
};