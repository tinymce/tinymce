import { Fun } from '@ephox/katamari';
import { Hsv, Rgba } from './ColourTypes';

const hsvColour = (hue: number, saturation: number, value: number): Hsv => {
  return {
    hue: Fun.constant(hue),
    saturation: Fun.constant(saturation),
    value: Fun.constant(value)
  };
};

const fromRgb = (rgbaColour: Rgba): Hsv => {
  let r, g, b, h, s, v, d, minRGB, maxRGB;

  h = 0;
  s = 0;
  v = 0;
  r = rgbaColour.red() / 255;
  g = rgbaColour.green() / 255;
  b = rgbaColour.blue() / 255;

  minRGB = Math.min(r, Math.min(g, b));
  maxRGB = Math.max(r, Math.max(g, b));

  if (minRGB === maxRGB) {
    v = minRGB;

    return hsvColour(
      0,
      0,
      v * 100
    );
  }

  /*eslint no-nested-ternary:0 */
  d = (r === minRGB) ? g - b : ((b === minRGB) ? r - g : b - r);
  h = (r === minRGB) ? 3 : ((b === minRGB) ? 1 : 5);
  h = 60 * (h - d / (maxRGB - minRGB));
  s = (maxRGB - minRGB) / maxRGB;
  v = maxRGB;

  return hsvColour(
    Math.round(h),
    Math.round(s * 100),
    Math.round(v * 100)
  );
};

export {
  hsvColour,
  fromRgb
};