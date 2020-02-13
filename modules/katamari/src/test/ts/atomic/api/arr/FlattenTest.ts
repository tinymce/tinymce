import * as Arr from 'ephox/katamari/api/Arr';
import { UnitTest, assert, Assert } from '@ephox/bedrock-client';
import fc from 'fast-check';

UnitTest.test('Arr.flatten: unit tests', () => {
  const check = (expected: number[], input: number[][]) => {
    assert.eq(expected, Arr.flatten(input));
  };

  check([], []);
  check([ 1 ], [ [ 1 ] ]);
  check([ 1, 2 ], [ [ 1 ], [ 2 ] ]);
  check([ 1, 2, 3, 4, 5 ], [ [ 1, 2 ], [], [ 3 ], [ 4, 5 ], [] ]);
});

UnitTest.test('Arr.flatten: consistent with chunking', () => {
  fc.assert(fc.property(
    fc.array(fc.integer()),
    fc.integer(1, 5),
    (arr, chunkSize) => {
      const chunks = Arr.chunk(arr, chunkSize);
      const bound = Arr.flatten(chunks);
      return Assert.eq('chunking', arr, bound);
    }
  ));
});

UnitTest.test('Arr.flatten: Wrap then flatten array is identity', () => {
  fc.assert(fc.property(fc.array(fc.integer()), (arr) => {
    Assert.eq('wrap then flatten', Arr.flatten(Arr.pure(arr)), arr);
  }));
});

UnitTest.test('Mapping pure then flattening array is identity', () => {
  fc.assert(fc.property(fc.array(fc.integer()), (arr) => {
    Assert.eq('map pure then flatten', Arr.flatten(Arr.map(arr, Arr.pure)), arr);
  }));
});

UnitTest.test('Flattening two lists === concat', () => {
  fc.assert(fc.property(fc.array(fc.integer()), fc.array(fc.integer()), (xs, ys) => {
    Assert.eq('flatten/concat', Arr.flatten([ xs, ys ]), xs.concat(ys));
  }));
});
