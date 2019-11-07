import * as Arr from 'ephox/katamari/api/Arr';
import * as Fun from 'ephox/katamari/api/Fun';
import { UnitTest, Assert } from '@ephox/bedrock-client';
import fc from 'fast-check';

UnitTest.test('Arr.forall: unit tests', () => {
  const isone = (i) => i === 1;

  const check = (expected, input, f) => {
    Assert.eq('eq', expected, Arr.forall(input, f));
    Assert.eq('eq', expected, Arr.forall(Object.freeze(input.slice()), f));
  };

  check(true, [ 1, 1, 1 ], isone);
  check(false, [ 1, 2, 1 ], isone);

  check(false, [ 1, 2, 1 ], (x, i) => i === 0);

  check(true, [ 1, 12, 3 ], (x, i) => i < 10);
});

UnitTest.test('forall of an empty array is true', () => {
  Assert.eq('forall empty array', true, Arr.forall([], () => { throw new Error('⊥'); }));
});

UnitTest.test('forall of a non-empty array with a predicate that always returns false is false', () => {
  fc.assert(fc.property(
    fc.array(fc.integer(), 1, 30),
    (xs) => {
      const output = Arr.forall(xs, Fun.constant(false));
      Assert.eq('eq', false, output);
    }
  ));
});

UnitTest.test('forall of a non-empty array with a predicate that always returns true is true', () => {
  fc.assert(fc.property(
    fc.array(fc.integer(), 1, 30),
    (xs) => {
      const output = Arr.forall(xs, Fun.constant(true));
      Assert.eq('eq', true, output);
    }
  ));
});
