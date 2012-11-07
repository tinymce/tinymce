define(
  'ephox.robin.util.WordSanitiser',

  [
    'ephox.compass.Arr',
    'ephox.perhaps.Option',
    'ephox.robin.data.WordScope'
  ],

  function (Arr, Option, WordScope) {

    var whitelist = ["'twas"];

    var trimStart = function (ws) {
      var word = ws.word();
      return WordScope(word.substring(1), Option.some("'"), ws.right());
    };

    var trimEnd = function (ws) {
      var word = ws.word();
      return WordScope(word.substring(0, word.length - 1), ws.left(), Option.some("'"));
    };

    var isQuote = function (s, i) { 
      return s.charAt(i) === "'";
    };

    var rhs = function (ws) {
      var word = ws.word();
      var trailing = word.length >= 2 && isQuote(word, word.length - 1) && !isQuote(word, word.length - 2);
      return trailing ? trimEnd(ws) : ws;
    };

    var lhs = function (ws) {
      var word = ws.word();
      var exc = Arr.exists(whitelist, function (x) {
        return word.indexOf(x) > -1;
      });

      var leading = exc ? 
        isQuote(word, 0) && isQuote(word, 1) && !isQuote(word, 2)
        : word.length >= 2 && isQuote(word, 0) && !isQuote(word, 1);

      return leading ? trimStart(ws) : ws;
    };

    var scope = function (ws) {
      var r = rhs(ws);
      return lhs(r);
    };

    var text = function (word) {
      var ws = WordScope(word, Option.none(), Option.none());
      var r = scope(ws);
      return r.word();
    };

    return {
      scope: scope,
      text: text
    };
  }
);