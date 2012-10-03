define(
  'ephox.phoenix.util.str.Find',

  [
    'ephox.perhaps.Option'
  ],

  function (Option) {

    var all = function (input, pattern) {
      var term = pattern.term();
      var r = [];
      var match = term.exec(input);
      while (match) {
        r.push(match.index + pattern.preOffset(match));
        // Because of the inability to easily use zero-length matches, we have to exclude
        // the part after the word (i.e. the boundary) when setting the index for the next search.
        term.lastIndex = term.lastIndex - pattern.postOffset(match);
        match = term.exec(input);
      }

      return r;
    };

    var from = function (input, pattern, index) {
      var term = pattern.term();
      var match = term.exec(input);
      if (match && match.index >= index) {
        var start = match.index + pattern.preOffset(match);
        return Option.some([start, start + pattern.length() - pattern.postOffset(match)]);
      } else {
        return Option.none();
      }
    };

    return {
      all: all,
      from: from
    };
  }
);