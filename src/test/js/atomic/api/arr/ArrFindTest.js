test(
  'ArrFindTest',

  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.wrap.Jsc'
  ],

  function (Arr, Fun, Jsc) {
    var checkArr = function (expected, input, pred) {
      var actual = Arr.find(input, pred);
      assert.eq(expected, actual);
    };

    checkArr(undefined, [], function (x) { return x > 0; });
    checkArr(undefined, [-1], function (x) { return x > 0; });
    checkArr(1, [1], function (x) { return x > 0; });
    checkArr(41, [4, 2, 10, 41, 3], function (x) { return x === 41; });
    checkArr(100, [4, 2, 10, 41, 3, 100], function (x) { return x > 80; });
    checkArr(undefined, [4, 2, 10, 412, 3], function (x) { return x === 41; });

    checkArr(10, [4, 2, 10, 412, 3], function (x, i) { return i === 2; });

    var a = [4, 2, 10, 412, 3];
    checkArr(4, a, function (x, i, o) { return o === a; });


    Jsc.property(
      'the value found by find always passes predicate',
      Jsc.array(Jsc.json),
      Jsc.fun(Jsc.bool),
      function (arr, pred) {
        var value = Arr.find(arr, pred);
        if (value === undefined) {
          return !Arr.exists(arr, pred);
          // nothing in array matches predicate
        } else {
          return pred(value);
        }
      }
    );

    Jsc.property(
      'If predicate is always false, then find is always undefined',
      Jsc.array(Jsc.json),
      function (arr) {
        var value = Arr.find(arr, Fun.constant(false));
        return value === undefined;
      }
    );

    Jsc.property(
      'If array is empty, find is always undefined',
      Jsc.fun(Jsc.bool),
      function (pred) {
        var value = Arr.find([ ], pred);
        return value === undefined;
      }
    );

    Jsc.property(
      'If predicate is always true, then value is always the first, or undefined if array is empty',
      Jsc.array(Jsc.json),
      function (arr) {
        var value = Arr.find(arr, Fun.constant(true));
        var expected = arr.length === 0 ? undefined : arr[0];
        return Jsc.eq(expected, value);
      }
    );

  }
);