import * as Arr from 'ephox/katamari/api/Arr';
import * as Jam from 'ephox/katamari/api/Jam';
import { UnitTest, Assert } from '@ephox/bedrock-client';
import fc from 'fast-check';
import { arbNegativeInteger } from 'ephox/katamari/test/arb/ArbDataTypes';

UnitTest.test('Intersperse', () => {
  const check = (expected, input, delimiter) => {
    const actual = Jam.intersperse(input, delimiter);
    Assert.eq('eq', expected, actual);
  };

  const checkErr = (expected, input, delimiter) => {
    try {
      Jam.intersperse(input, delimiter);
      Assert.fail('Excpected exception: ' + expected + ' from input: ' + input + ' with delimiter: ' + delimiter);
    } catch (e) {
      Assert.eq('eq', expected, e.message);
    }
  };

  check([], [], 2);
  check([ 1 ], [ 1 ], 2);
  check([ 1, 2, 1, 2, 1 ], [ 1, 1, 1 ], 2);
  check([ 'a', 3, 'a', 3, 'a' ], [ 'a', 'a', 'a' ], 3);
  check([ [ 1 ], [ 4 ], [ 1 ] ], [ [ 1 ], [ 1 ] ], [ 4 ]);
  checkErr('Cannot intersperse undefined', undefined, 2);
});

UnitTest.test('Length of interspersed = len(arr) + len(arr)-1', () => {
  fc.assert(fc.property(
    fc.array(fc.integer()),
    fc.integer(),
    (arr, delimiter) => {
      const actual = Jam.intersperse(arr, delimiter);
      const expected = arr.length === 0 ? 0 : arr.length * 2 - 1;
      Assert.eq('eq', expected, actual.length);
    }
  ));
});

UnitTest.test('Every odd element matches delimiter', () => {
  fc.assert(fc.property(
    fc.array(fc.integer()),
    fc.integer(),
    (arr, delimiter) => {
      const actual = Jam.intersperse(arr, delimiter);
      return Arr.forall(actual, (x, i) => i % 2 === 1 ? x === delimiter : true);
    }
  ));
});

UnitTest.test('Filtering out delimiters (assuming different type to array to avoid removing original array) should equal original', () => {
  fc.assert(fc.property(
    fc.array(fc.nat()),
    arbNegativeInteger(),
    (arr, delimiter) => {
      const actual = Jam.intersperse(arr, delimiter);
      const filtered = Arr.filter(actual, (a) => a !== delimiter);
      Assert.eq('eq', arr, filtered);
    }
  ));
});
