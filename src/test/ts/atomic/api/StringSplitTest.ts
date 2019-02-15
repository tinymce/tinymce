import { assert, UnitTest } from '@ephox/bedrock';
import * as Strings from 'ephox/polaris/api/Strings';

UnitTest.test('api.Strings.splits', function () {
  const check = function (expected: string[], input: string, points: number[]) {
    const actual = Strings.splits(input, points);
    assert.eq(expected, actual);
  };

  check([ '' ], '', [ ]);
  check([ 'a' ], 'a', [ ]);
  check([ 'a' ], 'a', [ 0 ]);
  check([ 'a' ], 'a', [ 1 ]);
  check([ 'a', 'b', 'c' ], 'abc', [ 0, 1, 2, 3 ]);
  check([ 'ab', 'cdef', 'ghi' ], 'abcdefghi', [ 2, 6 ]);
});
