import Unsafe from './Unsafe';

/** Escapes regex characters in a string */
var sanitise = function (input) {
  return input.replace(/[-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
};

var word = function (input) {
  var value = sanitise(input);
  return Unsafe.word(value);
};

var token = function (input) {
  var value = sanitise(input);
  return Unsafe.token(value);
};

export default <any> {
  sanitise: sanitise,
  word: word,
  token: token
};