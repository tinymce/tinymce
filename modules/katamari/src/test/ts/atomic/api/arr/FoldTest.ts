import * as Arr from 'ephox/katamari/api/Arr';
import { UnitTest, Assert } from '@ephox/bedrock-client';
import fc from 'fast-check';

UnitTest.test('fold: unit tests', () => {
  const checkl = (expected, input: any[], f, acc) => {
    Assert.eq('foldl', expected, Arr.foldl(input, f, acc));
    Assert.eq('foldl', expected, Arr.foldl(Object.freeze(input.slice()), f, acc));
  };

  const checkr = (expected, input, f, acc) => {
    Assert.eq('foldr', expected, Arr.foldr(input, f, acc));
    Assert.eq('foldr', expected, Arr.foldr(Object.freeze(input.slice()), f, acc));
  };

  checkl(0, [], () => {
  }, 0);
  checkl(6, [ 1, 2, 3 ], (acc, x) => acc + x, 0);
  checkl(13, [ 1, 2, 3 ], (acc, x) => acc + x, 7);
  // foldl with cons and [] should reverse the list
  checkl([ 3, 2, 1 ], [ 1, 2, 3 ], (acc, x) => [ x ].concat(acc), []);

  checkr(0, [], () => {
  }, 0);
  checkr(6, [ 1, 2, 3 ], (acc, x) => acc + x, 0);
  checkr(13, [ 1, 2, 3 ], (acc, x) => acc + x, 7);
  // foldr with cons and [] should be identity
  checkr([ 1, 2, 3 ], [ 1, 2, 3 ], (acc, x) => [ x ].concat(acc), []);
});

UnitTest.test('foldl concat [ ] xs === reverse(xs)', () => {
  fc.assert(fc.property(
    fc.array(fc.integer()),
    (arr: number[]) => {
      const output: number[] = Arr.foldl(arr, (b: number[], a: number) => [ a ].concat(b), [ ]);
      Assert.eq('eq', Arr.reverse(arr), output);
    }
  ));
});

UnitTest.test('foldr concat [ ] xs === xs', () => {
  fc.assert(fc.property(
    fc.array(fc.integer()),
    (arr: number[]) => {
      const output = Arr.foldr(arr, (b: number[], a: number) => [ a ].concat(b), [ ]);
      Assert.eq('eq', arr, output);
    }
  ));
});

UnitTest.test('foldr concat ys xs === xs ++ ys', () => {
  fc.assert(fc.property(
    fc.array(fc.integer()),
    fc.array(fc.integer()),
    (xs, ys) => {
      const output = Arr.foldr(xs, (b, a) => [ a ].concat(b), ys);
      Assert.eq('eq', xs.concat(ys), output);
    }
  ));
});

UnitTest.test('foldl concat ys xs === reverse(xs) ++ ys', () => {
  fc.assert(fc.property(
    fc.array(fc.integer()),
    fc.array(fc.integer()),
    (xs, ys) => {
      const output = Arr.foldl(xs, (b, a) => [ a ].concat(b), ys);
      Assert.eq('eq', Arr.reverse(xs).concat(ys), output);
    }
  ));
});
