import * as Arr from 'ephox/katamari/api/Arr';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('ContainsTest', function() {
  const check = function (expected, input: any[], value) {
    assert.eq(expected, Arr.contains(input, value));
    assert.eq(expected, Arr.contains(Object.freeze(input.slice()), value));
  };

  check(false, [], 1);
  check(true, [1], 1);
  check(false, [1], 2);
  check(true, [2, 4, 6], 2);
  check(true, [2, 4, 6], 4);
  check(true, [2, 4, 6], 6);
  check(false, [2, 4, 6], 3);

  const genArrayWithSplit = Jsc.nearray(Jsc.json).generator.flatMap(function (arr) {
    return Jsc.integer(0, arr.length).generator.map(function (slicePt) {
      return {
        arr: arr,
        slicePt: slicePt
      };
    });
  });

  const arbArrayWithSplit = Jsc.bless({
    generator: genArrayWithSplit
  });

  Jsc.property(
    'An element added to an array must be contained within it',
    arbArrayWithSplit,
    Jsc.json,
    function (arb, value) {
      const arr = arb.arr.slice(0, arb.slicePt).concat([ value ]).concat(arb.arr.slice(arb.slicePt));
      return Arr.contains(arr, value);
    }
  );

  Jsc.property(
    'An array should not contain anything which has been removed via a filter',
    arbArrayWithSplit,
    Jsc.json,
    function (arb, value) {
      const filtered = Arr.filter(arb.arr, function (item) {
        return item !== value;
      });
      return !Arr.contains(filtered, value);
    }
  );

  Jsc.property(
    'An empty array should contain nothing',
    Jsc.json,
    function (value) {
      return !Arr.contains([ ], value);
    }
  );
});

