import Logger from 'ephox/agar/api/Logger';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('LoggerTest', function() {
  try {
    Logger.sync('test 1. Foo is not a function', function () {
      var x: any =  {};
      x.foo(); // This line number is asserted ... so keep it up to date !
      return x;
    });
    assert.fail('Expected test1 to fail');
  } catch (err) {
    assert.eq('test 1. Foo is not a function\nTypeError: x.foo is not a function', err.message);
  }
});

