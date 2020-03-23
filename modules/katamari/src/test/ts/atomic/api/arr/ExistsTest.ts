import * as Arr from 'ephox/katamari/api/Arr';
import { UnitTest, Assert } from '@ephox/bedrock-client';
import fc from 'fast-check';

const eqc = (x) => (a) => x === a;
const never = () => false;
const always = () => true;
const bottom = () => { throw new Error('error'); };

UnitTest.test('Arr.exists: unit test', () => {
  const check = (expected, input: any[], f) => {
    Assert.eq('exists', expected, Arr.exists(input, f));
    Assert.eq('exists frozen', expected, Arr.exists(Object.freeze(input.slice()), f));
  };

  check(true, [ 1, 2, 3 ], eqc(1));
  check(false, [ 2, 3, 4 ], eqc(1));

  Assert.eq('Element does not exist in empty array when predicate is ⊥',
    false, Arr.exists([], bottom));

  Assert.eq('Element does not exist in empty array even when predicate always returns true',
    false, Arr.exists([], always));
});

UnitTest.test('Element exists in middle of array', () => {
  fc.assert(fc.property(fc.array(fc.integer()), fc.integer(), fc.array(fc.integer()), (prefix, element, suffix) => {
    const arr2 = Arr.flatten([ prefix, [ element ], suffix ]);
    Assert.eq('in array', true, Arr.exists(arr2, eqc(element)));
  }));
});

UnitTest.test('Element exists in singleton array of itself', () => {
  fc.assert(fc.property(fc.array(fc.integer()), (i) => {
    Assert.eq('in array', true, Arr.exists([ i ], eqc(i)));
  }));
});

UnitTest.test('Element does not exist in empty array', () => {
  fc.assert(fc.property(fc.array(fc.integer()), (i) => {
    Assert.eq('not in empty array', false, Arr.exists([], eqc(i)));
  }));
});

UnitTest.test('Element not found when predicate always returns false', () => {
  fc.assert(fc.property(fc.array(fc.integer()), (arr) => !Arr.exists(arr, never)));
});

UnitTest.test('Element exists in non-empty array when predicate always returns true', () => {
  fc.assert(fc.property(fc.array(fc.integer()), fc.integer(), (xs, x) => {
    const arr = Arr.flatten([ xs, [ x ]]);
    return Arr.exists(arr, always);
  }));
});
