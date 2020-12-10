import { PRegExp } from './Types';
import * as Unsafe from './Unsafe';

/** Escapes regex characters in a string */
const sanitise = (input: string): string => {
  return input.replace(/[-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
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
