import * as Arr from 'ephox/katamari/api/Arr';
import { UnitTest, Assert } from '@ephox/bedrock-client';
import fc from 'fast-check';

UnitTest.test('Arr.reverse: unit tests', () => {
  const check = (expected, input) => {
    Assert.eq('reverse', expected, Arr.reverse(input));
    Assert.eq('reverse frozen', expected, Arr.reverse(Object.freeze(input.slice())));
  };

  check([], []);
  check([1], [1]);
  check([1, 2], [2, 1]);
  check([2, 1], [1, 2]);
  check([1, 4, 5, 3, 2], [2, 3, 5, 4, 1]);
});

UnitTest.test('Arr.reverse: Reversing twice is identity', () => {
  fc.assert(fc.property(fc.array(fc.integer()), (arr) => {
    Assert.eq('reverse twice', arr, Arr.reverse(Arr.reverse(arr)));
  }));
});

UnitTest.test('Arr.reverse: 1 element', () => {
  fc.assert(fc.property(fc.array(fc.integer()), (a) => {
    Assert.eq('reverse 1 element', [ a ], Arr.reverse([ a ]));
  }));
});

UnitTest.test('Arr.reverse: 2 elements', () => {
  fc.assert(fc.property(fc.integer(), fc.integer(), (a, b) => {
    Assert.eq('reverse 2 elements', [ b, a ], Arr.reverse([ a, b ]));
  }));
});

UnitTest.test('Arr.reverse: 3 elements', () => {
  fc.assert(fc.property(fc.integer(), fc.integer(), fc.integer(), (a, b, c) => {
    Assert.eq('reverse 3 elements', [ c, b, a ], Arr.reverse([ a, b, c ]));
  }));
});

UnitTest.test('Arr.reverse: ∀ xs. x ∈ (reverse xs) <-> x ∈ xs', () => {
  fc.assert(fc.property(fc.array(fc.integer()), (xs) => {
    const rxs = Arr.reverse(xs);
    Assert.eq('∀ xs. x ∈ (reverse xs) -> x ∈ xs', true, Arr.forall(rxs, (x) => Arr.contains(xs, x)));
    Assert.eq('∀ xs. x ∈ xs -> x ∈ (reverse xs)', true, Arr.forall(xs, (x) => Arr.contains(rxs, x)));
  }));
});
