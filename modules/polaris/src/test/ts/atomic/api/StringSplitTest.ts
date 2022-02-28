import { Assert, UnitTest } from '@ephox/bedrock-client';

import * as Strings from 'ephox/polaris/api/Strings';

UnitTest.test('api.Strings.splits', () => {
  const check = (expected: string[], input: string, points: number[]) => {
    const actual = Strings.splits(input, points);
    Assert.eq('', expected, actual);
  };

  check([ '' ], '', [ ]);
  check([ 'a' ], 'a', [ ]);
  check([ 'a' ], 'a', [ 0 ]);
  check([ 'a' ], 'a', [ 1 ]);
  check([ 'a', 'b', 'c' ], 'abc', [ 0, 1, 2, 3 ]);
  check([ 'ab', 'cdef', 'ghi' ], 'abcdefghi', [ 2, 6 ]);
});
