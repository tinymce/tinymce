import * as Filters from '../transformations/Filters';
import * as ImageTools from '../transformations/ImageTools';
import * as JPEGMeta from '../meta/JPEGMeta';
import { ImageResult } from '../util/ImageResult';

const invert = function (ir: ImageResult): Promise<ImageResult> {
  return Filters.invert(ir);
};

const sharpen = function (ir: ImageResult): Promise<ImageResult> {
  return Filters.sharpen(ir);
};

const emboss = function (ir: ImageResult): Promise<ImageResult> {
  return Filters.emboss(ir);
};

const gamma = function (ir: ImageResult, value: number): Promise<ImageResult> {
  return Filters.gamma(ir, value);
};

const exposure = function (ir: ImageResult, value: number): Promise<ImageResult> {
  return Filters.exposure(ir, value);
};

const colorize = function (ir: ImageResult, adjustR: number, adjustG: number, adjustB: number): Promise<ImageResult> {
  return Filters.colorize(ir, adjustR, adjustG, adjustB);
};

const brightness = function (ir: ImageResult, adjust: number): Promise<ImageResult> {
  return Filters.brightness(ir, adjust);
};

const hue = function (ir: ImageResult, adjust: number): Promise<ImageResult> {
  return Filters.hue(ir, adjust);
};

const saturate = function (ir: ImageResult, adjust: number): Promise<ImageResult> {
  return Filters.saturate(ir, adjust);
};

const contrast = function (ir: ImageResult, adjust: number): Promise<ImageResult> {
  return Filters.contrast(ir, adjust);
};

const grayscale = function (ir: ImageResult, adjust: number): Promise<ImageResult> {
  return Filters.grayscale(ir, adjust);
};

const sepia = function (ir: ImageResult, adjust: number): Promise<ImageResult> {
  return Filters.sepia(ir, adjust);
};

const flip = function (ir: ImageResult, axis: 'h' | 'v'): Promise<ImageResult> {
  return ImageTools.flip(ir, axis);
};

const crop = function (ir: ImageResult, x: number, y: number, w: number, h: number): Promise<ImageResult> {
  return ImageTools.crop(ir, x, y, w, h);
};

const resize = function (ir: ImageResult, w: number, h: number): Promise<ImageResult> {
  return ImageTools.resize(ir, w, h);
};

const rotate = function (ir: ImageResult, angle: number): Promise<ImageResult> {
  return ImageTools.rotate(ir, angle);
};

/* ImageResult -> ImageResult */
const exifRotate = (ir: ImageResult): Promise<ImageResult> => {
  // EXIF orientation is represented by numbers 1-8. We don't want to deal with
  // all the cases, but these three are probably the most common.
  // Explanation of numbers: https://magnushoff.com/jpeg-orientation.html
  const ROTATE_90 = 6; // image is rotated left by 90 degrees
  const ROTATE_180 = 3; // image is upside down
  const ROTATE_270 = 8; // image is rotated right by 90 degrees

  const checkRotation = (data: JPEGMeta.JPEGMeta) => {
    const orientation = data.tiff.Orientation;
    switch (orientation) {
      case ROTATE_90:
        return rotate(ir, 90);
      case ROTATE_180:
        return rotate(ir, 180);
      case ROTATE_270:
        return rotate(ir, 270);
      default:
        return ir;
    }
  };

  const notJpeg = (): ImageResult => ir;

  return ir.toBlob().then(JPEGMeta.extractFrom).then(checkRotation, notJpeg);
};

export {
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