import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';

import * as Arrays from 'ephox/polaris/api/Arrays';
import { Splitting } from 'ephox/polaris/api/Splitting';

UnitTest.test('api.Arrays.splitby', () => {
  const check = <T>(expected: T[][], input: T[], pred: (x: T) => boolean) => {
    const actual = Arrays.splitby(input, pred);
    Assert.eq('', expected, actual);
  };

  check([], [], Fun.always);
  check([[ 1 ]], [ 1 ], Fun.never);
  check([[ 1, 2, 3 ]], [ 1, 2, 3 ], Fun.never);
  check([[ 1 ], [ 2, 3 ], [ 4, 5, 6 ], [ 7 ], [ 8 ]], [ 1, '|', 2, 3, '|', 4, 5, 6, '|', 7, '|', '|', 8 ], (x) => {
    return x === '|';
  });

  const predicate = (value: string) => {
    if (value === 'x') {
      return Splitting.excludeWithout(value);
    } else if (value === '.') {
      return Splitting.excludeWith(value);
    } else {
      return Splitting.include(value);
    }
  };

  const checkAdv = (expected: string[][], input: string[]) => {
    const actual = Arrays.splitbyAdv(input, predicate);
    Assert.eq('', expected, actual);
  };

  checkAdv([ ], [ ]);
  checkAdv([
    [ '.' ],
    [ '.' ],
    [ 'a', 'b' ],
    [ 'd', 'e', 'f' ],
    [ '.' ],
    [ 'g' ]
  ], [ 'x', 'x', '.', 'x', '.', 'a', 'b', 'x', 'x', 'd', 'e', 'f', '.', 'g' ]);
});
