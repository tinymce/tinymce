define(
  'ephox.agar.demo.TestUtils',

  [
    'global!Error'
  ],

  function (Error) {
     return function () {
      window.assert = {
        eq: function (exp, act, message) {
          if (exp !== act) throw Error(message !== undefined ? message : ('Expected: ' + exp + ', Actual: ' + act));
        }
      };
    };
  }
);