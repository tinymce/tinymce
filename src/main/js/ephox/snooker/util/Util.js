define(
  'ephox.snooker.util.Util',

  [
    'ephox.compass.Arr'
  ],

  function (Arr) {
    // Rename this module, and repeat should be in Arr.
    var repeat = function(repititions, f) {
      var r = [];
      for (var i = 0; i < repititions; i++) {
        r.push(f(i));
      }
      return r;
    };

    var range = function (start, end) {
      var r = [];
      for (var i = start; i < end; i++) {
        r.push(i);
      }
      return r;
    };

    var unique = function (xs, comparator) {
      var result = [];
      Arr.each(xs, function (x, i) {
        if (i < xs.length - 1 && !comparator(x, xs[i + 1])) {
          result.push(x);
        } else if (i === xs.length - 1) {
          result.push(x);
        }
      });
      return result;
    };

    return {
      repeat: repeat,
      range: range,
      unique: unique
    };
  }
);
