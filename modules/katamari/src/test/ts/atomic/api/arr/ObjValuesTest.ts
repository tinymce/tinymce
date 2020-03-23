import * as Obj from 'ephox/katamari/api/Obj';
import { UnitTest, Assert } from '@ephox/bedrock-client';

UnitTest.test('Obj.values', () => {
  const check = (expValues, input) => {
    const c = (expected, v) => {
      v.sort();
      Assert.eq('values', expected, v);
    };
    c(expValues, Obj.values(input));
  };

  check([], {});
  check([ 'A' ], { a: 'A' });
  check([ 'A', 'B', 'C' ], { a: 'A', c: 'C', b: 'B' });
});
