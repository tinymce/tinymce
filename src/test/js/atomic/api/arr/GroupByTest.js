test(
  'Group By Test',

  [
    'ephox.katamari.api.Arr'
  ],

  function (Arr) {

    (function() {

      var check = function (input, expected) {
        assert.eq(expected, Arr.groupBy(input, function (b) { return b; }));
      };

      check([], []);
      check([true], [[true]]);
      check([false], [[false]]);
      check(
        [true, false, false, true],
        [
          [true], [false, false], [true]
        ]
      );
      check(
        [undefined, 1, 2, undefined, undefined, undefined, 1, 2],
        [
          [undefined], [1], [2], [undefined, undefined, undefined], [1], [2]
        ]
      );
      check(
        [{}, 1, 2, undefined, undefined, undefined, 1, 2],
        [
          [{}], [1], [2], [undefined, undefined, undefined], [1], [2]
        ]
      );

      check(
        [false, false, true, true, true, false, false, true, false, true],
        [
          [false, false], [true, true, true], [false, false], [true], [false], [true]
        ]
      );
    })();
  }
);