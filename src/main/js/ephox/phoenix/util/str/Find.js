define(
  'ephox.phoenix.util.str.Find',

  [
    'ephox.compass.Obj',
    'ephox.perhaps.Option'
  ],

  function (Obj, Option) {

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
      term.lastIndex = index;
      var match = term.exec(input);
      if (match && match.index >= index) {
        var start = match.index + pattern.preOffset(match);
        var length = match[0].length - pattern.preOffset(match) - pattern.postOffset(match);
        return Option.some([start, start + length]);
      } else {
        return Option.none();
      }
    };

    var viper = function (input, pattern) {
      var term = pattern.term();
      var r = [];
      var match = term.exec(input);
      while (match) {
        var start = match.index + pattern.preOffset(match);
        var length = match[0].length - pattern.preOffset(match) - pattern.postOffset(match);
        r.push([start, start + length]);
        term.lastIndex = start + length;
        match = term.exec(input);
      }
      return r;
    };

    return {
      all: all,
      from: from,
      viper: viper
    };
  }
);