import { Arr, Option } from '@ephox/katamari';
import { WordScope } from '../data/WordScope';

const quoteList = ['\'', '\u2018', '\u2019' ];
const whitelist = Arr.bind(quoteList, function (q) {
  return Arr.map([ 'twas' ], function (t) {
    return q + t;
  });
});

const trimStart = function (ws: WordScope) {
  const word = ws.word();
  return WordScope(word.substring(1), Option.some(word.charAt(0)), ws.right());
};

const trimEnd = function (ws: WordScope) {
  const word = ws.word();
  return WordScope(word.substring(0, word.length - 1), ws.left(), Option.some(word.charAt(word.length - 1)));
};

const isQuote = function (s: string) {
  return Arr.contains(quoteList, s);
};

const rhs = function (ws: WordScope) {
  const word = ws.word();
  const trailing = word.length >= 2 && isQuote(word.charAt(word.length - 1)) && !isQuote(word.charAt(word.length - 2));
  return trailing ? trimEnd(ws) : ws;
};

const lhs = function (ws: WordScope) {
  const word = ws.word();
  const whitelisted = Arr.exists(whitelist, function (x) {
    return word.indexOf(x) > -1;
  });

  const apostrophes = whitelisted ? 2 : 1;
  const quoted = word.substring(0, apostrophes);

  const leading = Arr.forall(quoted, isQuote) && !isQuote(word.charAt(apostrophes));

  return leading ? trimStart(ws) : ws;
};

/**
 * If there are quotes at the edges of the WordScope, this determines if they are part of the word
 *
 * ws: WordScope
 */
const scope = function (ws: WordScope) {
  const r = rhs(ws);
  return lhs(r);
};

/**
 * Extracts the actual word from the text using scope()
 */
const text = function (word: string) {
  const ws = WordScope(word, Option.none(), Option.none());
  const r = scope(ws);
  return r.word();
};

export default {
  scope,
  text
};