define(
  'ephox.sand.test.Asserts',

  [

  ],

  function () {
    var assertEq = function (expected, actual, message) {
      try {
        assert.eq(expected, actual);
      } catch (err) {
        console.log('** Error during test: ' + message + ' **\n');
        throw err;
      }
    };

    return {
      assertEq: assertEq
    };
  }
);