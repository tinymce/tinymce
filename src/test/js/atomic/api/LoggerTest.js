import LegacyAssert from 'ephox/agar/api/LegacyAssert';
import Logger from 'ephox/agar/api/Logger';
import { UnitTest } from '@ephox/refute';

UnitTest.test('LoggerTest', function() {
  try {
    Logger.sync('test 1. Foo is not a function', function () {
      var x =  {};
      x.foo(); // This line number is asserted ... so keep it up to date !
      return x;
    });
    LegacyAssert.fail('Expected test1 to fail');
  } catch (err) {
    LegacyAssert.eq('test 1. Foo is not a function\nTypeError: x.foo is not a function', err.message);
    LegacyAssert.eq(true, err.stack.indexOf('LoggerTest.js:12') > -1, 'The stack trace did not contain the line number where the error was originally thrown.');
  }
});

