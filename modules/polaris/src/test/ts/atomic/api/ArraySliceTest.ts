import { Assert, UnitTest } from '@ephox/bedrock-client';
import * as Arrays from 'ephox/polaris/api/Arrays';
import * as fc from 'fast-check';
import { Testable } from '@ephox/dispute';

const { tArray, tNumber } = Testable;

const is = <T> (a: T) => (b: T) => a === b;

UnitTest.test('sliceby: unit tests', function () {

  const check = function (expected: number[], input: number[], pred: (x: number, i: number) => boolean) {
    const actual = Arrays.sliceby(input, pred);
    Assert.eq('sliceby', expected, actual, tArray(tNumber));
  };

  check([], [], is(0));
  check([], [ 1 ], is(1));
  check([ 1 ], [ 1, 2 ], is(2));
  check([ 1, 2, 3 ], [ 1, 2, 3, 4 ], is(4));
});

UnitTest.test('sliceby: property tests', function () {

  fc.assert(fc.property(
    fc.array(fc.nat()),
    fc.array(fc.nat()),
    (a1, a2) => {
      const input = a1.concat([ -1 ]).concat(a2);
      Assert.eq('sliceby',
        a1,
        Arrays.sliceby(input, is(-1)),
        tArray(tNumber)
      );
    }));
});
