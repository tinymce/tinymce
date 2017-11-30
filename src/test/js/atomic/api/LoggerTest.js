test(
  'LoggerTest',

  [
    'ephox.agar.api.LegacyAssert',
    'ephox.agar.api.Logger'
  ],

  function (LegacyAssert, Logger) {

    try {
      Logger.sync('test 1. Foo is not a function', function () {
        var x =  {};
        x.foo(); // This line number is asserted ... so keep it up to date !
        return x;
      });
      LegacyAssert.fail('Expected test1 to fail');
    } catch (err) {
      LegacyAssert.eq('test 1. Foo is not a function\nTypeError: x.foo is not a function', err.message);
      LegacyAssert.eq(true, err.stack.indexOf('LoggerTest.js:13') > -1, 'The stack trace did not contain the line number where the error was originally thrown.');
    }
  }
);