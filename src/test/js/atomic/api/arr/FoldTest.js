test(
  'FoldTest',

  [
    'ephox.katamari.api.Arr'
  ],

  function (Arr) {
    var checkl = function (expected, input, f, acc) {
      assert.eq(expected, Arr.foldl(input, f, acc));
    };

    var checkr = function (expected, input, f, acc) {
      assert.eq(expected, Arr.foldr(input, f, acc));
    };

    checkl(0, [], function () { }, 0);
    checkl(6, [1, 2, 3], function (acc, x) { return acc + x; }, 0);
    checkl(13, [1, 2, 3], function (acc, x) { return acc + x; }, 7);
    // foldl with cons and [] should reverse the list
    checkl([3, 2, 1], [1, 2, 3], function (acc, x) { return [x].concat(acc); }, []);

    checkr(0, [], function () { }, 0);
    checkr(6, [1, 2, 3], function (acc, x) { return acc + x; }, 0);
    checkr(13, [1, 2, 3], function (acc, x) { return acc + x; }, 7);
    // foldr with cons and [] should be identity
    checkr([1, 2, 3], [1, 2, 3], function (acc, x) { return [x].concat(acc); }, []);
  }
);
