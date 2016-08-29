test(
  'ArrNavigationTest',

  [
    'ephox.agar.api.RawAssertions',
    'ephox.alloy.navigation.ArrNavigation',
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.wrap.Jsc',
    'global!Error',
    'global!Math'
  ],

  function (RawAssertions, ArrNavigation, Arr, Fun, Option, Jsc, Error, Math) {
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


      var checkIrregularGrid = function (expected, method, values, index, numRows, numColumns) {
        var actual = method(values, index, numRows, numColumns, Fun.constant(true)).getOrDie('Checking irregular grid');
        RawAssertions.assertEq('Checking expected index in irregular grid', expected, actual);
      };

      var range = function (num) {
        var r = [];
        for (var i = 0; i < num; i++) {
          r[i] = i;
        }
        return r;
      };

      var cases = [
        // cycle down
        { start: { r: 0, c: 0 }, move: ArrNavigation.cycleDown, finish: { r: 1, c: 0 } },
        { start: { r: 0, c: 1 }, move: ArrNavigation.cycleDown, finish: { r: 1, c: 1 } },
        { start: { r: 2, c: 0 }, move: ArrNavigation.cycleDown, finish: { r: 3, c: 0 } },
        { start: { r: 4, c: 0 }, move: ArrNavigation.cycleDown, finish: { r: 5, c: 0 } },
        { start: { r: 5, c: 0 }, move: ArrNavigation.cycleDown, finish: { r: 0, c: 0 } },

        // This one should be capped.
        { start: { r: 4, c: 3 }, move: ArrNavigation.cycleDown, finish: { r: 5, c: 1 } }


        // { start: 4 * 0 + 1, move: ArrNavigation.cycleDown, finish: 4 * 1 + 1 },
        // { start: 4 * 1 + 1, move: ArrNavigation.cycleDown, finish: 4 * 2 + 1 },
        // { start: 4 * 5 + 0, move: ArrNavigation.cycleDown, finish: 4 * 0 + 0 },
        // { start: 4 * 5 + 1, move: ArrNavigation.cycleDown, finish: 4 * 0 + 1 },
        // { start: 4 * 3 + 2, move: ArrNavigation.cycleDown, finish: 4 * 4 + 2 },

        // // cycle up
        // { start: 4 * 4 + 3, move: ArrNavigation.cycleUp, finish: 4 * 3 + 3 },
        // { start: 4 * 3 + 2, move: ArrNavigation.cycleUp, finish: 4 * 2 + 2 },
        // { start: 4 * 0 + 2, move: ArrNavigation.cycleUp, finish: 4 * 5 + 2 },

        // // cycle left
        // { start: 4 * 4 + 3, move: ArrNavigation.cycleUp, finish: 4 * 3 + 3 },

        // { start: 1, move: ArrNavigation.cycleUp, finish: 5 },
        // { start: 4 * 1 + 1, move: ArrNavigation.cycleUp, finish: 9 },
        // { start: 4 * 4 + 0, move: ArrNavigation.cycleUp, finish: 0 },
        // { start: 4 * 4 + 1, move: ArrNavigation.cycleUp, finish: 1 },
      ];

      /*
        00 01 02 03
        04 05 06 07
        08 09 10 11
        12 13 14 15
        16 17 18 19
        20 21
 


      */
      Arr.each(cases, function (c) {
        checkIrregularGrid(
          c.finish.r * 4 + c.finish.c,
          c.move,
          range(22),
          c.start.r * 4 + c.start.c,
          6,
          4
        );
      });
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

    var genRegularGrid = Jsc.integer(2, 20).generator.flatMap(function (numRows) {
      return Jsc.integer(2, 20).generator.flatMap(function (numCols) {
        var maxIndex = numRows * numCols;
        return Jsc.integer(0, maxIndex - 1).generator.map(function (index) {
          var values = [ ];
          for (var i = 0; i < maxIndex; i++) {
            values[i] = i;
          }

          return { 
            values: values,
            numRows: numRows,
            numCols: numCols,
            index: index
          };
        });
      });
    });

    var genIrregularGrid = Jsc.integer(2, 3).generator.flatMap(function (numRows) {
      return Jsc.integer(2, 3).generator.flatMap(function (numCols) {
        return Jsc.integer(1, numCols - 2).generator.flatMap(function (remainder) {
          var maxIndex = numRows * numCols + remainder;
          return Jsc.integer(0, maxIndex - 1).generator.map(function (index) {

            var values = [ ];
            for (var i = 0; i < maxIndex; i++) {
              values[i] = i;
            }

            return { 
              values: values,
              numRows: numRows + 1, // due to remainder
              numCols: numCols,
              lastRowIndex: numRows * numCols,
              remainder: remainder,
              index: index
            };
          });
        });
      });
    });

    var arbRegularGrid = Jsc.bless({
      generator: genRegularGrid
    });

    var arbIrregularGrid = Jsc.bless({
      generator: genIrregularGrid
    });

    Jsc.property(
      'Regular grid: cycleUp and cycleDown should be symmetric',
      arbRegularGrid,
      function (arb) {
        var afterDown = ArrNavigation.cycleDown(arb.values, arb.index, arb.numRows, arb.numCols).getOrDie('Should be able to cycleDown');
        var afterUp = ArrNavigation.cycleUp(arb.values, afterDown, arb.numRows, arb.numCols).getOrDie('Should be able to cycleUp');
        return Jsc.eq(arb.index, afterUp) && afterDown !== arb.index;
      }
    );

    Jsc.property(
      'Regular grid: cycleLeft and cycleRight should be symmetric',
      arbRegularGrid,
      function (arb) {
        var afterLeft = ArrNavigation.cycleLeft(arb.values, arb.index, arb.numRows, arb.numCols).getOrDie('Should be able to cycleLeft');
        var afterRight = ArrNavigation.cycleRight(arb.values, afterLeft, arb.numRows, arb.numCols).getOrDie('Should be able to cycleRight');
        return Jsc.eq(arb.index, afterRight) && afterLeft !== arb.index;
      }
    );

    Jsc.property(
      'Irregular grid: cycleUp and cycleDown should be symmetric unless on last row',
      arbIrregularGrid,
      function (arb) {
        var afterDown = ArrNavigation.cycleDown(arb.values, arb.index, arb.numRows, arb.numCols).getOrDie('Should be able to cycleDown');
        var afterUp = ArrNavigation.cycleUp(arb.values, afterDown, arb.numRows, arb.numCols).getOrDie('Should be able to cycleUp');
        var usedLastRow = afterDown >= arb.lastRowIndex || afterUp >= arb.lastRowIndex;
        return Jsc.eq(arb.index, afterUp) || usedLastRow;
      }
    );

    Jsc.property(
      'Irregular grid: cycleLeft and cycleRight should be symmetric unless on last row with one remainder',
      arbIrregularGrid,
      function (arb) {
        var afterLeft = ArrNavigation.cycleLeft(arb.values, arb.index, arb.numRows, arb.numCols).getOrDie('Should be able to cycleLeft');
        var afterRight = ArrNavigation.cycleRight(arb.values, afterLeft, arb.numRows, arb.numCols).getOrDie('Should be able to cycleRight');
        return Jsc.eq(arb.index, afterRight) || (arb.index >= arb.lastRowIndex && arb.remainder === 1);
      }
    );


  }
);