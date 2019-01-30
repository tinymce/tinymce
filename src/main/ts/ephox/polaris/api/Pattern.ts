import Chars from '../pattern/Chars';
import Custom from '../pattern/Custom';
import Safe from '../pattern/Safe';
import Unsafe from '../pattern/Unsafe';

const safeword = function (input) {
  return Safe.word(input);
};

const safetoken = function (input) {
  return Safe.token(input);
};

const custom = function (input, prefix, suffix, flags) {
  return Custom(input, prefix, suffix, flags);
};

const unsafeword = function (input) {
  return Unsafe.word(input);
};

const unsafetoken = function (input) {
  return Unsafe.token(input);
};

const sanitise = function (input) {
  return Safe.sanitise(input);
};

const chars = function () {
  return Chars.chars();
};

const wordbreak = function () {
  return Chars.wordbreak();
};

const wordchar = function () {
  return Chars.wordchar();
};

export default <any> {
  safeword,
  safetoken,
  custom,
  unsafeword,
  unsafetoken,
  sanitise,
  chars,
  wordbreak,
  wordchar
};