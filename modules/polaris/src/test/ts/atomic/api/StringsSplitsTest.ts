import { Assert, describe, it } from '@ephox/bedrock-client';

import * as Strings from 'ephox/polaris/api/Strings';

describe('atomic.polaris.api.StringsSplitsTest', () => {
  const check = (expected: string[], input: string, points: number[]) => {
    const actual = Strings.splits(input, points);
    Assert.eq('', expected, actual);
  };

  it('should chunk a string into substrings based on the given indices', () => {
    check([ '' ], '', [ ]);
    check([ 'a' ], 'a', [ ]);
    check([ 'a' ], 'a', [ 0 ]);
    check([ 'a' ], 'a', [ 1 ]);
    check([ 'a', 'b', 'c' ], 'abc', [ 0, 1, 2, 3 ]);
    check([ 'ab', 'cdef', 'ghi' ], 'abcdefghi', [ 2, 6 ]);
  });
});
