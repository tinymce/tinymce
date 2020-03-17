import * as Arr from 'ephox/katamari/api/Arr';
import { UnitTest, Assert } from '@ephox/bedrock-client';
import fc from 'fast-check';

UnitTest.test('Arr.contains: unit test', () => {
  const check = (expected, input: any[], value) => {
    Assert.eq('contains', expected, Arr.contains(input, value));
    Assert.eq('contains frozen', expected, Arr.contains(Object.freeze(input.slice()), value));
  };

  check(false, [], 1);
  check(true, [ 1 ], 1);
  check(false, [ 1 ], 2);
  check(true, [ 2, 4, 6 ], 2);
  check(true, [ 2, 4, 6 ], 4);
  check(true, [ 2, 4, 6 ], 6);
  check(false, [ 2, 4, 6 ], 3);
});

UnitTest.test('Arr.contains: empty', () => {
  Assert.eq('empty', false, Arr.contains([], () => { throw new Error('⊥'); }));
});

UnitTest.test('Arr.contains: array contains element', () => {
  fc.assert(fc.property(fc.array(fc.integer()), fc.integer(), fc.array(fc.integer()), (prefix, element, suffix) => {
    const arr2 = Arr.flatten([ prefix, [ element ], suffix ]);
    Assert.eq('in array', true, Arr.contains(arr2, element));
  }));
});
