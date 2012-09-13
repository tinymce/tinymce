define(
  'ephox.phoenix.util.str.Find',

  [
  ],

  function () {

    var all = function (input, term) {
      var r = [];
      var s = input;
      var acc = 0;
      var current = s.search(term);
      while (current !== -1) {
        r.push(acc + current);
        var next = current + 1;
        s = s.substring(next);
        acc += next;
        current = s.search(term);
      }
      return r;
    };

    return {
      all: all
    };
  }
);
