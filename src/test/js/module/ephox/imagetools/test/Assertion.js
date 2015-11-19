define(
  'ephox/imagetools/test/Assertion',

  [

  ],

  function () {
    var assertEq = function (expected, actual, label) {
      assert.eq(expected, actual, 'test: ' + label + ', expected = ' + expected + ', actual = ' + actual);
      console.log('passed');
    };

    return {
      assertEq: assertEq
    };
  }
);