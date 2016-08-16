test(
  'FindTest',

  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Obj'
  ],

  function (Arr, Obj) {
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

    var checkObj = function (expected, input, pred) {
      var actual = Obj.find(input, pred);
      assert.eq(expected, actual);
    };

    checkObj(undefined, {}, function (v, k) { return v > 0; });
    checkObj(3, { 'test': 3 }, function (v, k) { return k === 'test'; });
    checkObj(undefined, { 'test': 0 }, function (v, k) { return v > 0; });
    checkObj(4, { 'blah': 4, 'test': 3 }, function (v, k) { return v > 0; });
    checkObj(undefined, { 'blah': 4, 'test': 3 }, function (v, k) { return v === 12; });

    var obj = { 'blah': 4, 'test': 3 };
    checkObj(4, obj, function (v, k, o) { return o === obj; });
  }
);
