define(
  'ephox.phoenix.util.str.Find',

  [
    'ephox.compass.Obj',
    'ephox.perhaps.Option',
    'ephox.scullion.Struct'
  ],

  function (Obj, Option, Struct) {

    var FindMatch = Struct.immutable('start', 'finish');

    var all = function (input, pattern) {
      var term = pattern.term();
      var r = [];
      var match = term.exec(input);
      while (match) {
        var start = match.index + pattern.preOffset(match);
        var length = match[0].length - pattern.preOffset(match) - pattern.postOffset(match);
        r.push(FindMatch(start, start + length));
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