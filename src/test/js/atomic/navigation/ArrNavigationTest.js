test(
  'ArrNavigationTest',

  [
    'ephox.alloy.navigation.ArrNavigation',
    'ephox.perhaps.Option'
  ],

  function (ArrNavigation, Option) {
    var testSanity = function () {
      var checkCycle = function (expected, value, delta, min, max) {
        assert.eq(expected, ArrNavigation.cycleBy(value, delta, min, max));
      };

      var checkNav = function (expected, values, index, predicate, subject) {
        var actual = subject(values, index, predicate);
        expected.fold(function () {
          actual.fold(function () {
            // True, good.
          }, function (act) {
            assert.fail('Actual value should be none, was: ' + act);
          });
        }, function (exp) {
          actual.fold(function () {
            assert.fail('Expected value was: ' + exp + ', but actual was none.');
          }, function (act) {
            assert.eq(exp, act);
          });
        });
      };

      var isEven = function (x) {
        return x % 2 === 0;
      };

      checkCycle(0, 0, 1, 0, 0);
      checkCycle(10, 9, 1, 0, 50);
      checkCycle(11, 10, 1, 1, 11);
      checkCycle(1, 10, 1, 1, 10);
      checkCycle(10, 1, -1, 1, 10);

      checkNav(Option.some(4), [ 1, 2, 3, 4, 5 ], [ 1, 2, 3, 4, 5 ].length - 1, isEven, ArrNavigation.cyclePrev);
      checkNav(Option.none(), [ 1, 3, 5 ], [ ].length, isEven, ArrNavigation.cyclePrev);
      checkNav(Option.some(8), [ 1, 3, 5, 7, 10, 8 ], [ 1, 3, 5 ].length - 1, isEven, ArrNavigation.cyclePrev);
      checkNav(Option.some(10), [ 1, 3, 5, 7, 10, 89 ], [ 1, 3, 5 ].length - 1, isEven, ArrNavigation.cyclePrev);

      checkNav(Option.some(2), [ 1, 2, 3, 4, 5 ], [ 1, 2, 3, 4, 5 ].length - 1, isEven, ArrNavigation.cycleNext);
      checkNav(Option.none(), [ 1, 3, 5 ], [ ].length, isEven, ArrNavigation.cycleNext);
      checkNav(Option.some(10), [ 1, 3, 5, 7, 10, 8 ], [ 1, 3, 5 ].length - 1, isEven, ArrNavigation.cycleNext);
      checkNav(Option.some(2), [ 2, 1, 3, 5, 7, 10, 89 ], [ 2, 1, 3, 5, 7, 10, 89 ].length - 1, isEven, ArrNavigation.cycleNext);
    };

    testSanity();
  }
);