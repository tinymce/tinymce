test(
  'MapTest',

  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.wrap.Jsc'
  ],

  function (Arr, Fun, Jsc) {
    var dbl = function (x) {
      return x * 2;
    };

    var check = function (expected, C, input, f) {
      assert.eq(expected, C.map(input, f));
    };

    var checkA = function (expected, input, f) {
      check(expected, Arr, input, f);
    };

    checkA([], [], dbl);
    checkA([2], [1], dbl);
    checkA([4, 6, 10], [2, 3, 5], dbl);

    Jsc.property(
      'map id xs = xs',
      Jsc.array(Jsc.json),
      function (arr) {
        var output = Arr.map(arr, Fun.identity);
        return Jsc.eq(arr, output);
      }
    );

    Jsc.property(
      'map constant (y) xs = array of y',
      Jsc.array(Jsc.json),
      Jsc.json,
      function (arr, y) {
        var output = Arr.map(arr, Fun.constant(y));
        return Arr.forall(output, function (x) {
          return x === y;
        });
      }
    );
  }
);
