import Arr from 'ephox/katamari/api/Arr';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest, assert } from '@ephox/refute';

UnitTest.test('ChunkTest', function() {
  var check = function (expected, initial, size) {
    assert.eq(expected, Arr.chunk(initial, size));
  };

  check([[ 1, 2, 3 ], [4, 5, 6 ]],  [ 1, 2, 3, 4, 5, 6 ],  3);
  check([[ 1, 2, 3, 4, 5, 6 ]],  [ 1, 2, 3, 4, 5, 6 ],  6);
  check([[ 1, 2, 3, 4, 5, 6 ]],  [ 1, 2, 3, 4, 5, 6 ],  12);
  check([[ 1 ], [ 2 ], [ 3 ], [ 4 ], [ 5 ], [ 6 ]],  [ 1, 2, 3, 4, 5, 6 ],  1);
  check([[ 1, 2, 3, 4 ], [ 5, 6, 7, 8 ], [ 9, 10 ]],  [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ],  4);
  check([], [], 2);

  Jsc.property(
    'Chunking should create an array of the appropriate length except for the last one',
    Jsc.array(Jsc.json),
    Jsc.nat,
    function (arr, rawChunkSize) {
      // ensure chunkSize is at least one
      var chunkSize = rawChunkSize + 1;
      var chunks = Arr.chunk(arr, chunkSize);

      var hasRightSize = function (part) {
        return part.length === chunkSize;
      };

      var numChunks = chunks.length;
      var firstParts = chunks.slice(0, numChunks - 1);
      if (! Arr.forall(firstParts, hasRightSize)) return 'Incorrect chunk size';
      return arr.length === 0 ? Jsc.eq([ ], chunks) : chunks[chunks.length - 1].length <= chunkSize;
    }
  );
});

