test(
  'ValidateTest',

  [
    'ephox.katamari.api.Fun',
    'ephox.katamari.util.Validate',
    'global!NaN',
    'global!Number'
  ],

  function (Fun, Validate, NaN, Number) {
    var checkError = function (operation, message) {
      try {
        operation();
        assert.fail('Expected error not thrown: ' + message);
      } catch (err) {
        assert.eq(message, err.message);
      }
    };

    var checkNum = function (number, expected) {
      assert.eq(Validate.pNum(number), expected);
    };

    checkError(Fun.curry(Validate.vNat, 'num', 'hello'), 'num was not a number. Was: hello (string)');
    checkError(Fun.curry(Validate.vInt, 'num', 'hello'), 'num was not a number. Was: hello (string)');
    checkError(Fun.curry(Validate.vChar, 'num', 'hello'), 'num was not a single char. Was: hello');

    checkNum(0, true);
    checkNum(3, true);
    checkNum(3.2, true);
    checkNum(012, true);
    checkNum(-14, true);
    checkNum(null, false);
    checkNum(NaN, false);
    checkNum(undefined, false);
    checkNum(Number.POSITIVE_INFINITY, false);
    checkNum(Number.NEGATIVE_INFINITY, false);
    checkNum('12px', false);
    checkNum('hello', false);
    checkNum('xx-large', false);
    checkNum('12%', false);

  }
);