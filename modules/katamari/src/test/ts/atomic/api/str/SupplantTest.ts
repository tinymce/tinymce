import * as Strings from 'ephox/katamari/api/Strings';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('supplant', function() {
  function check(expected, str, obj) {
    const actual = Strings.supplant(str, obj);
    assert.eq(expected, actual);
  }

  check('', '', {});
  check('', '', {cat: 'dog'});
  check('a', 'a', {});
  check('${a}', '${a}', {a: function(){}});
  check('toaster', '${a}', {a: 'toaster'});
  check('cattoastera', 'cat${a}a', {a: 'toaster'});
});

