define(
  'ephox.polaris.array.Split',

  [
    'ephox.compass.Arr'
  ],

  function (Arr) {
    var splitby = function (xs, pred) {
      var r = [];
      var part = [];
      Arr.each(xs, function (x) {
        if (pred(x)) {
          r.push(part);
          part = [];
        } else {

          part.push(x);
        }
      });

      if (part.length > 0) r.push(part);
      return r;
    };

    return {
      splitby: splitby
    };
  }
);
