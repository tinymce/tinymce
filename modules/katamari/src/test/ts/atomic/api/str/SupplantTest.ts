import { Assert, UnitTest } from '@ephox/bedrock-client';
import * as Fun from 'ephox/katamari/api/Fun';
import * as Strings from 'ephox/katamari/api/Strings';

UnitTest.test('supplant', function () {
  function check(expected, str, obj) {
    const actual = Strings.supplant(str, obj);
    Assert.eq('eq', expected, actual);
  }

  check('', '', {});
  check('', '', { cat: 'dog' });
  check('a', 'a', {});
  check('${a}', '${a}', { a: Fun.noop });
  check('toaster', '${a}', { a: 'toaster' });
  check('cattoastera', 'cat${a}a', { a: 'toaster' });
});
