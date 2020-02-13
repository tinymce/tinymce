import * as Arr from 'ephox/katamari/api/Arr';
import { UnitTest, Assert } from '@ephox/bedrock-client';
import fc from 'fast-check';

UnitTest.test('difference: unit tests', () => {
  const check = <T>(expected, a1: T[], a2: T[]) => {
    const readonlyA1 = Object.freeze(a1.slice());
    const readonlyA2 = Object.freeze(a2.slice());
    Assert.eq('diff a1 a2', expected, Arr.difference(a1, a2));
    Assert.eq('diff ro a2', expected, Arr.difference(readonlyA1, a2));
    Assert.eq('diff a1 ro', expected, Arr.difference(a1, readonlyA2));
    Assert.eq('diff ro ro', expected, Arr.difference(readonlyA1, readonlyA2));
  };

  check([], [], []);
  check([ 1 ], [ 1 ], []);
  check([ 1, 2, 3 ], [ 1, 2, 3 ], []);
  check([], [], [ 1, 2, 3 ]);
  check([], [ 1, 2, 3 ], [ 1, 2, 3 ]);
  check([ 1, 3 ], [ 1, 2, 3, 4 ], [ 2, 4 ]);
  check([ 1 ], [ 1, 2, 3 ], [ 3, 2 ]);
  check([ 2 ], [ 1, 2, 3, 4 ], [ 3, 4, 5, 1, 10, 10000, 56 ]);
});

UnitTest.test('difference: ∀ xs ys. x ∈ xs -> x ∉ (ys - xs)', () => {
  fc.assert(fc.property(fc.array(fc.integer()), fc.array(fc.integer()), (xs, ys) => {
    const diff = Arr.difference(ys, xs);
    return Arr.forall(xs, (x) => !Arr.contains(diff, x));
  }));
});

UnitTest.test('difference: ∀ xs ys. x ∈ (ys - xs) -> x ∉ ys', () => {
  fc.assert(fc.property(fc.array(fc.integer()), fc.array(fc.integer()), (xs, ys) => {
    const diff = Arr.difference(ys, xs);
    return Arr.forall(diff, (d) => Arr.contains(ys, d));
  }));
});
