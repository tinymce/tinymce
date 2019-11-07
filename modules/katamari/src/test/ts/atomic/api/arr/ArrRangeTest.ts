import * as Arr from 'ephox/katamari/api/Arr';
import * as Fun from 'ephox/katamari/api/Fun';
import { UnitTest, Assert } from '@ephox/bedrock-client';
import * as fc from 'fast-check';
import { Testable } from '@ephox/dispute';

const { tArray, tNumber } = Testable;

UnitTest.test('Arr.range: unit tests', () => {
  const check = (expected, input, f) => {
    const actual = Arr.range(input, f);
    Assert.eq('range', expected, actual, tArray(tNumber));
  };

  check([], 0, Fun.constant(10));
  check([10], 1, Fun.constant(10));
  check([10, 20, 30], 3, (x) => 10 * (x + 1));
});

UnitTest.test('Arr.range: property tests', () => {
  fc.assert(fc.property(
    fc.nat(30),
    (num) => {
      const range = Arr.range(num, Fun.identity);
      Assert.eq('length', range.length, num, tNumber);
      return Arr.forall(range, (x, i) => x === i);
    }));
});
