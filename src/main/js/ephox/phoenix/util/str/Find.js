define(
  'ephox.phoenix.util.str.Find',

  [
  ],

  function () {

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

    return {
      all: all
    };
  }
);