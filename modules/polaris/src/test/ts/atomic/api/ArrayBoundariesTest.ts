import { Assert, UnitTest } from '@ephox/bedrock-client';

import * as Boundaries from 'ephox/polaris/array/Boundaries';

UnitTest.test('BoundariesTest', () => {
  const comparator = (a: string, b: string) => {
    return a === b;
  };

  const check = (items: string[], l: string, r: string, pred: (a: string, b: string) => boolean, expected: string[]) => {
    Assert.eq('', Boundaries.boundAt(items, l, r, pred), expected);
  };

  check([ 'a', 'b', 'c', 'd', 'e' ], 'b', 'd', comparator, [ 'b', 'c', 'd' ]);
  check([ 'a', 'b', 'c', 'd', 'e' ], 'a', 'e', comparator, [ 'a', 'b', 'c', 'd', 'e' ]);
  check([ 'a' ], 'a', 'a', comparator, [ 'a' ]);
  check([], '1', '3', comparator, []);
  check([ 'a', 'b', 'c' ], 'd', 'e', comparator, [ 'a', 'b', 'c' ]);
  check([ 'a', 'b', 'c' ], 'd', 'b', comparator, [ 'a', 'b' ]);
  check([ 'a', 'b', 'c' ], 'b', 'g', comparator, [ 'b', 'c' ]);
  check([ 'a', 'b', 'c' ], 'b', 'b', comparator, [ 'b' ]);
});
