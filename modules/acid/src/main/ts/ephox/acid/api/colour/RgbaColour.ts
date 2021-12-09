import { Optional } from '@ephox/katamari';

import { Hex, Hsv, Rgba } from './ColourTypes';
import * as HexColour from './HexColour';

const min = Math.min;
const max = Math.max;
const round = Math.round;

const rgbRegex = /^\s*rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)\s*$/i;
const rgbaRegex = /^\s*rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d?(?:\.\d+)?)\s*\)\s*$/i;

const rgbaColour = (red: number, green: number, blue: number, alpha: number): Rgba => ({
  red,
  green,
  blue,
  alpha
});

const isRgbaComponent = (value: string): boolean => {
  const num = parseInt(value, 10);
  return num.toString() === value && num >= 0 && num <= 255;
};

const fromHsv = (hsv: Hsv): Rgba => {
  let r; let g; let b;
  const hue = (hsv.hue || 0) % 360;
  let saturation = hsv.saturation / 100;
  let brightness = hsv.value / 100;
  saturation = max(0, min(saturation, 1));
  brightness = max(0, min(brightness, 1));

  if (saturation === 0) {
    r = g = b = round(255 * brightness);
    return rgbaColour(r, g, b, 1);
  }

  const side = hue / 60;
  const chroma = brightness * saturation;
  const x = chroma * (1 - Math.abs(side % 2 - 1));
  const match = brightness - chroma;

  switch (Math.floor(side)) {
    case 0:
      r = chroma;
      g = x;
      b = 0;
      break;

    case 1:
      r = x;
      g = chroma;
      b = 0;
      break;

    case 2:
      r = 0;
      g = chroma;
      b = x;
      break;

    case 3:
      r = 0;
      g = x;
      b = chroma;
      break;

    case 4:
      r = x;
      g = 0;
      b = chroma;
      break;

    case 5:
      r = chroma;
      g = 0;
      b = x;
      break;

    default:
      r = g = b = 0;
  }

  r = round(255 * (r + match));
  g = round(255 * (g + match));
  b = round(255 * (b + match));

  return rgbaColour(r, g, b, 1);
};

// Temporarily using: https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
const fromHex = (hexColour: Hex): Rgba => {
  const result = HexColour.extractValues(hexColour);
  const red = parseInt(result[1], 16);
  const green = parseInt(result[2], 16);
  const blue = parseInt(result[3], 16);
  return rgbaColour(red, green, blue, 1);
};

const fromStringValues = (red: string, green: string, blue: string, alpha: string): Rgba => {
  const r = parseInt(red, 10);
  const g = parseInt(green, 10);
  const b = parseInt(blue, 10);
  const a = parseFloat(alpha);
  return rgbaColour(r, g, b, a);
};

const fromString = (rgbaString: string): Optional<Rgba> => {
  if (rgbaString === 'transparent') {
    return Optional.some(rgbaColour(0, 0, 0, 0));
  }
  const rgbMatch = rgbRegex.exec(rgbaString);
  if (rgbMatch !== null) {
    return Optional.some(fromStringValues(rgbMatch[1], rgbMatch[2], rgbMatch[3], '1'));
  }
  const rgbaMatch = rgbaRegex.exec(rgbaString);
  if (rgbaMatch !== null) {
    return Optional.some(fromStringValues(rgbaMatch[1], rgbaMatch[2], rgbaMatch[3], rgbaMatch[4]));
  }
  return Optional.none();
};

const toString = (rgba: Rgba): string => `rgba(${rgba.red},${rgba.green},${rgba.blue},${rgba.alpha})`;

const red = rgbaColour(255, 0, 0, 1);

export {
  rgbaColour,
  isRgbaComponent,
  fromHsv,
  fromHex,
  fromString,
  toString,
  red
};
