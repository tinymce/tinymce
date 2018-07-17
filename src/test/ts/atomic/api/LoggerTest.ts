import { assert, UnitTest } from '@ephox/bedrock';
import { PlatformDetection } from '@ephox/sand';
import * as Logger from 'ephox/agar/api/Logger';

UnitTest.test('LoggerTest', function() {
  try {
    Logger.sync('test 1. Foo is not a function', function () {
      const x: any =  {};
      x.foo(); // This line number is asserted ... so keep it up to date !
      return x;
    });
    assert.fail('Expected test1 to fail');
  } catch (err) {
    const platform = PlatformDetection.detect();
    const browser = platform.browser;
    if (browser.isIE() || browser.isEdge()) {
      assert.eq("test 1. Foo is not a function\nTypeError: Object doesn't support property or method 'foo'", err.message);  
    } else {
      assert.eq("test 1. Foo is not a function\nTypeError: x.foo is not a function", err.message);
    }
  }
});

