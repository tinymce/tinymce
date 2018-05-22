import { Css, Element } from "@ephox/sugar";

const isRgb = (value: string): boolean => {
  const num = parseInt(value, 10);
  return num.toString() === value && num >= 0 && num <= 255;
}

const isHex = (value: string): boolean => {
  const hex = '#' + value;
  const span = Element.fromTag('span');

  // A way of validating a hex. Not a good way. Could 
  // just use the regex below to make this non-dom dependent
  Css.set(span, 'background-color', hex);
  return Css.getRaw(span, 'background-color').isSome();
}

// Temporarily using: https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
const convertHexToRgb = (hex) => {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function(m, r, g, b) {
      return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
  } : null;
}

// https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
const convertRgbToHex = (rgb) => {
  function toHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }

  return toHex(rgb.red) + toHex(rgb.green) + toHex(rgb.blue);
}

export {
  isRgb,
  isHex,
  convertHexToRgb,
  convertRgbToHex
};