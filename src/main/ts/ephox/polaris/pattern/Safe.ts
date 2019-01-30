import Unsafe from './Unsafe';

/** Escapes regex characters in a string */
const sanitise = function (input) {
  return input.replace(/[-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
};

const word = function (input) {
  const value = sanitise(input);
  return Unsafe.word(value);
};

const token = function (input) {
  const value = sanitise(input);
  return Unsafe.token(value);
};

export default <any> {
  sanitise,
  word,
  token
};