test(
  'LoggerTest',

  [
    'ephox.agar.api.Logger'
  ],

  function (Logger) {

    try {
      Logger.sync('test 1. Foo is not a function', function () {
        var x =  {};
        x.foo(); // This line number is asserted ... so keep it up to date !
        return x;
      });
      assert.fail('Expected test1 to fail');
    } catch (err) {
      assert.eq('test 1. Foo is not a function\nTypeError: x.foo is not a function', err.message);
      assert.eq(true, err.stack.indexOf('LoggerTest.js:13') > -1, 'The stack trace did not contain the line number where the error was originally thrown.');
    }
  }
);