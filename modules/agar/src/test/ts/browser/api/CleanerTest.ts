import { Cleaner } from 'ephox/agar/api/Cleaner';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('Cleaner', () => {
  const cleaner = Cleaner();
  const token = 'oienoen@';
  let args = [];
  const ret = cleaner.wrap(function (a, b, c, d) {
    args = [a, b, c, d];
    return token;
  })('a', 3, 2, 'cat');
  assert.eq(['a', 3, 2, 'cat'], args, 'Cleaner.wrap should pass arguments through');
  assert.eq(token, ret, 'Cleaner.wrap should pass return value up');
});
