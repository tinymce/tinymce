import Chars from '../pattern/Chars';
import Custom from '../pattern/Custom';
import Safe from '../pattern/Safe';
import Unsafe from '../pattern/Unsafe';

var safeword = function (input) {
  return Safe.word(input);
};

var safetoken = function (input) {
  return Safe.token(input);
};

var custom = function (input, prefix, suffix, flags) {
  return Custom(input, prefix, suffix, flags);
};

var unsafeword = function (input) {
  return Unsafe.word(input);
};

var unsafetoken = function (input) {
  return Unsafe.token(input);
};

var sanitise = function (input) {
  return Safe.sanitise(input);
};

var chars = function () {
  return Chars.chars();
};

var wordbreak = function () {
  return Chars.wordbreak();
};

var wordchar = function () {
  return Chars.wordchar();
};

export default <any> {
  safeword: safeword,
  safetoken: safetoken,
  custom: custom,
  unsafeword: unsafeword,
  unsafetoken: unsafetoken,
  sanitise: sanitise,
  chars: chars,
  wordbreak: wordbreak,
  wordchar: wordchar
};