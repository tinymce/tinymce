import { Arr } from '@ephox/katamari';

const lowercase = (s: string): string => s.toLowerCase();

// Splits a string but removes the whitespace before and after each value.
const explode = (s: string, delimeter: string): string[] => Arr.map(s.split(delimeter), (p) => p.trim());

export {
  lowercase,
  explode
};
