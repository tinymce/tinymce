import { Strings, Optional } from '@ephox/katamari';

import { Hex, Rgba } from './ColourTypes';

const hexColour = (value: string): Hex => ({
  value: normalizeHex(value)
});

const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
const longformRegex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;

const isHexString = (hex: string): boolean => shorthandRegex.test(hex) || longformRegex.test(hex);

const normalizeHex = (hex: string): string => Strings.removeLeading(hex, '#').toUpperCase();

const fromString = (hex: string): Optional<Hex> => isHexString(hex) ? Optional.some({ value: normalizeHex(hex) }) : Optional.none();

// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
const getLongForm = (hex: Hex): Hex => {
  const hexString = hex.value.replace(shorthandRegex, (m, r, g, b) =>
    r + r + g + g + b + b
  );

  return { value: hexString };
};

const extractValues = (hex: Hex): RegExpExecArray | [string, string, string, string] => {
  const longForm = getLongForm(hex);
  const splitForm = longformRegex.exec(longForm.value);
  return splitForm === null ? [ 'FFFFFF', 'FF', 'FF', 'FF' ] : splitForm;
};

const toHex = (component: number): string => {
  const hex = component.toString(16);
  return (hex.length === 1 ? '0' + hex : hex).toUpperCase();
};

const fromRgba = (rgbaColour: Rgba): Hex => {
  const value = toHex(rgbaColour.red) + toHex(rgbaColour.green) + toHex(rgbaColour.blue);
  return hexColour(value);
};

export {
  hexColour,
  isHexString,
  fromString,
  fromRgba,
  extractValues
};
