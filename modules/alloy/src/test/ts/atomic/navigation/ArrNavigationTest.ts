import { UnitTest } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { assert } from 'chai';
import * as fc from 'fast-check';

import * as ArrNavigation from 'ephox/alloy/navigation/ArrNavigation';

UnitTest.test('ArrNavigationTest', () => {
  const genUniqueArray = (min: number, max: number) => fc.integer({ min, max }).map((num) => {
    const r = [ ];
    for (let i = 0; i < num; i++) {
      r[i] = i;
    }
    return r;
  });

  const genIndexInArray = (array: number[]) => fc.integer({ min: 0, max: array.length - 1 });

  const arbTestCase = fc.array(fc.integer(), { minLength: 1 }).chain((values1) => fc.array(fc.integer(), { minLength: 1 }).chain((values2 ) => {
    const combined = values1.concat(values2);
    return genIndexInArray(combined).map((index) => ({
      values: combined,
      index
    }));
  }));

  // Each value in the array matches its index
  const arbUniqueNumTestCase = genUniqueArray(2, 10).chain((values) => genIndexInArray(values).map((index) => ({
    values,
    index
  })));

  // Cycling should always be possible in a >= 2 length array
  fc.assert(fc.property(arbTestCase, (testCase) => {
    ArrNavigation.cycleNext(testCase.values, testCase.index, Fun.always).getOrDie(
      'Should always be able to cycle next on a >= 2 length array'
    );
  }));

  // Cycling should never be possible in a >= 2 length array if predicate is never
  fc.assert(fc.property(arbTestCase, (testCase) => {
    ArrNavigation.cycleNext(testCase.values, testCase.index, Fun.never).each((_) => {
      throw new Error('Should not have navigatied to: ' + _);
    });
  }));

  // Cycling across a list of unique numbers of size 2 or greater should be symmetric: after(before(x)) === x
  fc.assert(fc.property(arbUniqueNumTestCase, (testCase) => {
    const initial = testCase.index;
    const before = ArrNavigation.cyclePrev<number>(testCase.values, initial, Fun.always).getOrDie(
      'Should always be able to cycle prev on a >= 2 length array'
    );
    // Note, the index is the same as the value, so we can do this.
    const after = ArrNavigation.cycleNext(testCase.values, before, Fun.always).getOrDie(
      'Should always be able to cycle next on a >= 2 length array'
    );

    assert.equal(after, initial);
  }));

  // Cycling across a list of unique numbers of size 2 or greater should be symmetric: before(after(x)) === x
  fc.property(arbUniqueNumTestCase, (testCase) => {
    const initial = testCase.index;
    const after = ArrNavigation.cycleNext<number>(testCase.values, initial, Fun.always).getOrDie(
      'Should always be able to cycle next on a >= 2 length array'
    );
    // Note, the index is the same as the value, so we can do this.
    const before = ArrNavigation.cyclePrev(testCase.values, after, Fun.always).getOrDie(
      'Should always be able to cycle prev on a >= 2 length array'
    );

    assert.equal(before, initial);
  });

  // Cycling next makes an index of 0, or one higher
  fc.assert(fc.property(arbUniqueNumTestCase, (testCase) => {
    const after = ArrNavigation.cycleNext(testCase.values, testCase.index, Fun.always).getOrDie(
      'Should always be able to cycle next on a >= 2 length array'
    );

    return after === 0 || testCase.index + 1 === after;
  }));

  // Cycling prev makes an index of values.length - 1, or one lower
  fc.assert(fc.property(arbUniqueNumTestCase, (testCase) => {
    const before = ArrNavigation.cyclePrev(testCase.values, testCase.index, Fun.always).getOrDie(
      'Should always be able to cycle prev on a >= 2 length array'
    );

    return before === testCase.values.length - 1 || testCase.index - 1 === before;
  }));

  // Unique: Try next should be some(+1) or none
  fc.assert(fc.property(arbUniqueNumTestCase, (testCase) => {
    ArrNavigation.tryNext(testCase.values, testCase.index, Fun.always).fold(
      // Nothing, so we must be at the last index position
      () => assert.equal(testCase.values.length - 1, testCase.index),
      (after) => assert.equal(after, testCase.index + 1)
    );
  }));

  // Unique: Try prev should be some(-1) or none
  fc.assert(fc.property(arbUniqueNumTestCase, (testCase) => {
    ArrNavigation.tryPrev(testCase.values, testCase.index, Fun.always).fold(
      // Nothing, so we must be at the first index position
      () => assert.equal(0, testCase.index),
      (before) => assert.equal(before, testCase.index - 1)
    );
  }));
});
