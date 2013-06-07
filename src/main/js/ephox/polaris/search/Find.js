define(
  'ephox.polaris.search.Find',

  [
    'ephox.peanut.Fun'
  ],

  function (Fun) {

    var all = function (input, pattern) {
      var term = pattern.term();
      var r = [];
      var match = term.exec(input);
      while (match) {
        var start = match.index + pattern.prefix(match);
        var length = match[0].length - pattern.prefix(match) - pattern.suffix(match);
        r.push({
          start: Fun.constant(start),
          finish: Fun.constant(start + length)
        });
        term.lastIndex = start + length;
        match = term.exec(input);
      }
      return r;
    };

    return {
      all: all
    };

  }
);
