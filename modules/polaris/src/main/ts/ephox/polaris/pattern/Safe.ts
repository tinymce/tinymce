import { PRegExp } from './Types';
import * as Unsafe from './Unsafe';
import { Regex } from '@ephox/katamari';

/** Escapes regex characters in a string */
const sanitise = (input: string): string => {
  return Regex.escapeRegExp(input);
};

const word = (input: string): PRegExp => {
  const value = sanitise(input);
  return Unsafe.word(value);
};

const token = (input: string): PRegExp => {
  const value = sanitise(input);
  return Unsafe.token(value);
};

export {
  sanitise,
  word,
  token
};
