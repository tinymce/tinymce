import { UnitTest } from '@ephox/bedrock-client';
import { assert } from 'chai';

import { Cleaner } from 'ephox/agar/api/Cleaner';

UnitTest.test('Cleaner', () => {
  const cleaner = Cleaner();
  const token = 'oienoen@';
  let args = [];
  const ret = cleaner.wrap((a, b, c, d) => {
    args = [ a, b, c, d ];
    return token;
  })('a', 3, 2, 'cat');
  assert.deepEqual(args, [ 'a', 3, 2, 'cat' ], 'Cleaner.wrap should pass arguments through');
  assert.equal(ret, token, 'Cleaner.wrap should pass return value up');
});
