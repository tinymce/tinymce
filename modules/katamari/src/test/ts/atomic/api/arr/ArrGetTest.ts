import { describe, it } from '@ephox/bedrock-client';
import fc from 'fast-check';

import * as Arr from 'ephox/katamari/api/Arr';
import { assertNone, assertSome } from 'ephox/katamari/test/AssertOptional';

describe('atomic.katamari.api.arr.ArrGetTest', () => {
  it('returns none for element of empty list', () => {
    fc.assert(fc.property(fc.integer(), (n) => {
      assertNone(Arr.get<number>([], n));
    }));
  });

  it('returns none for element 0 of empty list', () => {
    assertNone(Arr.get<number>([], 0));
  });

  it('returns none for non-zero index of empty list', () => {
    assertNone(Arr.get<number>([], 5));
  });

  it('returns none for invalid index', () => {
    assertNone(Arr.get<number>([], -1));
  });

  it('returns none for index out of bounds', () => {
    assertNone(Arr.get<number>([ 10, 20, 30 ], 5));
  });

  it('returns some for valid index (unit test)', () => {
    assertSome(Arr.get<number>([ 10, 20, 30, 13 ], 3), 13);
  });

  it('returns some for valid index (property test)', () => {
    fc.assert(fc.property(fc.array(fc.integer()), fc.integer(), fc.integer(), (array, h, t) => {
      const arr = [ h ].concat(array);
      const length = arr.push(t);
      const midIndex = Math.round(arr.length / 2);

      assertSome(Arr.get(arr, 0), h);
      assertSome(Arr.get(arr, midIndex), arr[midIndex]);
      assertSome(Arr.get(arr, length - 1), t);
    }));
  });
});
