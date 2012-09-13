define(
  'ephox.phoenix.util.str.Find',

  [
  ],

  function () {

    var all = function (input, pattern) {
      var term = pattern.term();
      var len = pattern.length();
      var offset = pattern.offset();
 
      var r = [];
      var s = input;
      var acc = 0;
      var rawCurrent = s.search(term);
      while (rawCurrent !== -1 && s.length > 0) {
        var current = offset(s) + rawCurrent;
        r.push(acc + current);
        var next = current + len;
        s = s.substring(next);
        acc += next;
        rawCurrent = s.search(term);
      }
      return r;
    };

    return {
      all: all
    };
  }
);
