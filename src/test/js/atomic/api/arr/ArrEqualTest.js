test(
  'ArrEqualTest',

  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.wrap.Jsc'
  ],

  function (Arr, Fun, Jsc) {
    var check = function (expected, a1, a2) {
      var actual = Arr.equal(a1, a2);
      assert.eq(expected, actual);
    };

    check(true, [], []);
    check(false, [1], []);
    check(false, [], [1]);
    check(true, [1], [1]);
    check(false, [1], [2]);
    check(false, [2], [3]);
    check(false, [1, 2, 3], [3, 2, 1]);
    check(false, [1, 2], [1, 2, 3]);
    check(false, [1, 2, 3], [1, 2]);
    check(true, [3, 1, 2], [3, 1, 2]);

    Jsc.property(
      'Two arrays should be the same',
      Jsc.array(Jsc.json),
      function (arr) {
        return Arr.equal(arr, arr);
      }
    );

    Jsc.property(
      'Two arrays should not be the same if one has another appended',
      Jsc.array(Jsc.json),
      Jsc.nearray(Jsc.json),
      function (arr, extra) {
        return !Arr.equal(arr, arr.concat(extra));
      }
    );

    Jsc.property(
      'Two arrays should not be the same if one has another preprended',
      Jsc.array(Jsc.json),
      Jsc.nearray(Jsc.json),
      function (arr, extra) {
        return !Arr.equal(arr, extra.concat(arr));
      }
    );

    Jsc.property(
      'Two arrays should be the same if one is mapped identity over the other',
      Jsc.array(Jsc.json),
      function (arr) {
        var other = Arr.map(arr, Fun.identity);
        return Arr.equal(arr, other);
      }
    );
  }
);