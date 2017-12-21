import { Arr } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import WordScope from '../data/WordScope';

var quoteList = ['\'', '\u2018', '\u2019' ];
var whitelist = Arr.bind(quoteList, function (q) { 
  return Arr.map([ 'twas' ], function (t) {
    return q + t;
  });
});

var trimStart = function (ws) {
  var word = ws.word();
  return WordScope(word.substring(1), Option.some(word.charAt(0)), ws.right());
};

var trimEnd = function (ws) {
  var word = ws.word();
  return WordScope(word.substring(0, word.length - 1), ws.left(), Option.some(word.charAt(word.length - 1)));
};

var isQuote = function (s) {
  return Arr.contains(quoteList, s);
};

var rhs = function (ws) {
  var word = ws.word();
  var trailing = word.length >= 2 && isQuote(word.charAt(word.length - 1)) && !isQuote(word.charAt(word.length - 2));
  return trailing ? trimEnd(ws) : ws;
};

var lhs = function (ws) {
  var word = ws.word();
  var whitelisted = Arr.exists(whitelist, function (x) {
    return word.indexOf(x) > -1;
  });

  var apostrophes = whitelisted ? 2 : 1;
  var quoted = word.substring(0, apostrophes);

  var leading = Arr.forall(quoted, isQuote) && !isQuote(word.charAt(apostrophes));

  return leading ? trimStart(ws) : ws;
};

/**
 * If there are quotes at the edges of the WordScope, this determines if they are part of the word
 *
 * ws: WordScope
 */
var scope = function (ws) {
  var r = rhs(ws);
  return lhs(r);
};

/**
 * Extracts the actual word from the text using scope()
 */
var text = function (word) {
  var ws = WordScope(word, Option.none(), Option.none());
  var r = scope(ws);
  return r.word();
};

export default <any> {
  scope: scope,
  text: text
};