import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Testable } from '@ephox/dispute';
import fc from 'fast-check';
import * as Arr from 'ephox/katamari/api/Arr';
import { Optional } from 'ephox/katamari/api/Optional';
import { tOptional } from 'ephox/katamari/api/OptionalInstances';

const { tNumber } = Testable;

UnitTest.test('Arr.get: empty', () => {
  Assert.eq('none', Optional.none<number>(), Arr.get<number>([ ], 0), tOptional(tNumber));
});

UnitTest.test('Arr.get: empty with non zero index', () => {
  Assert.eq('none', Optional.none<number>(), Arr.get<number>([ ], 5), tOptional(tNumber));
});

UnitTest.test('Arr.get: invalid index', () => {
  Assert.eq('none', Optional.none<number>(), Arr.get<number>([ ], -1), tOptional(tNumber));
});

UnitTest.test('Arr.get: index out of bounds', () => {
  Assert.eq('none', Optional.none<number>(), Arr.get<number>([ 10, 20, 30 ], 5), tOptional(tNumber));
});

UnitTest.test('Arr.get: valid index', () => {
  Assert.eq('expected number', Optional.some(13), Arr.get<number>([ 10, 20, 30, 13 ], 3), tOptional(tNumber));
});

UnitTest.test('Arr.get: fc valid index', () => {
  fc.assert(fc.property(fc.array(fc.integer()), fc.integer(), fc.integer(), (array, h, t) => {
    const arr = [ h ].concat(array);
    const length = arr.push(t);
    const midIndex = Math.round(arr.length / 2);

    Assert.eq('expected number', Optional.some(h), Arr.get(arr, 0), tOptional(tNumber));
    Assert.eq('expected number', Optional.some(arr[midIndex]), Arr.get(arr, midIndex), tOptional(tNumber));
    Assert.eq('expected number', Optional.some(t), Arr.get(arr, length - 1), tOptional(tNumber));
  }));
});
