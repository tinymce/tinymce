import { assert, UnitTest } from '@ephox/bedrock';
import * as Logger from 'ephox/agar/api/Logger';

UnitTest.test('LoggerTest', function () {
  try {
    Logger.sync('test 1. Foo is not a function', function () {
      const x: any = {};
      x.foo(); // This line number is asserted ... so keep it up to date !
      return x;
    });
    assert.fail('Expected test1 to fail');
  } catch (err) {
    assert.eq(0,
      err.message.indexOf('test 1. Foo is not a function\nTypeError:'),
      'Expected enchanced error message.'
    );
  }
});

