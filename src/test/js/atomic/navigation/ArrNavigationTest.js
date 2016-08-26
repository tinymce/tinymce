test(
  'ArrNavigationTest',

  [
    'ephox.alloy.navigation.ArrNavigation',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.wrap.Jsc',
    'global!Error',
    'global!Math'
  ],

  function (ArrNavigation, Fun, Option, Jsc, Error, Math) {
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

    var genUniqueArray = function (min, max) {
      return Jsc.integer(min, max).generator.map(function (num) {
        var r = [ ];
        for (var i = 0; i < num; i++) {
          r[i] = i;
        }
        return r;
      });
    };

    var genIndexInArray = function (array) {
      return Jsc.integer(0, array.length - 1).generator;
    };

    var genTestCase = Jsc.nearray(Jsc.integer).generator.flatMap(function (values1) {
      return Jsc.nearray(Jsc.integer).generator.flatMap(function (values2) {
        var combined = values1.concat(values2);
        return genIndexInArray(combined).map(function (index) {
          return {
            values: combined,
            index: index
          };
        });
      });
    });

    var genUniqueNumTestCase = genUniqueArray(2, 10).flatMap(function (values) {
      return genIndexInArray(values).map(function (index) {
        return {
          values: values,
          index: index
        };
      });
    });

    var arbTestCase = Jsc.bless({
      generator: genTestCase
    });

    // Each value in the array matches its index
    var arbUniqueNumTestCase = Jsc.bless({
      generator: genUniqueNumTestCase
    });

    Jsc.property(
      'Cycling should always be possible in a >= 2 length array',
      arbTestCase,
      function (testCase) {
        ArrNavigation.cycleNext(testCase.values, testCase.index, Fun.constant(true)).getOrDie(
          'Should always be able to cycle next on a >= 2 length array'
        );
        return true;
      }
    );

    Jsc.property(
      'Cycling should never be possible in a >= 2 length array if predicate is never',
      arbTestCase,
      function (testCase) {
        ArrNavigation.cycleNext(testCase.values, testCase.index, Fun.constant(false)).each(function (_) {
          throw new Error('Should not have navigatied to: ' + _);
        });
        return true;
      }
    );

    Jsc.property(
      'Cycling across a list of unique numbers of size 2 or greater should be symmetric: after(before(x)) === x',
      arbUniqueNumTestCase,
      function (testCase) {
        var initial = testCase.index;
        var before = ArrNavigation.cyclePrev(testCase.values, initial, Fun.constant(true)).getOrDie(
          'Should always be able to cycle prev on a >= 2 length array'
        );
        // Note, the index is the same as the value, so we can do this.
        var after = ArrNavigation.cycleNext(testCase.values, before, Fun.constant(true)).getOrDie(
          'Should always be able to cycle next on a >= 2 length array'
        );

        return Jsc.eq(initial, after);
      }
    );

    Jsc.property(
      'Cycling across a list of unique numbers of size 2 or greater should be symmetric: before(after(x)) === x',
      arbUniqueNumTestCase,
      function (testCase) {
        var initial = testCase.index;
        var after = ArrNavigation.cycleNext(testCase.values, initial, Fun.constant(true)).getOrDie(
          'Should always be able to cycle next on a >= 2 length array'
        );
        // Note, the index is the same as the value, so we can do this.
        var before = ArrNavigation.cyclePrev(testCase.values, after, Fun.constant(true)).getOrDie(
          'Should always be able to cycle prev on a >= 2 length array'
        );

        return Jsc.eq(initial, before);
      }
    );

    Jsc.property(
      'Cycling next makes an index of 0, or one higher',
      arbUniqueNumTestCase,
      function (testCase) {
        var after = ArrNavigation.cycleNext(testCase.values, testCase.index, Fun.constant(true)).getOrDie(
          'Should always be able to cycle next on a >= 2 length array'
        );

        return Jsc.eq(after, 0) || Jsc.eq(testCase.index + 1, after);
      }
    );

    Jsc.property(
      'Cycling prev makes an index of values.length - 1, or one lower',
      arbUniqueNumTestCase,
      function (testCase) {
        var before = ArrNavigation.cyclePrev(testCase.values, testCase.index, Fun.constant(true)).getOrDie(
          'Should always be able to cycle prev on a >= 2 length array'
        );

        return Jsc.eq(before, testCase.values.length - 1) || Jsc.eq(testCase.index - 1, before);
      }
    );

    Jsc.property(
      'Unique: Try next should be some(+1) or none',
      arbUniqueNumTestCase,
      function (testCase) {
        return ArrNavigation.tryNext(testCase.values, testCase.index, Fun.constant(true)).fold(function () {
          // Nothing, so we must be at the last index position
          return Jsc.eq(testCase.index, testCase.values.length - 1);
        }, function (after) {
          return Jsc.eq(testCase.index + 1, after);
        });
      }
    );

    Jsc.property(
      'Unique: Try prev should be some(-1) or none',
      arbUniqueNumTestCase,
      function (testCase) {
        return ArrNavigation.tryPrev(testCase.values, testCase.index, Fun.constant(true)).fold(function () {
          // Nothing, so we must be at the first index position
          return Jsc.eq(testCase.index, 0);
        }, function (before) {
          return Jsc.eq(testCase.index - 1, before);
        });
      }
    );

    Jsc.property(
      'CycleBy should have an adjustment of delta, or be the min or max',
      Jsc.nat,
      Jsc.integer,
      Jsc.nat,
      Jsc.nat,
      function (value, delta, min, range) {
        var max = min + range;
        var actual = ArrNavigation.cycleBy(value, delta, min, max);
        return Jsc.eq((actual - value) === delta, true) || actual === min || actual === max;
      }
    );
  }
);